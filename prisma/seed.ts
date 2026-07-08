import { PrismaClient } from '@prisma/client';
import { PRODUCTOS_PRINCIPALES } from '../lib/mockData';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing data...');
    await prisma.productoVariante.deleteMany({});
    await prisma.productoPrincipal.deleteMany({});
    console.log('Deleted all existing products.');

    console.log('Seeding products...');
    let count = 0;
    for (const producto of PRODUCTOS_PRINCIPALES) {
        await prisma.productoPrincipal.create({
            data: {
                nombre: producto.nombre,
                marca: producto.marca,
                descripcion: producto.descripcion,
                imagenPadre: producto.imagenPadre,
                variantes: {
                    create: producto.variantes.map((v) => ({
                        aroma: v.aroma,
                        stock: v.stock,
                        precioVenta: v.precioVenta,
                        precioCompra: v.precioCompra,
                        imagenUrl: v.imagenUrl,
                    })),
                },
            },
        });
        count += producto.variantes.length;
    }

    console.log(`Successfully seeded ${PRODUCTOS_PRINCIPALES.length} productos principales con ${count} variantes.`);
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
