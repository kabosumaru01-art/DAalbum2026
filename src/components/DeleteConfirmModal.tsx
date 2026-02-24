'use client';

import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    type: 'media' | 'album';
    itemTitle: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    itemTitle,
}) => {
    if (!isOpen) return null;

    const typeLabel = type === 'media' ? '写真' : 'アルバム';

    const handleDelete = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-container modal-container-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ヘッダー */}
                <div className="modal-header modal-header-danger">
                    <div className="modal-header-title">
                        <div className="modal-icon-badge modal-icon-badge-danger">
                            <AlertTriangle size={18} />
                        </div>
                        <h2>{typeLabel}の削除</h2>
                    </div>
                    <button onClick={onClose} className="modal-close-btn" aria-label="閉じる">
                        <X size={20} />
                    </button>
                </div>

                {/* 本文 */}
                <div className="modal-body">
                    <div className="delete-confirm-message">
                        <p className="delete-confirm-text">
                            この{typeLabel}を本当に削除しますか？
                        </p>
                        <div className="delete-confirm-target">
                            <span className="delete-confirm-target-label">削除対象:</span>
                            <span className="delete-confirm-target-name">{itemTitle || '（無題）'}</span>
                        </div>
                        <p className="delete-confirm-warning">
                            この操作は取り消せません。
                        </p>
                    </div>
                </div>

                {/* フッター */}
                <div className="modal-footer">
                    <button onClick={onClose} className="modal-btn-secondary">
                        キャンセル
                    </button>
                    <button onClick={handleDelete} className="modal-btn-danger">
                        <Trash2 size={16} />
                        削除する
                    </button>
                </div>
            </div>
        </div>
    );
};
