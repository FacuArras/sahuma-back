// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductoVariable {
    id: string;
    nombre: string;   // aroma
    cantidadInicial: number;
    precio: number;
    descuento: number;
    stockMin: number;
    pausado: boolean;
    imagen?: string;
}

export interface Producto {
    id: string;
    nombre: string;
    marca: string;
    categoria: string;
    precioCompra: number;
    precioVenta: number;
    descuento: number;
    pausado: boolean;
    imagen?: string;
    variables: ProductoVariable[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export let PRODUCTOS: Producto[] = [
    {
        id: '0001',
        nombre: 'Sahumerio palo santo buena onda',
        marca: 'Aromanza',
        categoria: 'Sahumerio',
        precioCompra: 805.88,
        precioVenta: 2000,
        descuento: 0,
        pausado: false,
        imagen: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771043795/buenaonda_b7wnvx.jpg',
        variables: [
            { id: '000101', nombre: 'Sándalo hindú', cantidadInicial: 2, precio: 2000, descuento: 0, stockMin: 2, pausado: false, imagen: "https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771043795/buenaonda_b7wnvx.jpg" },
            { id: '000102', nombre: 'Incienso consagrado', cantidadInicial: 2, precio: 2000, descuento: 0, stockMin: 2, pausado: false },
            { id: '000103', nombre: 'Atrae dinero', cantidadInicial: 2, precio: 2000, descuento: 0, stockMin: 2, pausado: false },
            { id: '000104', nombre: 'Variedad de aromas', cantidadInicial: 1, precio: 2000, descuento: 0, stockMin: 2, pausado: false },
            { id: '000105', nombre: 'Néctar de los dioses', cantidadInicial: 1, precio: 2000, descuento: 0, stockMin: 2, pausado: false },
            { id: '000106', nombre: 'Frutos rojos', cantidadInicial: 1, precio: 2000, descuento: 0, stockMin: 2, pausado: false },
            { id: '000107', nombre: 'Fragancia oriental', cantidadInicial: 1, precio: 2000, descuento: 0, stockMin: 2, pausado: false },
        ],
    },
    {
        id: '0002',
        nombre: 'Sahumerio Sah Tao',
        marca: 'Sagrada Madre',
        categoria: 'Sahumerio',
        precioCompra: 1944.13,
        precioVenta: 3400,
        descuento: 0,
        pausado: false,
        imagen: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771040033/sa1_zbtusp.jpg',
        variables: [
            { id: '000201', nombre: 'Luminosa', cantidadInicial: 3, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000202', nombre: 'Energía limpia', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000203', nombre: 'Sándalo hindú', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000204', nombre: 'Rosa mosqueta', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000205', nombre: 'Canela dulce', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000206', nombre: 'Spicy naranja', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000207', nombre: 'Sándalo', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000208', nombre: 'Encanto floral', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000209', nombre: 'Belleza dorada', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000210', nombre: 'Flores de Asia', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
            { id: '000211', nombre: 'Jardín de lavandas', cantidadInicial: 1, precio: 3400, descuento: 0, stockMin: 2, pausado: false },
        ],
    },
    {
        id: '0101',
        nombre: 'Difusor de auto',
        marca: 'Aromanza',
        categoria: 'Difusor',
        precioCompra: 2526.80,
        precioVenta: 4500,
        descuento: 0,
        pausado: false,
        imagen: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771265752/dif-auto_jxik6w.webp',
        variables: [
            { id: '010101', nombre: 'Naranja pimienta', cantidadInicial: 2, precio: 4500, descuento: 0, stockMin: 2, pausado: false },
            { id: '010102', nombre: 'Citronella', cantidadInicial: 2, precio: 4500, descuento: 0, stockMin: 2, pausado: false },
            { id: '010103', nombre: 'Hawaiian', cantidadInicial: 2, precio: 4500, descuento: 0, stockMin: 2, pausado: false },
        ],
    },
    {
        id: '0102',
        nombre: 'Difusor de ambiente Prestige x125ml',
        marca: 'Aromanza',
        categoria: 'Difusor',
        precioCompra: 2829.60,
        precioVenta: 5000,
        descuento: 0,
        pausado: false,
        imagen: 'https://res.cloudinary.com/dqfwdlvrc/image/upload/v1771043972/dasdas_m5bkku.webp',
        variables: [
            { id: '010201', nombre: 'Lavandas del Valle', cantidadInicial: 1, precio: 5000, descuento: 0, stockMin: 2, pausado: false },
            { id: '010202', nombre: 'Papaya Tropical', cantidadInicial: 1, precio: 5000, descuento: 0, stockMin: 2, pausado: false },
            { id: '010203', nombre: 'Limón y Naranja', cantidadInicial: 1, precio: 5000, descuento: 0, stockMin: 2, pausado: false },
        ],
    }
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
    variableId: string;
    nombre: string;
    marca: string;
    variable: string;
    stock: number;
    stockMin: number;
    precio: number;
    costo: number;
}

export function flattenToRows(): TablaRow[] {
    return PRODUCTOS
        .filter((p) => !p.pausado)
        .flatMap((p) =>
            p.variables
                .filter((v) => !v.pausado)
                .map((v) => ({
                    productoId: p.id,
                    variableId: v.id,
                    nombre: p.nombre,
                    marca: p.marca,
                    variable: v.nombre,
                    stock: v.cantidadInicial,
                    stockMin: v.stockMin,
                    precio: v.precio,
                    costo: p.precioCompra,
                }))
        );
}
