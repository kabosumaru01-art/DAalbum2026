'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { Media } from '@/lib/db';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
    item: Media | null;
    items?: Media[];
    onClose: () => void;
    onNavigate?: (item: Media) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, items = [], onClose, onNavigate }) => {
    const [isVisible, setIsVisible] = useState(false);

    const currentIndex = item ? items.findIndex(m => m.id === item.id) : -1;
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < items.length - 1;

    const goPrev = useCallback(() => {
        if (hasPrev && onNavigate) {
            onNavigate(items[currentIndex - 1]);
        }
    }, [hasPrev, onNavigate, items, currentIndex]);

    const goNext = useCallback(() => {
        if (hasNext && onNavigate) {
            onNavigate(items[currentIndex + 1]);
        }
    }, [hasNext, onNavigate, items, currentIndex]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
    }, [onClose, goPrev, goNext]);

    useEffect(() => {
        if (item) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            // フェードインのために少し遅延
            requestAnimationFrame(() => setIsVisible(true));
        } else {
            setIsVisible(false);
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [item, handleKeyDown]);

    if (!item) return null;

    return (
        <div
            className="lightbox-backdrop"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={onClose}
        >
            {/* 閉じるボタン */}
            <button
                className="lightbox-close"
                onClick={onClose}
                aria-label="閉じる"
            >
                <X size={24} />
            </button>

            {/* 前へボタン */}
            {hasPrev && (
                <button
                    className="lightbox-nav lightbox-nav-prev"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    aria-label="前の画像"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {/* メインコンテンツ */}
            <div
                className="lightbox-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: isVisible ? 'scale(1)' : 'scale(0.9)',
                    opacity: isVisible ? 1 : 0,
                }}
            >
                {item.type === 'image' ? (
                    <img
                        src={item.url}
                        alt={item.title || ''}
                        className="lightbox-media"
                    />
                ) : (
                    <video
                        src={item.url}
                        controls
                        autoPlay
                        className="lightbox-media"
                    />
                )}
            </div>

            {/* 次へボタン */}
            {hasNext && (
                <button
                    className="lightbox-nav lightbox-nav-next"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    aria-label="次の画像"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* 下部情報 */}
            <div className="lightbox-info" onClick={(e) => e.stopPropagation()}>
                {item.title && (
                    <h2 className="lightbox-title">{item.title}</h2>
                )}
                {item.description && (
                    <p className="lightbox-desc">{item.description}</p>
                )}
                {item.created_at && (
                    <div className="lightbox-date">
                        <Calendar size={14} />
                        <span>
                            {new Date(item.created_at).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
