'use client';

import React from 'react';
import { Album } from '@/lib/db';
import { Folder, Edit2, Trash2 } from 'lucide-react';

interface AlbumListProps {
    albums: Album[];
    onSelect: (album: Album) => void;
    onEdit: (album: Album) => void;
    onDelete: (album: Album) => void;
}

export const AlbumList: React.FC<AlbumListProps> = ({ albums, onSelect, onEdit, onDelete }) => {
    if (albums.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-6 mb-8">
            {albums.map((album) => (
                <div key={album.id} className="group relative">
                    <div
                        onClick={() => onSelect(album)}
                        className="aspect-[4/3] bg-[#db7093]/10 hover:bg-[#db7093]/20 border-2 border-[#db7093]/20 hover:border-[#db7093] rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all active:scale-95"
                    >
                        <Folder className="w-10 h-10 text-[#db7093]" />
                        <span className="font-bold text-gray-800 text-sm px-4 text-center truncate w-full">
                            {album.name}
                        </span>
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(album); }}
                            className="p-1.5 bg-white shadow-sm rounded-full text-gray-400 hover:text-[#db7093]"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(album); }}
                            className="p-1.5 bg-white shadow-sm rounded-full text-gray-400 hover:text-red-500"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
