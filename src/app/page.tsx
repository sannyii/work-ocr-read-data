'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ImageUploader } from '@/components/ImageUploader';
import { DataTable } from '@/components/DataTable';
import { ExportButton } from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { BrandData } from '@/lib/doubao';
import { saveRecord, getRecordByDate, getTodayDate, deleteRecord } from '@/lib/storage';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<BrandData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [currentDate] = useState(() => getTodayDate());

  // 页面加载时检查是否有今日记录
  useEffect(() => {
    const todayRecord = getRecordByDate(currentDate);
    if (todayRecord) {
      setResults(todayRecord.brands);
      setIsSaved(true);
    }
  }, [currentDate]);

  const handleImagesSelected = async (images: string[]) => {
    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // 合并新数据到现有结果
        const mergedResults = mergeResults(results, data.data);
        setResults(mergedResults);

        // 自动保存到当天
        saveRecord(currentDate, mergedResults);
        setIsSaved(true);
      }

      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
    } catch (error) {
      setErrors([`请求失败: ${error instanceof Error ? error.message : '未知错误'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  // 合并相同品牌的结果
  const mergeResults = (existing: BrandData[], newData: BrandData[]): BrandData[] => {
    const brandMap = new Map<string, BrandData>();

    // 先添加现有数据
    existing.forEach(brand => {
      brandMap.set(brand.brand, { ...brand, articles: [...brand.articles] });
    });

    // 合并新数据
    newData.forEach(brand => {
      if (brandMap.has(brand.brand)) {
        const existing = brandMap.get(brand.brand)!;
        existing.articles = [...existing.articles, ...brand.articles];
      } else {
        brandMap.set(brand.brand, { ...brand, articles: [...brand.articles] });
      }
    });

    return Array.from(brandMap.values());
  };

  const handleClearToday = () => {
    if (confirm('确定要清空今日的所有识别结果吗？')) {
      deleteRecord(currentDate);
      setResults([]);
      setIsSaved(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  公众号数据提取器
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  OCR 识别 · 智能提取 · Excel 导出
                </p>
              </div>
            </div>

            {/* 导航和操作按钮 */}
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600"
                >
                  上传识别
                </Link>
                <Link
                  href="/history"
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  历史记录
                </Link>
              </nav>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <ExportButton data={results} date={currentDate} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* 今日状态提示 */}
          {isSaved && results.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 dark:text-green-200">
                  今日 ({currentDate}) 已有 {results.reduce((sum, b) => sum + b.articles.length, 0)} 篇文章记录，继续上传会自动合并
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleClearToday}>
                清空今日数据
              </Button>
            </div>
          )}

          {/* 上传区域 */}
          <section>
            <ImageUploader
              onImagesSelected={handleImagesSelected}
              isLoading={isLoading}
            />
          </section>

          {/* 错误提示 */}
          {errors.length > 0 && (
            <section className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">识别过程中出现问题：</h3>
              <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </section>
          )}

          {/* 数据表格 */}
          {results.length > 0 && (
            <section>
              <DataTable data={results} date={currentDate} />
            </section>
          )}

          {/* 空状态 */}
          {results.length === 0 && !isLoading && (
            <section className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                还没有数据
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                上传微信公众号截图，开始提取文章数据
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-slate-900/50 mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
          支持品牌：新智元、量子位、机器之心 及其他公众号
        </div>
      </footer>
    </main>
  );
}
