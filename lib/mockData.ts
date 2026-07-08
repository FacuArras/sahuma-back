// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductoVariante {
    id: string;
    aroma: string;          // nombre del aroma
    stock: number;          // cantidad en stock
    precioVenta: number;
    precioCompra: number;
    imagenUrl?: string;
    // campos locales de UI (no persisten en DB)
    stockMin?: number;
    pausado?: boolean;
}

export interface ProductoPrincipal {
    id: string;
    nombre: string;
    marca: string;
    descripcion?: string;
    imagenPadre: string;
    variantes: ProductoVariante[];
    // campo local de UI
    pausado?: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export let PRODUCTOS_PRINCIPALES: ProductoPrincipal[] = [
    {
        id: '0001',
        nombre: 'Sahumerio palo santo buena onda',
        marca: 'Aromanza',
        imagenPadre: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771043795/buenaonda_b7wnvx.jpg',
        variantes: [
            { id: '000101', aroma: 'Sándalo hindú', stock: 2, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false, imagenUrl: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771043795/buenaonda_b7wnvx.jpg' },
            { id: '000102', aroma: 'Incienso consagrado', stock: 2, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false },
            { id: '000103', aroma: 'Atrae dinero', stock: 2, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false },
            { id: '000104', aroma: 'Variedad de aromas', stock: 1, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false },
            { id: '000105', aroma: 'Néctar de los dioses', stock: 1, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false },
            { id: '000106', aroma: 'Frutos rojos', stock: 1, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false },
            { id: '000107', aroma: 'Fragancia oriental', stock: 1, precioVenta: 2000, precioCompra: 805.88, stockMin: 2, pausado: false },
        ],
    },
    {
        id: '0002',
        nombre: 'Sahumerio Sah Tao',
        marca: 'Sagrada Madre',
        imagenPadre: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771040033/sa1_zbtusp.jpg',
        variantes: [
            { id: '000201', aroma: 'Luminosa', stock: 3, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000202', aroma: 'Energía limpia', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000203', aroma: 'Sándalo hindú', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000204', aroma: 'Rosa mosqueta', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000205', aroma: 'Canela dulce', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000206', aroma: 'Spicy naranja', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000207', aroma: 'Sándalo', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000208', aroma: 'Encanto floral', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000209', aroma: 'Belleza dorada', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000210', aroma: 'Flores de Asia', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
            { id: '000211', aroma: 'Jardín de lavandas', stock: 1, precioVenta: 3400, precioCompra: 1944.13, stockMin: 2, pausado: false },
        ],
    },
    {
        id: '0101',
        nombre: 'Difusor de auto',
        marca: 'Aromanza',
        imagenPadre: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771265752/dif-auto_jxik6w.webp',
        variantes: [
            { id: '010101', aroma: 'Naranja pimienta', stock: 2, precioVenta: 4500, precioCompra: 2526.80, stockMin: 2, pausado: false },
            { id: '010102', aroma: 'Citronella', stock: 2, precioVenta: 4500, precioCompra: 2526.80, stockMin: 2, pausado: false },
            { id: '010103', aroma: 'Hawaiian', stock: 2, precioVenta: 4500, precioCompra: 2526.80, stockMin: 2, pausado: false },
        ],
    },
    {
        id: '0102',
        nombre: 'Difusor de ambiente Prestige x125ml',
        marca: 'Aromanza',
        imagenPadre: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771043972/dasdas_m5bkku.webp',
        variantes: [
            { id: '010201', aroma: 'Lavandas del Valle', stock: 1, precioVenta: 5000, precioCompra: 2829.60, stockMin: 2, pausado: false },
            { id: '010202', aroma: 'Papaya Tropical', stock: 1, precioVenta: 5000, precioCompra: 2829.60, stockMin: 2, pausado: false },
            { id: '010203', aroma: 'Limón y Naranja', stock: 1, precioVenta: 5000, precioCompra: 2829.60, stockMin: 2, pausado: false },
        ],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type StockStatus = 'En stock' | 'Stock bajo' | 'Sin stock';

export function getStockStatus(stock: number, min: number): { label: StockStatus; color: string } {
    if (stock === 0) return { label: 'Sin stock', color: 'bg-red-100 text-red-700' };
    if (stock < min) return { label: 'Stock bajo', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'En stock', color: 'bg-green-100 text-green-700' };
}

/** Flatten products into rows for the inventory table */
export interface TablaRow {
    productoId: string;
    varianteId: string;
    nombre: string;
    marca: string;
    variable: string;   // aroma
    stock: number;
    stockMin: number;
    precio: number;
    costo: number;
}

export function flattenToRows(): TablaRow[] {
    return PRODUCTOS_PRINCIPALES
        .filter((p) => !p.pausado)
        .flatMap((p) =>
            p.variantes
                .filter((v) => !v.pausado)
                .map((v) => ({
                    productoId: p.id,
                    varianteId: v.id,
                    nombre: p.nombre,
                    marca: p.marca,
                    variable: v.aroma,
                    stock: v.stock,
                    stockMin: v.stockMin ?? 0,
                    precio: v.precioVenta,
                    costo: v.precioCompra,
                }))
        );
}
