'use client';

import { Button } from '@/components/ui/button';
import { BrandData } from '@/lib/doubao';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
    data: BrandData[];
    date: string;
}

export function ExportButton({ data, date }: ExportButtonProps) {
    const handleExport = () => {
        if (data.length === 0) return;

        // 创建工作簿
        const wb = XLSX.utils.book_new();

        // 准备所有数据的汇总表
        const summaryData: (string | number)[][] = [
            ['品牌', '文章标题', '阅读数', '点赞数', '转发数']
        ];

        data.forEach(brandData => {
            brandData.articles.forEach(article => {
                summaryData.push([
                    brandData.brand,
                    article.title,
                    article.reads,
                    article.likes,
                    article.shares ?? 0
                ]);
            });
        });

        // 创建汇总工作表
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

        // 设置列宽
        summaryWs['!cols'] = [
            { wch: 15 },  // 品牌
            { wch: 60 },  // 标题
            { wch: 12 },  // 阅读数
            { wch: 10 },  // 点赞数
            { wch: 10 },  // 转发数
        ];

        XLSX.utils.book_append_sheet(wb, summaryWs, '汇总');

        // 为每个品牌创建单独的工作表
        data.forEach(brandData => {
            const brandSheetData: (string | number)[][] = [
                ['序号', '文章标题', '阅读数', '点赞数', '转发数']
            ];

            brandData.articles.forEach((article, index) => {
                brandSheetData.push([
                    index + 1,
                    article.title,
                    article.reads,
                    article.likes,
                    article.shares ?? 0
                ]);
            });

            const brandWs = XLSX.utils.aoa_to_sheet(brandSheetData);
            brandWs['!cols'] = [
                { wch: 6 },   // 序号
                { wch: 60 },  // 标题
                { wch: 12 },  // 阅读数
                { wch: 10 },  // 点赞数
                { wch: 10 },  // 转发数
            ];

            // 清理品牌名中的特殊字符作为工作表名
            const sheetName = brandData.brand.replace(/[\\/?*[\]]/g, '').substring(0, 31);
            XLSX.utils.book_append_sheet(wb, brandWs, sheetName);
        });

        // 导出文件
        const fileName = `公众号数据_${date}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (data.length === 0) {
        return null;
    }

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            导出 Excel
        </Button>
    );
}
