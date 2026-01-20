'use client';

import { BrandData } from './doubao';

export interface DailyRecord {
    date: string; // YYYY-MM-DD
    brands: BrandData[];
    createdAt: number;
    updatedAt: number;
}

const STORAGE_KEY = 'ocr_daily_records';

// 获取所有记录
export function getAllRecords(): Record<string, DailyRecord> {
    if (typeof window === 'undefined') return {};

    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

// 获取指定日期的记录
export function getRecordByDate(date: string): DailyRecord | null {
    const records = getAllRecords();
    return records[date] || null;
}

// 保存指定日期的记录
export function saveRecord(date: string, brands: BrandData[]): DailyRecord {
    const records = getAllRecords();
    const now = Date.now();

    const record: DailyRecord = {
        date,
        brands,
        createdAt: records[date]?.createdAt || now,
        updatedAt: now
    };

    records[date] = record;

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    return record;
}

// 删除指定日期的记录
export function deleteRecord(date: string): boolean {
    const records = getAllRecords();

    if (records[date]) {
        delete records[date];
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        }
        return true;
    }

    return false;
}

// 获取有记录的所有日期
export function getRecordedDates(): string[] {
    const records = getAllRecords();
    return Object.keys(records).sort().reverse();
}

// 获取指定月份有记录的日期
export function getRecordedDatesInMonth(year: number, month: number): string[] {
    const records = getAllRecords();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;

    return Object.keys(records)
        .filter(date => date.startsWith(prefix))
        .sort();
}

// 格式化日期
export function formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 获取今天日期
export function getTodayDate(): string {
    return formatDate(new Date());
}
