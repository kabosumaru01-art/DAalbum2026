import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    const searchQuery = searchParams.get('searchQuery') || '';
    try {
        const media = await db.getMedia(albumId, searchQuery);
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { album_id, type, url, title, description } = await request.json();
    try {
        const media = await db.addMedia(album_id, type, url, title, description);
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add media' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const { id, title, description } = await request.json();
    try {
        const media = await db.updateMedia(id, title, description);
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    try {
        await db.deleteMedia(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
