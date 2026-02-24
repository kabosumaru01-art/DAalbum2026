import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Inserting demo data...');

    const albumRes = await fetch('http://localhost:3000/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '旅行の思い出（デモ）', parent_id: null })
    });

    if (!albumRes.ok) {
        console.error('Error creating album via API:', await albumRes.text());
        return;
    }

    const album = await albumRes.json();
    const albumId = album.id;
    console.log('Created album:', album.name);

    // 2. デモ用写真を追加
    const demoMedia = [
        {
            album_id: albumId,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366',
            title: '京都の風景',
            description: '春の桜がとても綺麗でした。'
        },
        {
            album_id: albumId,
            type: 'image',
            url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
            title: '湖畔のキャンプ',
            description: '大自然の中でリフレッシュ。'
        },
        {
            album_id: 'root', // rootを明示
            type: 'image',
            url: 'https://images.unsplash.com/photo-1506744626753-dba7e411b2c1',
            title: '素晴らしい夕日',
            description: '海の近くで撮影しました。'
        },
        {
            album_id: 'root', // rootを明示
            type: 'image',
            url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
            title: '森の散歩道',
            description: 'マイナスイオンたっぷり。'
        }
    ];

    for (const media of demoMedia) {
        const mediaRes = await fetch('http://localhost:3000/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(media)
        });
        if (!mediaRes.ok) {
            console.error('Error adding media via API:', await mediaRes.text());
        } else {
            console.log('Added media:', media.title);
        }
    }

    console.log('Successfully inserted demo photos!');
}

main();
