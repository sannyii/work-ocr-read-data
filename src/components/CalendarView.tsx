'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    getRecordedDatesInMonth,
    getRecordByDate,
    deleteRecord,
    DailyRecord
} from '@/lib/storage';
import { DataTable } from './DataTable';
import { ExportButton } from './ExportButton';

interface CalendarViewProps {
    onRecordDeleted?: () => void;
}

export function CalendarView({ onRecordDeleted }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // 获取当月有记录的日期
    const recordedDates = useMemo(() => {
        return getRecordedDatesInMonth(year, month);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month, refreshKey]);

    // 生成日历数据
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: Array<{ date: string; day: number; hasRecord: boolean } | null> = [];

        // 填充前面的空白
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // 填充日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            days.push({
                date: dateStr,
                day,
                hasRecord: recordedDates.includes(dateStr)
            });
        }

        return days;
    }, [year, month, recordedDates]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1));
        setSelectedDate(null);
        setSelectedRecord(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month, 1));
        setSelectedDate(null);
        setSelectedRecord(null);
    };

    const handleDateClick = (dateStr: string, hasRecord: boolean) => {
        if (hasRecord) {
            setSelectedDate(dateStr);
            setSelectedRecord(getRecordByDate(dateStr));
        }
    };

    const handleDeleteRecord = () => {
        if (selectedDate) {
            if (confirm(`确定要删除 ${selectedDate} 的记录吗？`)) {
                deleteRecord(selectedDate);
                setSelectedDate(null);
                setSelectedRecord(null);
                setRefreshKey(prev => prev + 1);
                onRecordDeleted?.();
            }
        }
    };

    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
        <div className="space-y-6">
            {/* 日历卡片 */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                            ← 上月
                        </Button>
                        <CardTitle className="text-xl">
                            {year} 年 {month} 月
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                            下月 →
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* 星期标题 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div
                                key={day}
                                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* 日期格子 */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((dayInfo, index) => (
                            <div
                                key={index}
                                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg
                  transition-all cursor-pointer
                  ${!dayInfo ? 'invisible' : ''}
                  ${dayInfo?.hasRecord
                                        ? 'bg-blue-500 text-white hover:bg-blue-600 font-medium'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    }
                  ${selectedDate === dayInfo?.date
                                        ? 'ring-2 ring-blue-600 ring-offset-2'
                                        : ''
                                    }
                `}
                                onClick={() => dayInfo && handleDateClick(dayInfo.date, dayInfo.hasRecord)}
                            >
                                {dayInfo?.day}
                            </div>
                        ))}
                    </div>

                    {/* 图例 */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span>有记录</span>
                        </div>
                        <span className="text-gray-400">点击蓝色日期查看详情</span>
                    </div>
                </CardContent>
            </Card>

            {/* 选中日期的详情 */}
            {selectedRecord && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span>{selectedDate} 的识别记录</span>
                                <span className="text-sm font-normal text-gray-500">
                                    (上次更新: {new Date(selectedRecord.updatedAt).toLocaleString('zh-CN')})
                                </span>
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <ExportButton data={selectedRecord.brands} date={selectedDate || ''} />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDeleteRecord}
                                >
                                    删除记录
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable data={selectedRecord.brands} date={selectedDate || ''} />
                    </CardContent>
                </Card>
            )}

            {/* 未选中提示 */}
            {!selectedRecord && recordedDates.length > 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    点击日历中的蓝色日期查看详细记录
                </div>
            )}

            {/* 空状态 */}
            {recordedDates.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    本月暂无识别记录
                </div>
            )}
        </div>
    );
}
