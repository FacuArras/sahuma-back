'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function registrarVenta(formData: FormData) {
    try {
        const productId = formData.get('productId') as string;
        const cantidad = parseInt(formData.get('cantidad') as string);
        const precioUnitario = parseFloat(formData.get('precioUnitario') as string);

        if (!productId || !cantidad || !precioUnitario) {
            return {
                success: false,
                error: 'Datos incompletos'
            };
        }

        // Verificar stock disponible
        const producto = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!producto) {
            return {
                success: false,
                error: 'Producto no encontrado'
            };
        }

        if (producto.stock < cantidad) {
            return {
                success: false,
                error: `Stock insuficiente. Disponible: ${producto.stock}`
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
                    descripcion: `Venta de ${cantidad}x ${producto.nombre}`,
                    productId: productId,
                },
            }),
            // Descontar stock
            prisma.product.update({
                where: { id: productId },
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
        revalidatePath('/productos');

        return {
            success: true,
            data: result[0],
            message: `Venta registrada exitosamente. Stock actualizado: ${producto.stock - cantidad}`
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
        const productId = formData.get('productId') as string | null;

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
                productId: productId || undefined,
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
