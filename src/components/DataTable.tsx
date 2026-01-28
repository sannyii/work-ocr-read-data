'use client';

import { BrandGroup } from '@/lib/doubao';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DataTableProps {
    data: BrandGroup[];
    date: string;
}

// 格式化数字显示
function formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) {
        return '-';
    }
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

            {data.map((brandGroup, brandIndex) => (
                <div key={brandIndex} className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                        {brandGroup.brand}
                    </h3>

                    {brandGroup.cards.map((card, cardIndex) => (
                        <Card key={cardIndex} className="overflow-hidden border-l-4 border-l-blue-500">
                            <CardHeader className="bg-slate-50 dark:bg-slate-900 py-3">
                                <CardTitle className="flex items-center justify-between text-base">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">
                                            {card.date}
                                        </span>
                                    </div>
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                        共 {card.articles.length} 篇文章
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
                                            <TableHead className="w-32 text-center">文章位置</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {card.articles.map((article, articleIndex) => (
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
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={
                                                        card.sourceLabel?.startsWith('头条')
                                                            ? "bg-orange-50 text-orange-600 border-orange-200"
                                                            : "bg-slate-50 text-slate-600 border-slate-200"
                                                    }>
                                                        {card.sourceLabel}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ))}
        </div>
    );
}
