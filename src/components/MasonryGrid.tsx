'use client';

import React from 'react';
import { Media } from '@/lib/db';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';

interface MasonryGridProps {
    items: Media[];
    onEdit: (item: Media) => void;
    onDelete: (item: Media) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ items, onEdit, onDelete }) => {
    return (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 px-6 pb-20">
            {items.map((item) => (
                <div key={item.id} className="break-inside-avoid mb-4 group relative">
                    <div className="masonry-item border border-gray-100 shadow-sm bg-white overflow-hidden rounded-xl">
                        {item.type === 'image' ? (
                            <img
                                src={item.url}
                                alt={item.title || ''}
                                className="w-full h-auto display-block"
                                loading="lazy"
                            />
                        ) : (
                            <video
                                src={item.url}
                                className="w-full h-auto display-block"
                                controls
                            />
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <div className="flex items-center justify-between text-white">
                                <span className="font-medium truncate mr-2">{item.title}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item)}
                                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
