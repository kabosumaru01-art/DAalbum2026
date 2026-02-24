import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

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
    try {
        const body = await request.json();
        const { album_id, type, url, title, description } = body;

        console.log('[POST /api/media] Received:', { album_id, type, url: url?.substring(0, 50), title, description });

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const media = await db.addMedia(album_id, type, url, title, description);
        console.log('[POST /api/media] Saved successfully:', media.id);
        return NextResponse.json(media);
    } catch (error: any) {
        console.error('[POST /api/media] ERROR:', error?.message || error, error?.details || '', error?.code || '');
        return NextResponse.json(
            { error: 'Failed to add media', details: error?.message || String(error) },
            { status: 500 }
        );
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
        // 1. まずDBからメディア情報を取得し、URLを確認する
        const media = await db.getMediaById(id);

        if (media && media.url) {
            // URLから public_id を抽出
            // 例: https://res.cloudinary.com/[name]/image/upload/v123456/[public_id].[ext]
            const parts = media.url.split('/');
            const fileNameWithExt = parts[parts.length - 1];
            const publicId = fileNameWithExt.split('.')[0];

            console.log('[DELETE /api/media] Deleting from Cloudinary:', publicId);

            // 2. Cloudinaryからファイルを削除
            await cloudinary.uploader.destroy(publicId);
        }

        // 3. DBからレコードを削除
        await db.deleteMedia(id);
        console.log('[DELETE /api/media] Deleted successfully from DB:', id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE /api/media] ERROR:', error?.message || error);
        return NextResponse.json({ error: 'Failed to delete media', details: error?.message || String(error) }, { status: 500 });
    }
}
