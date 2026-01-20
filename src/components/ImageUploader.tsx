'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ImageUploaderProps {
    onImagesSelected: (images: string[]) => void;
    isLoading?: boolean;
}

export function ImageUploader({ onImagesSelected, isLoading }: ImageUploaderProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files).filter(file =>
            file.type.startsWith('image/')
        );

        const base64Promises = fileArray.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        try {
            const base64Images = await Promise.all(base64Promises);
            setPreviews(prev => [...prev, ...base64Images]);
        } catch (error) {
            console.error('读取文件失败:', error);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    const removeImage = useCallback((index: number) => {
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }, []);

    const clearAll = useCallback(() => {
        setPreviews([]);
    }, []);

    const handleStartOCR = useCallback(() => {
        if (previews.length > 0) {
            onImagesSelected(previews);
        }
    }, [previews, onImagesSelected]);

    return (
        <div className="space-y-4">
            {/* 上传区域 */}
            <Card
                className={`border-2 border-dashed transition-colors cursor-pointer ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                    }`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <CardContent className="p-8 text-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-blue-600 dark:text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                                拖拽图片到这里，或点击选择
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                支持 PNG、JPG、JPEG 格式，可多选
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 预览区域 */}
            {previews.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">
                                已选择 {previews.length} 张图片
                            </h3>
                            <Button variant="outline" size="sm" onClick={clearAll}>
                                清空所有
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={src}
                                        alt={`预览 ${index + 1}`}
                                        className="w-full h-40 object-cover rounded-lg border"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-center">
                            <Button
                                size="lg"
                                onClick={handleStartOCR}
                                disabled={isLoading}
                                className="px-8"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        识别中...
                                    </>
                                ) : (
                                    '开始 OCR 识别'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
