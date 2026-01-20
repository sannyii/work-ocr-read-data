import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage, BrandData } from '@/lib/doubao';

export interface OCRRequestBody {
    images: string[]; // Base64 encoded images
}

export interface OCRResponse {
    success: boolean;
    data?: BrandData[];
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
        const results = await Promise.all(
            body.images.map(async (image, index) => {
                const result = await analyzeImage(image);
                return {
                    index,
                    result
                };
            })
        );

        const successData: BrandData[] = [];
        const errors: string[] = [];

        results.forEach(({ index, result }) => {
            if (result.success && result.data) {
                successData.push(result.data);
            } else {
                errors.push(`图片 ${index + 1}: ${result.error || '识别失败'}`);
            }
        });

        // 合并相同品牌的数据
        const mergedData = mergeBrandData(successData);

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

// 合并相同品牌的数据
function mergeBrandData(dataList: BrandData[]): BrandData[] {
    const brandMap = new Map<string, BrandData>();

    dataList.forEach(data => {
        const normalizedBrand = data.brand.trim();

        if (brandMap.has(normalizedBrand)) {
            // 合并文章到已存在的品牌
            const existing = brandMap.get(normalizedBrand)!;
            existing.articles = [...existing.articles, ...data.articles];
        } else {
            // 新品牌
            brandMap.set(normalizedBrand, {
                brand: normalizedBrand,
                articles: [...data.articles]
            });
        }
    });

    return Array.from(brandMap.values());
}
