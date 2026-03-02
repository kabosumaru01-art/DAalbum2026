import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    try {
        const albums = await db.getAlbums(parentId);

        // Fetch covers for all albums in parallel
        const albumsWithCovers = await Promise.all(
            albums.map(async (album) => {
                try {
                    const covers = await db.getAlbumCovers(album.id, 4);
                    return { ...album, coverMedia: covers };
                } catch (err) {
                    console.error(`Failed to fetch covers for album ${album.id}:`, err);
                    return { ...album, coverMedia: [] }; // Return empty array on error
                }
            })
        );

        return NextResponse.json(albumsWithCovers);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch albums' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { name, parent_id } = await request.json();
    try {
        const album = await db.createAlbum(name, parent_id);
        return NextResponse.json(album);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create album' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const { id, name } = await request.json();
    try {
        const album = await db.updateAlbum(id, name);
        return NextResponse.json(album);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update album' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    try {
        await db.deleteAlbum(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 });
    }
}
