'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ItemInput {
    nombre: string;
    marca: string;
    aroma: string;
    precioCompra: number;
    cantidad: number;
    varianteId?: string; // used to update stock on ProductoVariante
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Asumes que la ganancia aproximada es un 70 % sobre el costo de compra. */
function calcGanancia(items: ItemInput[]): number {
    const costo = items.reduce((sum, i) => sum + i.precioCompra * i.cantidad, 0);
    return costo * 0.7;
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function getOrders() {
    return prisma.pedido.findMany({
        orderBy: { fecha: 'desc' },
        include: { items: true },
    });
}

export async function getProductos() {
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

export async function createOrder(items: ItemInput[]) {
    const costoTotal = items.reduce((sum, i) => sum + i.precioCompra * i.cantidad, 0);
    const gananciaTotal = calcGanancia(items);

    // Create the order record
    await prisma.pedido.create({
        data: {
            costoTotal,
            gananciaTotal,
            items: {
                create: items.map((i) => ({
                    nombre: i.nombre,
                    marca: i.marca,
                    aroma: i.aroma,
                    precioCompra: i.precioCompra,
                    cantidad: i.cantidad,
                })),
            },
        },
    });

    // Increment stock for each variant that was ordered
    for (const item of items) {
        if (item.varianteId) {
            await prisma.productoVariante.update({
                where: { id: item.varianteId },
                data: { stock: { increment: item.cantidad } },
            });
        }
    }

    revalidatePath('/orders');
    revalidatePath('/inventory');
}

export async function updateOrder(id: string, items: ItemInput[]) {
    const costoTotal = items.reduce((sum, i) => sum + i.precioCompra * i.cantidad, 0);
    const gananciaTotal = calcGanancia(items);

    // Delete existing items then recreate (simplest approach for MongoDB w/ Prisma)
    await prisma.itemPedido.deleteMany({ where: { pedidoId: id } });

    await prisma.pedido.update({
        where: { id },
        data: {
            costoTotal,
            gananciaTotal,
            items: {
                create: items.map((i) => ({
                    nombre: i.nombre,
                    marca: i.marca,
                    aroma: i.aroma,
                    precioCompra: i.precioCompra,
                    cantidad: i.cantidad,
                })),
            },
        },
    });

    revalidatePath('/orders');
}

export async function deleteOrder(id: string) {
    await prisma.pedido.delete({ where: { id } });
    revalidatePath('/orders');
}
