'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ItemVentaInput {
    nombre: string;
    marca: string;
    aroma: string;
    precioVenta: number;
    cantidad: number;
    varianteId?: string;
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function getSales() {
    return prisma.venta.findMany({
        orderBy: { fecha: 'desc' },
        include: { items: true },
    });
}

export async function getProductosParaVenta() {
    return prisma.productoPrincipal.findMany({
        where: { pausado: false },
        orderBy: { nombre: 'asc' },
        include: {
            variantes: {
                where: { pausado: false },
                orderBy: { aroma: 'asc' },
            },
        },
    });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export async function createVenta(
    items: ItemVentaInput[],
    metodoPago: string,
    pagado: boolean,
) {
    const totalVenta = items.reduce((sum, i) => sum + i.precioVenta * i.cantidad, 0);

    await prisma.venta.create({
        data: {
            totalVenta,
            metodoPago,
            pagado,
            items: {
                create: items.map((i) => ({
                    nombre: i.nombre,
                    marca: i.marca,
                    aroma: i.aroma,
                    precioVenta: i.precioVenta,
                    cantidad: i.cantidad,
                    varianteId: i.varianteId,
                })),
            },
        },
    });

    // Decrement stock for each variant sold
    for (const item of items) {
        if (item.varianteId) {
            await prisma.productoVariante.update({
                where: { id: item.varianteId },
                data: { stock: { decrement: item.cantidad } },
            });
        }
    }

    revalidatePath('/sales');
    revalidatePath('/inventory');
}

export async function deleteVenta(id: string) {
    await prisma.venta.delete({ where: { id } });
    revalidatePath('/sales');
}
