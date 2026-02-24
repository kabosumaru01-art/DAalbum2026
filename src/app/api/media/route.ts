import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { album_id, type, url, title } = await request.json();
    try {
        const media = await db.addMedia(album_id, type, url, title);
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add media' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const { id, title } = await request.json();
    try {
        const media = await db.updateMedia(id, title);
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
