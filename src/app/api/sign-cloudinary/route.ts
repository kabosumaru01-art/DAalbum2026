import { cloudinary } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { paramsToSign } = await request.json();

    try {
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET!
        );
        return NextResponse.json({ signature });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to sign request' }, { status: 500 });
    }
}
