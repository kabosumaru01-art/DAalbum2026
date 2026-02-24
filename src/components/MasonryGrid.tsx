'use client';

import React from 'react';
import { Media } from '@/lib/db';
import { Edit2, Trash2 } from 'lucide-react';

interface MasonryGridProps {
    items: Media[];
    onEdit: (item: Media) => void;
    onDelete: (item: Media) => void;
    onImageClick: (item: Media) => void;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ items, onEdit, onDelete, onImageClick }) => {
    if (items.length === 0) return null;

    return (
        <div className="masonry-container">
            {items.map((item) => (
                <div key={item.id} className="masonry-card">
                    {/* クリック可能なメディア領域 */}
                    <div
                        className="masonry-media-wrapper"
                        onClick={() => onImageClick(item)}
                    >
                        {item.type === 'image' ? (
                            <img
                                src={item.url}
                                alt={item.title || ''}
                                className="masonry-media"
                                loading="lazy"
                            />
                        ) : (
                            <video
                                src={item.url}
                                className="masonry-media"
                                muted
                                playsInline
                            />
                        )}

                        {/* ホバーオーバーレイ */}
                        <div className="masonry-overlay">
                            <div className="masonry-overlay-content">
                                {item.title && (
                                    <h3 className="masonry-card-title">{item.title}</h3>
                                )}
                                {item.description && (
                                    <p className="masonry-card-desc">{item.description}</p>
                                )}
                            </div>
                            {/* 編集・削除ボタン（pointer-events: auto でクリック可能） */}
                            <div className="masonry-overlay-actions">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                    className="masonry-overlay-btn"
                                    title="編集"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                    className="masonry-overlay-btn masonry-overlay-btn-danger"
                                    title="削除"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* カード下部の情報バー */}
                    <div className="masonry-card-footer">
                        <span className="masonry-card-date">
                            {item.created_at
                                ? new Date(item.created_at).toLocaleDateString('ja-JP')
                                : ''}
                        </span>
                        <div className="masonry-card-actions">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                className="masonry-action-btn"
                                title="編集"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                                className="masonry-action-btn masonry-action-btn-danger"
                                title="削除"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
