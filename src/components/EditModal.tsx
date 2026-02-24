'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Edit2, Image, FolderOpen } from 'lucide-react';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, description: string) => void;
    type: 'media' | 'album';
    initialTitle: string;
    initialDescription: string;
}

export const EditModal: React.FC<EditModalProps> = ({
    isOpen,
    onClose,
    onSave,
    type,
    initialTitle,
    initialDescription,
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle);
            setDescription(initialDescription);
        }
    }, [isOpen, initialTitle, initialDescription]);

    if (!isOpen) return null;

    const isMedia = type === 'media';
    const typeLabel = isMedia ? '写真' : 'アルバム';
    const TypeIcon = isMedia ? Image : FolderOpen;

    const handleSave = () => {
        onSave(title, description);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                {/* ヘッダー */}
                <div className="modal-header">
                    <div className="modal-header-title">
                        <div className="modal-icon-badge">
                            <TypeIcon size={18} />
                        </div>
                        <h2>{typeLabel}を編集</h2>
                    </div>
                    <button onClick={onClose} className="modal-close-btn" aria-label="閉じる">
                        <X size={20} />
                    </button>
                </div>

                {/* 本文 */}
                <div className="modal-body">
                    <div className="modal-field">
                        <label className="modal-label">タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="modal-input"
                            placeholder={`${typeLabel}のタイトルを入力...`}
                            autoFocus
                        />
                    </div>

                    {isMedia && (
                        <div className="modal-field">
                            <label className="modal-label">説明（任意）</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="modal-textarea"
                                placeholder="思い出や場所などの説明を入力..."
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                {/* フッター */}
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-btn-secondary">
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="modal-btn-primary"
                        disabled={!title.trim()}
                    >
                        <Save size={16} />
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );
};
