import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, CardData, BrandGroup } from '@/lib/doubao';

export interface OCRRequestBody {
    images: string[]; // Base64 encoded images
}

export interface OCRResponse {
    success: boolean;
    data?: BrandGroup[];
    errors?: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<OCRResponse>> {
    try {
        const body: OCRRequestBody = await request.json();

        if (!body.images || !Array.isArray(body.images) || body.images.length === 0) {
            return NextResponse.json({
                success: false,
                errors: ['请上传至少一张图片']
            }, { status: 400 });
        }

        // 并行处理所有图片
        const ocrResults = await Promise.all(
            body.images.map(async (image, index) => {
                const result = await analyzeImage(image);
                return {
                    imageIndex: index,
                    result
                };
            })
        );

        const allCards: CardData[] = [];
        const errors: string[] = [];

        // 收集所有 Card 数据，并按图片顺序处理
        // 注意：Promise.all 返回顺序与输入一致，所以 imageIndex 0 的结果在前
        ocrResults.forEach(({ imageIndex, result }) => {
            if (result.success && result.data) {
                // 为同一张图片里的 cards 分配来源标签？
                // 需求：默认所有Card按照 小绿书1 小绿书2 这样顺序
                // 我们先把所有 card 收集起来，保持图片顺序，以及图片内 card 的顺序
                allCards.push(...result.data);
            } else {
                errors.push(`图片 ${imageIndex + 1}: ${result.error || '识别失败'}`);
            }
        });

        // 分配 "小绿书 X" 标签
        // 按照 allCards 的顺序（即图片上传顺序 + 图片内解析顺序）
        allCards.forEach((card, index) => {
            card.sourceLabel = `小绿书${index + 1}`;
        });

        // 计算 Headline Rank (头条排名)
        // 需求：条数最多的Card为头条1 头条2 这样
        const cardsByArticleCount = [...allCards].sort((a, b) => b.articles.length - a.articles.length);
        cardsByArticleCount.forEach((card, index) => {
            card.headlineRank = index + 1;
        });

        // 最终标签逻辑：
        // 1. 如果是头条 (Top 2 by count) -> 文章显示 "头条1", "头条2"...
        // 2. 如果是其他 (小绿书):
        //    - 如果 Card 只有1篇文章 -> "小绿书"
        //    - 如果 Card 有多篇文章 -> "小绿书1", "小绿书2"...
        allCards.forEach(card => {
            const isHeadline = card.headlineRank && card.headlineRank <= 2;

            card.articles.forEach((article, index) => {
                if (isHeadline) {
                    article.positionLabel = `头条${index + 1}`;
                } else {
                    if (card.articles.length === 1) {
                        article.positionLabel = '小绿书';
                    } else {
                        article.positionLabel = `小绿书${index + 1}`;
                    }
                }
            });

            // 为了兼容旧逻辑（如果 UI 还在用 card.sourceLabel），也可以保留 card 级别的 label，
            // 但目前的 DataTable 已经准备好显示 article 级别的 label 了吗？
            // 看之前的 DataTable 代码，它是用 card.sourceLabel。
            // 我们需要更新 DataTable 使用 article.positionLabel。
            // 这里可以先清理 card.sourceLabel 以免混淆，或者保留作为 fallback。
            card.sourceLabel = isHeadline ? `头条${card.headlineRank}` : `小绿书`;
        });

        // 合并为 BrandGroup
        const mergedData = groupCardsByBrand(allCards);

        return NextResponse.json({
            success: errors.length === 0,
            data: mergedData,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('OCR API error:', error);
        return NextResponse.json({
            success: false,
            errors: [`服务器错误: ${error instanceof Error ? error.message : '未知错误'}`]
        }, { status: 500 });
    }
}

// 按品牌分组 Cards
function groupCardsByBrand(cards: CardData[]): BrandGroup[] {
    const brandMap = new Map<string, BrandGroup>();

    cards.forEach(card => {
        const normalizedBrand = card.brand.trim();

        if (!brandMap.has(normalizedBrand)) {
            brandMap.set(normalizedBrand, {
                brand: normalizedBrand,
                cards: []
            });
        }

        brandMap.get(normalizedBrand)!.cards.push(card);
    });

    return Array.from(brandMap.values());
}
