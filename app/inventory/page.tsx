import { prisma } from '@/lib/prisma';
import { getStockStatus } from '@/lib/mockData';
import InventarioClient, { type TablaRowDB, type InventarioStats } from './InventarioClient';

// ─── Fetch from DB ────────────────────────────────────────────────────────────

async function getInventarioData(): Promise<{ rows: TablaRowDB[]; stats: InventarioStats }> {
    const productos = await prisma.productoPrincipal.findMany({
        include: {
            variantes: true,
        },
        orderBy: { nombre: 'asc' },
    });

    // Flatten to rows
    const rows: TablaRowDB[] = productos.flatMap((p) =>
        p.variantes.map((v) => ({
            productoId: p.id,
            varianteId: v.id,
            nombre: p.nombre,
            marca: p.marca,
            variable: v.aroma,
            stock: v.stock,
            stockMin: 0,
            precio: v.precioVenta,
            costo: v.precioCompra,
            pausadoProducto: p.pausado,
            pausadoVariante: v.pausado,
        }))
    );

    // Build stats
    let totalStock = 0;
    let sinStock = 0;
    let stockBajo = 0;
    let valorInventario = 0;

    for (const p of productos) {
        const variantesActivas = p.variantes;
        if (variantesActivas.length === 0) continue;

        const statuses = variantesActivas.map((v) => getStockStatus(v.stock, 0).label);
        if (statuses.every((s) => s === 'Sin stock')) sinStock++;

        for (const v of variantesActivas) {
            totalStock += v.stock;
            valorInventario += v.stock * v.precioCompra;
            if (getStockStatus(v.stock, 0).label === 'Stock bajo') stockBajo++;
        }
    }

    const stats: InventarioStats = { totalStock, sinStock, stockBajo, valorInventario };

    return { rows, stats };
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default async function InventarioPage() {
    const { rows, stats } = await getInventarioData();
    return <InventarioClient rows={rows} stats={stats} />;
}
