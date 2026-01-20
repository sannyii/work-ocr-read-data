'use client';

import Link from 'next/link';
import { CalendarView } from '@/components/CalendarView';

export default function HistoryPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
                                        历史记录
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* 导航 */}
                        <nav className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                上传识别
                            </Link>
                            <Link
                                href="/history"
                                className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600"
                            >
                                历史记录
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <CalendarView />
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
