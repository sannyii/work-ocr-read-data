'use client';

import { BrandData } from '@/lib/doubao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface DataTableProps {
    data: BrandData[];
    date: string;
}

// 格式化数字显示
function formatNumber(num: number): string {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

export function DataTable({ data, date }: DataTableProps) {
    if (data.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">识别结果</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    日期：{date}
                </span>
            </div>

            {data.map((brandData, brandIndex) => (
                <Card key={brandIndex} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        <CardTitle className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            {brandData.brand}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                共 {brandData.articles.length} 篇文章
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>文章标题</TableHead>
                                    <TableHead className="w-24 text-right">阅读数</TableHead>
                                    <TableHead className="w-24 text-right">点赞数</TableHead>
                                    <TableHead className="w-24 text-right">转发数</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {brandData.articles.map((article, articleIndex) => (
                                    <TableRow key={articleIndex}>
                                        <TableCell className="font-medium text-gray-500">
                                            {articleIndex + 1}
                                        </TableCell>
                                        <TableCell className="font-medium">{article.title}</TableCell>
                                        <TableCell className="text-right text-blue-600 dark:text-blue-400">
                                            {formatNumber(article.reads)}
                                        </TableCell>
                                        <TableCell className="text-right text-orange-600 dark:text-orange-400">
                                            {formatNumber(article.likes)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600 dark:text-green-400">
                                            {article.shares !== undefined ? formatNumber(article.shares) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
