'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, File, Folder } from 'lucide-react';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    albumId: string | null;
    onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, albumId, onSuccess }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        // Using unsigned upload for simplicity as per requirements (openness prioritized)
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        return await response.json();
    };

    const handleUpload = async () => {
        if (files.length === 0 || !albumId) return;

        setUploading(true);
        setProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const res = await uploadToCloudinary(file);

                if (res.secure_url) {
                    const type = file.type.startsWith('video') ? 'video' : 'image';
                    await fetch('/api/media', {
                        method: 'POST',
                        body: JSON.stringify({
                            album_id: albumId,
                            type,
                            url: res.secure_url,
                            title: file.name.split('.')[0],
                        }),
                    });
                }
                setProgress(Math.round(((i + 1) / files.length) * 100));
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('アップロードに失敗しました。');
        } finally {
            setUploading(false);
            setFiles([]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">メディアをアップロード</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 hover:border-[#db7093] hover:bg-[#db7093]/5 rounded-2xl transition-all"
                        >
                            <File className="w-8 h-8 text-[#db7093]" />
                            <span className="text-sm font-medium text-gray-600">ファイルを選択</span>
                        </button>
                        <button
                            onClick={() => folderInputRef.current?.click()}
                            className="flex-1 flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-200 hover:border-[#db7093] hover:bg-[#db7093]/5 rounded-2xl transition-all"
                        >
                            <Folder className="w-8 h-8 text-[#db7093]" />
                            <span className="text-sm font-medium text-gray-600">フォルダを選択</span>
                        </button>
                    </div>

                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <input
                        type="file"
                        // @ts-ignore
                        webkitdirectory=""
                        directory=""
                        multiple
                        className="hidden"
                        ref={folderInputRef}
                        onChange={handleFileChange}
                    />

                    {files.length > 0 && (
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-2">{files.length} 個のファイルが選択されています</p>
                            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                                {files.map((f, i) => (
                                    <div key={i} className="text-xs text-gray-500 py-1 truncate">{f.name}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploading ? (
                        <div className="w-full">
                            <div className="flex justify-between text-xs font-bold text-[#db7093] mb-2">
                                <span>アップロード中...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#db7093] transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <button
                            disabled={files.length === 0}
                            onClick={handleUpload}
                            className="w-full py-4 bg-[#db7093] disabled:bg-gray-200 text-white font-bold rounded-2xl shadow-lg shadow-[#db7093]/20 hover:shadow-[#db7093]/40 transition-all flex items-center justify-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            アップロードを開始
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
