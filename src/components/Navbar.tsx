'use client';

import React, { useState } from 'react';
import { Search, Plus, FolderPlus, X } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
    onSearch: (query: string) => void;
    onUpload: () => void;
    onCreateAlbum: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onUpload, onCreateAlbum }) => {
    const [query, setQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        onSearch(val);
    };

    const handleClear = () => {
        setQuery('');
        onSearch('');
        setSearchOpen(false);
    };

    return (
        <nav className="navbar">
            {/* ロゴ */}
            <Link href="/" className="navbar-logo">
                R5DA<span className="navbar-logo-sub">アルバム</span>
            </Link>

            {/* PC: 検索バー（中央） */}
            <div className="navbar-search-pc">
                <Search className="navbar-search-icon" />
                <input
                    type="text"
                    placeholder="アルバムや写真を検索..."
                    value={query}
                    onChange={handleSearch}
                    className="navbar-search-input"
                />
                {query && (
                    <button onClick={handleClear} className="navbar-search-clear">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* 右側ボタン群 */}
            <div className="navbar-actions">
                {/* モバイル: 検索アイコン */}
                <button
                    className="navbar-icon-btn navbar-search-toggle"
                    onClick={() => setSearchOpen((v) => !v)}
                    aria-label="検索"
                >
                    <Search size={20} />
                </button>

                {/* PC: 新規アルバム・投稿ボタン */}
                <button onClick={onCreateAlbum} className="navbar-btn-secondary">
                    <FolderPlus size={16} />
                    <span>新規アルバム</span>
                </button>
                <button onClick={onUpload} className="navbar-btn-primary">
                    <Plus size={18} />
                    <span>投稿</span>
                </button>
            </div>

            {/* モバイル: 展開する検索バー */}
            {searchOpen && (
                <div className="navbar-search-mobile">
                    <Search className="navbar-search-icon" />
                    <input
                        type="text"
                        placeholder="アルバムや写真を検索..."
                        value={query}
                        onChange={handleSearch}
                        className="navbar-search-input"
                        autoFocus
                    />
                    <button onClick={handleClear} className="navbar-search-clear">
                        <X size={16} />
                    </button>
                </div>
            )}
        </nav>
    );
};
