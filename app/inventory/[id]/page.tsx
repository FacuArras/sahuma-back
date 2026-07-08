import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditarProductoClient from './EditarProductoClient';

// Tell Next.js to always render this page at request time, never statically
export const dynamic = 'force-dynamic';

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const producto = await prisma.productoPrincipal.findUnique({
        where: { id },
        include: { variantes: { orderBy: { createdAt: 'asc' } } },
    });

    if (!producto) notFound();

    return <EditarProductoClient producto={producto!} />;
}
