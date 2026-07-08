'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── Shared types ─────────────────────────────────────────────────────────────

interface VarianteInput {
    aroma: string;
    stock: number;
    precioVenta: number;
    precioCompra: number;
    imagenUrl?: string;
}

interface CrearProductoInput {
    nombre: string;
    marca: string;
    descripcion?: string;
    imagenPadre: string;
    variantes: VarianteInput[];
}

// ─── Crear producto ───────────────────────────────────────────────────────────

export async function crearProducto(input: CrearProductoInput) {
    if (!input.nombre.trim()) return { success: false, error: 'El nombre del producto es requerido.' };
    if (!input.marca.trim()) return { success: false, error: 'La marca del producto es requerida.' };
    if (!input.imagenPadre.trim()) return { success: false, error: 'La imagen del producto es requerida.' };
    if (input.variantes.length === 0) return { success: false, error: 'Debe agregar al menos una variante.' };

    for (const v of input.variantes) {
        if (!v.aroma.trim()) return { success: false, error: 'Todas las variantes deben tener un aroma.' };
        if (isNaN(v.stock) || v.stock < 0) return { success: false, error: `Stock inválido en la variante "${v.aroma}".` };
        if (isNaN(v.precioVenta) || v.precioVenta <= 0) return { success: false, error: `Precio de venta inválido en la variante "${v.aroma}".` };
        if (isNaN(v.precioCompra) || v.precioCompra <= 0) return { success: false, error: `Precio de compra inválido en la variante "${v.aroma}".` };
    }

    try {
        await prisma.productoPrincipal.create({
            data: {
                nombre: input.nombre.trim(),
                marca: input.marca.trim(),
                descripcion: input.descripcion?.trim() || undefined,
                imagenPadre: input.imagenPadre.trim(),
                variantes: {
                    create: input.variantes.map((v) => ({
                        aroma: v.aroma.trim(),
                        stock: v.stock,
                        precioVenta: v.precioVenta,
                        precioCompra: v.precioCompra,
                        imagenUrl: v.imagenUrl?.trim() || undefined,
                    })),
                },
            },
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        return { success: false, error: 'Error al guardar en la base de datos.' };
    }

    revalidatePath('/inventory');
    revalidatePath('/');
    return { success: true };
}

// ─── Actualizar producto principal ────────────────────────────────────────────

export async function actualizarProducto(
    id: string,
    data: { nombre: string; marca: string; descripcion?: string; imagenPadre: string; pausado: boolean; precioVenta?: number; precioCompra?: number }
) {
    if (!data.nombre.trim()) return { success: false, error: 'El nombre es requerido.' };
    if (!data.marca.trim()) return { success: false, error: 'La marca es requerida.' };

    try {
        await prisma.productoPrincipal.update({
            where: { id },
            data: {
                nombre: data.nombre.trim(),
                marca: data.marca.trim(),
                descripcion: data.descripcion?.trim() || undefined,
                imagenPadre: data.imagenPadre.trim(),
                pausado: data.pausado,
            },
        });

        // Actualizar precio de las variantes si se enviaron junto a los datos
        if (data.precioVenta !== undefined && data.precioCompra !== undefined && !isNaN(data.precioVenta) && !isNaN(data.precioCompra)) {
            await prisma.productoVariante.updateMany({
                where: { productoPrincipalId: id },
                data: {
                    precioVenta: data.precioVenta,
                    precioCompra: data.precioCompra,
                }
            });
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return { success: false, error: 'Error al guardar en la base de datos.' };
    }

    revalidatePath('/inventory');
    revalidatePath(`/inventory/${id}`);
    return { success: true };
}

// ─── Actualizar variante ───────────────────────────────────────────────────────

export async function actualizarVariante(
    id: string,
    data: { aroma: string; stock: number; precioVenta: number; precioCompra: number; imagenUrl?: string; pausado: boolean }
) {
    try {
        await prisma.productoVariante.update({
            where: { id },
            data: {
                aroma: data.aroma.trim(),
                stock: data.stock,
                precioVenta: data.precioVenta,
                precioCompra: data.precioCompra,
                imagenUrl: data.imagenUrl?.trim() || undefined,
                pausado: data.pausado,
            },
        });
    } catch (error) {
        console.error('Error al actualizar variante:', error);
        return { success: false, error: 'Error al guardar variante.' };
    }

    return { success: true };
}

// ─── Crear variante ────────────────────────────────────────────────────────────

export async function crearVariante(
    productoPrincipalId: string,
    data: { aroma: string; stock: number; precioVenta: number; precioCompra: number; imagenUrl?: string }
) {
    try {
        const v = await prisma.productoVariante.create({
            data: {
                aroma: data.aroma.trim(),
                stock: data.stock,
                precioVenta: data.precioVenta,
                precioCompra: data.precioCompra,
                imagenUrl: data.imagenUrl?.trim() || undefined,
                productoPrincipalId,
            },
        });
        revalidatePath('/inventory');
        revalidatePath(`/inventory/${productoPrincipalId}`);
        return { success: true, id: v.id };
    } catch (error) {
        console.error('Error al crear variante:', error);
        return { success: false, error: 'Error al guardar variante.' };
    }
}

// ─── Eliminar variante ─────────────────────────────────────────────────────────

export async function eliminarVariante(id: string, productoPrincipalId: string) {
    try {
        await prisma.productoVariante.delete({ where: { id } });
    } catch (error) {
        console.error('Error al eliminar variante:', error);
        return { success: false, error: 'Error al eliminar variante.' };
    }

    revalidatePath('/inventory');
    revalidatePath(`/inventory/${productoPrincipalId}`);
    return { success: true };
}

// ─── Eliminar producto ─────────────────────────────────────────────────────────

export async function eliminarProducto(id: string) {
    try {
        await prisma.productoPrincipal.delete({ where: { id } });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return { success: false, error: 'Error al eliminar el producto.' };
    }

    revalidatePath('/inventory');
    redirect('/inventory');
}
