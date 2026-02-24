'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Album } from '@/lib/db';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface AlbumListProps {
    albums: Album[];
    onSelect: (album: Album) => void;
    onEdit: (album: Album) => void;
    onDelete: (album: Album) => void;
}

function AlbumCard({ album, onSelect, onEdit, onDelete }: {
    album: Album;
    onSelect: (a: Album) => void;
    onEdit: (a: Album) => void;
    onDelete: (a: Album) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // メニュー外クリックで閉じる
    useEffect(() => {
        if (!menuOpen) return;
        const handle = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [menuOpen]);

    return (
        <div className="album-card-wrapper">
            {/* アルバム本体（クリックで開く） */}
            <div
                className="album-card"
                onClick={() => onSelect(album)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(album)}
            >
                <Folder className="album-card-icon" />
                <span className="album-card-name">{album.name}</span>
            </div>

            {/* ⋮ メニューボタン */}
            <div className="album-menu-wrapper" ref={menuRef}>
                <button
                    className="album-menu-trigger"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                    aria-label="アルバムのオプション"
                    title="オプション"
                >
                    <MoreVertical size={18} />
                </button>

                {menuOpen && (
                    <div className="album-dropdown">
                        <button
                            className="album-dropdown-item"
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(album); }}
                        >
                            <Edit2 size={15} />
                            編集
                        </button>
                        <div className="album-dropdown-divider" />
                        <button
                            className="album-dropdown-item album-dropdown-item-danger"
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(album); }}
                        >
                            <Trash2 size={15} />
                            削除
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export const AlbumList: React.FC<AlbumListProps> = ({ albums, onSelect, onEdit, onDelete }) => {
    if (albums.length === 0) return null;

    return (
        <div className="album-grid">
            {albums.map((album) => (
                <AlbumCard
                    key={album.id}
                    album={album}
                    onSelect={onSelect}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};
