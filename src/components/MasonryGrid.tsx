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

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                            <div className="text-white space-y-2">
                                <h3 className="font-bold text-lg leading-tight truncate">{item.title}</h3>
                                {item.description && (
                                    <p className="text-xs text-gray-200 line-clamp-2 leading-relaxed pb-2 border-b border-white/20">
                                        {item.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[10px] text-gray-300 font-medium">
                                        {new Date(item.created_at!).toLocaleDateString('ja-JP')}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors"
                                            title="編集"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-2 bg-red-500/60 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors"
                                            title="削除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
