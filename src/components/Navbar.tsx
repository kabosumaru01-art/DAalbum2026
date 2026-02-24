'use client';

import React, { useState } from 'react';
import { Search, Plus, FolderPlus } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
    onSearch: (query: string) => void;
    onUpload: () => void;
    onCreateAlbum: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onUpload, onCreateAlbum }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[#db7093] tracking-tight">
                R5DA<span className="text-gray-900">アルバム</span>
            </Link>

            <div className="flex-1 max-w-2xl mx-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="アルバムや写真を検索..."
                    value={query}
                    onChange={handleSearch}
                    className="w-full bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-[#db7093]/20 focus:border-[#db7093] rounded-full py-2.5 pl-12 pr-4 transition-all outline-none text-gray-700"
                />
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onCreateAlbum}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FolderPlus className="w-4 h-4" />
                    新規アルバム
                </button>
                <button
                    onClick={onUpload}
                    className="flex items-center gap-2 px-6 py-2 bg-[#db7093] hover:bg-[#c85a7d] text-white text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    投稿
                </button>
            </div>
        </nav>
    );
};
