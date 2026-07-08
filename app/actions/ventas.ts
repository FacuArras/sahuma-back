'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function registrarVenta(formData: FormData) {
    try {
        const varianteId = formData.get('varianteId') as string;
        const cantidad = parseInt(formData.get('cantidad') as string);
        const precioUnitario = parseFloat(formData.get('precioUnitario') as string);

        if (!varianteId || !cantidad || !precioUnitario) {
            return {
                success: false,
                error: 'Datos incompletos'
            };
        }

        // Verificar stock disponible
        const variante = await prisma.productoVariante.findUnique({
            where: { id: varianteId },
            include: { productoPrincipal: true },
        });

        if (!variante) {
            return {
                success: false,
                error: 'Variante de producto no encontrada'
            };
        }

        if (variante.stock < cantidad) {
            return {
                success: false,
                error: `Stock insuficiente. Disponible: ${variante.stock}`
            };
        }

        // Calcular monto total
        const montoTotal = cantidad * precioUnitario;

        // Crear transacción y actualizar stock en una transacción de BD
        const result = await prisma.$transaction([
            // Crear registro de venta
            prisma.transaction.create({
                data: {
                    tipo: 'VENTA',
                    monto: montoTotal,
                    cantidad: cantidad,
                    descripcion: `Venta de ${cantidad}x ${variante.productoPrincipal.nombre} - ${variante.aroma}`,
                    varianteId: varianteId,
                },
            }),
            // Descontar stock
            prisma.productoVariante.update({
                where: { id: varianteId },
                data: {
                    stock: {
                        decrement: cantidad,
                    },
                },
            }),
        ]);

        // Revalidar las páginas que muestran estos datos
        revalidatePath('/');
        revalidatePath('/ventas');
        revalidatePath('/inventory');

        return {
            success: true,
            data: result[0],
            message: `Venta registrada exitosamente. Stock actualizado: ${variante.stock - cantidad}`
        };
    } catch (error) {
        console.error('Error al registrar venta:', error);
        return {
            success: false,
            error: 'Error al procesar la venta'
        };
    }
}

export async function registrarGasto(formData: FormData) {
    try {
        const monto = parseFloat(formData.get('monto') as string);
        const descripcion = formData.get('descripcion') as string;
        const varianteId = formData.get('varianteId') as string | null;

        if (!monto || !descripcion) {
            return {
                success: false,
                error: 'Monto y descripción son requeridos'
            };
        }

        const transaction = await prisma.transaction.create({
            data: {
                tipo: 'GASTO',
                monto: monto,
                descripcion: descripcion,
                varianteId: varianteId || undefined,
            },
        });

        revalidatePath('/');
        revalidatePath('/finanzas');

        return {
            success: true,
            data: transaction,
            message: 'Gasto registrado exitosamente'
        };
    } catch (error) {
        console.error('Error al registrar gasto:', error);
        return {
            success: false,
            error: 'Error al procesar el gasto'
        };
    }
}
