import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    try {
        const albums = await db.getAlbums(parentId);
        return NextResponse.json(albums);
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
