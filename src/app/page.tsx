'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MasonryGrid } from '@/components/MasonryGrid';
import { AlbumList } from '@/components/AlbumList';
import { UploadModal } from '@/components/UploadModal';
import { Album, Media } from '@/lib/db';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Album[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; title: string; type: 'album' | 'media' } | null>(null);

  const fetchData = async () => {
    // Fetch albums for the current level
    const albumsRes = await fetch(`/api/albums?parentId=${currentAlbum?.id || ''}`);
    const albumsData = await albumsRes.json();
    setAlbums(albumsData);

    // Fetch media (filtered by current album or globally if searching)
    const mediaRes = await fetch(`/api/media?albumId=${currentAlbum?.id || ''}&searchQuery=${searchQuery}`);
    const mediaData = await mediaRes.json();
    setMedia(mediaData);
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

  const handleEditItem = async (item: Media | Album, type: 'album' | 'media') => {
    const newTitle = prompt('新しいタイトルを入力してください:', 'title' in item ? item.title! : 'name' in item ? (item as any).name : '');
    if (newTitle === null) return;

    const endpoint = type === 'album' ? '/api/albums' : '/api/media';
    await fetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ id: item.id, [type === 'album' ? 'name' : 'title']: newTitle }),
    });
    fetchData();
  };

  const handleDeleteItem = async (id: string, type: 'album' | 'media') => {
    if (!confirm('本当に削除しますか？')) return;

    const endpoint = type === 'album' ? `/api/albums?id=${id}` : `/api/media?id=${id}`;
    await fetch(endpoint, { method: 'DELETE' });
    fetchData();
  };

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
            <React.Fragment key={crumb.id}>
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
          onEdit={(a) => handleEditItem(a, 'album')}
          onDelete={(a) => handleDeleteItem(a.id, 'album')}
        />

        <MasonryGrid
          items={media}
          onEdit={(m) => handleEditItem(m, 'media')}
          onDelete={(m) => handleDeleteItem(m.id, 'media')}
        />
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        albumId={currentAlbum?.id || 'root'} // Fallback to root or default album if needed
        onSuccess={fetchData}
      />
    </main>
  );
}
