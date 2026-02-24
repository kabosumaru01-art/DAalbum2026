'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, File, Folder } from 'lucide-react';
import { Album } from '@/lib/db';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    albumId: string | null;
    onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, albumId, onSuccess }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [titles, setTitles] = useState<string[]>([]);
    const [descriptions, setDescriptions] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [allAlbums, setAllAlbums] = useState<Album[]>([]);
    const [selectedAlbumId, setSelectedAlbumId] = useState<string>(albumId || 'root');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedAlbumId(albumId || 'root');
            fetch('/api/albums?parentId=all')
                .then(res => res.json())
                .then(data => setAllAlbums(data))
                .catch(console.error);
        }
    }, [isOpen, albumId]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(newFiles);
            setTitles(newFiles.map(f => f.name.split('.')[0]));
            setDescriptions(newFiles.map(() => ''));
        }
    };

    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Cloudinary upload failed:', response.status, errText);
            throw new Error(`Cloudinary upload failed: ${response.status}`);
        }

        return await response.json();
    };

    const handleUpload = async () => {
        if (files.length === 0 || !selectedAlbumId) return;

        setUploading(true);
        setProgress(0);

        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 1. Cloudinaryにアップロード
                const cloudinaryRes = await uploadToCloudinary(file);

                if (!cloudinaryRes.secure_url) {
                    console.error('Cloudinary response missing secure_url:', cloudinaryRes);
                    failCount++;
                    setProgress(Math.round(((i + 1) / files.length) * 100));
                    continue;
                }

                // 2. Supabaseにメディア情報を保存
                const type = file.type.startsWith('video') ? 'video' : 'image';
                const saveRes = await fetch('/api/media', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        album_id: selectedAlbumId,
                        type,
                        url: cloudinaryRes.secure_url,
                        title: titles[i] || file.name.split('.')[0],
                        description: descriptions[i] || ''
                    }),
                });

                if (!saveRes.ok) {
                    const errData = await saveRes.json().catch(() => ({}));
                    console.error('Failed to save media to DB:', saveRes.status, errData);
                    failCount++;
                } else {
                    const savedData = await saveRes.json();
                    console.log('Media saved successfully:', savedData);
                    successCount++;
                }

                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            if (failCount > 0) {
                alert(`${failCount}件の保存に失敗しました。コンソールを確認してください。`);
            }

            if (successCount > 0) {
                // 保存成功した場合のみデータを再取得
                onSuccess();
            }
            onClose();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('アップロードに失敗しました。詳しくはコンソールを確認してください。');
        } finally {
            setUploading(false);
            setFiles([]);
            setTitles([]);
            setDescriptions([]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">メディアをアップロード</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2 border-l-4 border-[#db7093] pl-2">
                            追加先アルバムの選択
                        </label>
                        <select
                            value={selectedAlbumId}
                            onChange={(e) => setSelectedAlbumId(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#db7093]/20 focus:border-[#db7093] font-medium text-gray-700 cursor-pointer appearance-none transition-all"
                        >
                            <option value="root">すべての写真と動画（一番上）</option>
                            {allAlbums.map(album => (
                                <option key={album.id} value={album.id}>
                                    📁 {album.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4 mb-8">
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
                        <div className="space-y-6 mb-8">
                            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 bg-[#db7093] text-white text-[10px] rounded-full">
                                    {files.length}
                                </span>
                                ファイルの詳細設定
                            </h3>
                            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {files.map((file, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                                                {file.type.startsWith('image') ? (
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <File className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">タイトル</label>
                                                <input
                                                    type="text"
                                                    value={titles[idx]}
                                                    onChange={(e) => {
                                                        const newTitles = [...titles];
                                                        newTitles[idx] = e.target.value;
                                                        setTitles(newTitles);
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#db7093]/20 focus:border-[#db7093] transition-all"
                                                    placeholder="写真のタイトルを入力..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">説明（任意）</label>
                                                <textarea
                                                    value={descriptions[idx]}
                                                    onChange={(e) => {
                                                        const newDescs = [...descriptions];
                                                        newDescs[idx] = e.target.value;
                                                        setDescriptions(newDescs);
                                                    }}
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#db7093]/20 focus:border-[#db7093] transition-all resize-none"
                                                    placeholder="思い出や場所などの説明を入力..."
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex-shrink-0">
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
                                className="w-full py-4 bg-[#db7093] disabled:bg-gray-200 text-white font-bold rounded-2xl shadow-lg shadow-[#db7093]/20 hover:shadow-[#db7093]/40 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                {files.length > 0 ? `${files.length}件のアップロードを開始` : 'アップロードを開始'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
