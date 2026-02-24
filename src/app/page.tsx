'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MasonryGrid } from '@/components/MasonryGrid';
import { AlbumList } from '@/components/AlbumList';
import { UploadModal } from '@/components/UploadModal';
import { Lightbox } from '@/components/Lightbox';
import { EditModal } from '@/components/EditModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { Album, Media } from '@/lib/db';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Album[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // 編集モーダル用ステート
  const [editTarget, setEditTarget] = useState<{
    item: Media | Album;
    type: 'media' | 'album';
  } | null>(null);

  // 削除確認モーダル用ステート
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
    type: 'media' | 'album';
  } | null>(null);

  const fetchData = async () => {
    // Fetch albums for the current level
    const albumsRes = await fetch(`/api/albums?parentId=${currentAlbum?.id || ''}`);
    const albumsData = await albumsRes.json();
    const uniqueAlbums = Array.isArray(albumsData)
      ? albumsData.filter((item: Album, index: number, self: Album[]) =>
        index === self.findIndex((a) => a.id === item.id)
      )
      : [];
    setAlbums(uniqueAlbums);

    // Fetch media
    const mediaRes = await fetch(`/api/media?albumId=${currentAlbum?.id || ''}&searchQuery=${searchQuery}`);
    const mediaData = await mediaRes.json();
    const uniqueMedia = Array.isArray(mediaData)
      ? mediaData.filter((item: Media, index: number, self: Media[]) =>
        index === self.findIndex((m) => m.id === item.id)
      )
      : [];
    setMedia(uniqueMedia);
  };

  useEffect(() => {
    fetchData();
  }, [currentAlbum, searchQuery]);

  const handleSelectAlbum = (album: Album) => {
    setCurrentAlbum(album);
    setBreadcrumbs([...breadcrumbs, album]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentAlbum(null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setCurrentAlbum(newBreadcrumbs[newBreadcrumbs.length - 1]);
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  const handleCreateAlbum = async () => {
    const name = prompt('アルバム名を入力してください:');
    if (!name) return;

    await fetch('/api/albums', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id: currentAlbum?.id || null }),
    });
    fetchData();
  };

  // 編集モーダルを開く
  const openEditModal = (item: Media | Album, type: 'album' | 'media') => {
    setEditTarget({ item, type });
  };

  // 編集を保存
  const handleSaveEdit = async (title: string, description: string) => {
    if (!editTarget) return;
    const { item, type } = editTarget;

    const endpoint = type === 'album' ? '/api/albums' : '/api/media';
    await fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        id: item.id,
        [type === 'album' ? 'name' : 'title']: title,
        ...(type === 'media' ? { description } : {}),
      }),
    });
    setEditTarget(null);
    fetchData();
  };

  // 削除確認モーダルを開く
  const openDeleteModal = (item: Media | Album, type: 'album' | 'media') => {
    const title = type === 'media'
      ? (item as Media).title || ''
      : (item as Album).name;
    setDeleteTarget({ id: item.id, title, type });
  };

  // 削除を実行
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;

    const endpoint = type === 'album' ? `/api/albums?id=${id}` : `/api/media?id=${id}`;
    await fetch(endpoint, { method: 'DELETE' });
    setDeleteTarget(null);
    fetchData();
  };

  // 編集モーダルの初期値を計算
  const editInitialTitle = editTarget
    ? editTarget.type === 'media'
      ? (editTarget.item as Media).title || ''
      : (editTarget.item as Album).name
    : '';

  const editInitialDesc = editTarget && editTarget.type === 'media'
    ? (editTarget.item as Media).description || ''
    : '';

  return (
    <main className="min-h-screen bg-white">
      <Navbar
        onSearch={setSearchQuery}
        onUpload={() => setIsUploadOpen(true)}
        onCreateAlbum={handleCreateAlbum}
      />

      <div className="max-w-[1600px] mx-auto pt-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 px-6 mb-8 text-sm text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="hover:text-[#db7093] flex items-center gap-1 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            トップ
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={`${crumb.id}-${idx}`}>
              <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`hover:text-[#db7093] transition-colors ${idx === breadcrumbs.length - 1 ? 'font-bold text-gray-900' : ''}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Current Album Header */}
        <div className="px-6 mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {currentAlbum ? currentAlbum.name : 'すべての写真と動画'}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {albums.length > 0 && `${albums.length}個のアルバム`}
            {albums.length > 0 && media.length > 0 && ' • '}
            {media.length > 0 && `${media.length}枚のメディア`}
          </p>
        </div>

        <AlbumList
          albums={albums}
          onSelect={handleSelectAlbum}
          onEdit={(a) => openEditModal(a, 'album')}
          onDelete={(a) => openDeleteModal(a, 'album')}
        />

        <MasonryGrid
          items={media}
          onEdit={(m) => openEditModal(m, 'media')}
          onDelete={(m) => openDeleteModal(m, 'media')}
          onImageClick={(m) => setSelectedMedia(m)}
        />
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        albumId={currentAlbum?.id || 'root'}
        onSuccess={fetchData}
      />

      <Lightbox
        item={selectedMedia}
        items={media}
        onClose={() => setSelectedMedia(null)}
        onNavigate={(m) => setSelectedMedia(m)}
      />

      {/* 編集モーダル */}
      <EditModal
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
        type={editTarget?.type || 'media'}
        initialTitle={editInitialTitle}
        initialDescription={editInitialDesc}
      />

      {/* 削除確認モーダル */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        type={deleteTarget?.type || 'media'}
        itemTitle={deleteTarget?.title || ''}
      />
    </main>
  );
}
