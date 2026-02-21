import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No se proporcionó ningún archivo.' }, { status: 400 });
        }

        // Convert the File to a base64 data URI
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'shauma/productos',
        });

        return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
    } catch (err) {
        console.error('Error al subir imagen a Cloudinary:', err);
        return NextResponse.json({ error: 'Error al subir la imagen.' }, { status: 500 });
    }
}
