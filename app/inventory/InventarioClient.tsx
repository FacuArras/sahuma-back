'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Search, Filter, TrendingDown, AlertCircle, X,
    ChevronDown, Pencil, Package, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getStockStatus } from '@/lib/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TablaRowDB {
    productoId: string;
    varianteId: string;
    nombre: string;
    marca: string;
    variable: string;   // aroma
    stock: number;
    stockMin: number;
    precio: number;
    costo: number;
    pausadoProducto: boolean;
    pausadoVariante: boolean;
}

export interface InventarioStats {
    totalStock: number;
    sinStock: number;
    stockBajo: number;
    valorInventario: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const ESTADOS = ['En stock', 'Stock bajo', 'Sin stock'] as const;

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
    filters,
    setFilters,
    onClose,
    rows,
}: {
    filters: { estado: string; producto: string; variable: string };
    setFilters: (v: { estado: string; producto: string; variable: string }) => void;
    onClose: () => void;
    rows: TablaRowDB[];
}) {
    const productos = [...new Set(rows.map((r) => r.nombre))];
    const variables = [...new Set(rows.map((r) => r.variable))];

    const hasActiveFilters = filters.estado || filters.producto || filters.variable;
    const clearAll = () => setFilters({ estado: '', producto: '', variable: '' });

    const selectClass =
        'w-full appearance-none bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-primary outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors pr-8';

    return (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Filtros</span>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button onClick={clearAll} className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                            Limpiar todo
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 rounded-lg text-secondary hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Estado */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary font-medium">Estado</label>
                    <div className="relative">
                        <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })} className={selectClass}>
                            <option value="">Todos</option>
                            {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
                    </div>
                </div>

                {/* Producto */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary font-medium">Producto</label>
                    <div className="relative">
                        <select value={filters.producto} onChange={(e) => setFilters({ ...filters, producto: e.target.value })} className={selectClass}>
                            <option value="">Todos</option>
                            {productos.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
                    </div>
                </div>

                {/* Aroma */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary font-medium">Aroma</label>
                    <div className="relative">
                        <select value={filters.variable} onChange={(e) => setFilters({ ...filters, variable: e.target.value })} className={selectClass}>
                            <option value="">Todos</option>
                            {variables.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main client component ────────────────────────────────────────────────────

export default function InventarioClient({
    rows,
    stats,
}: {
    rows: TablaRowDB[];
    stats: InventarioStats;
}) {
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ estado: '', producto: '', variable: '' });
    const [page, setPage] = useState(1);

    const filteredRows = useMemo(() => {
        const q = search.toLowerCase().trim();
        return rows.filter((p) => {
            const status = getStockStatus(p.stock, p.stockMin).label;
            if (q && !p.nombre.toLowerCase().includes(q) && !p.marca.toLowerCase().includes(q) && !p.variable.toLowerCase().includes(q)) return false;
            if (filters.estado && status !== filters.estado) return false;
            if (filters.producto && p.nombre !== filters.producto) return false;
            if (filters.variable && p.variable !== filters.variable) return false;
            return true;
        });
    }, [rows, search, filters]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleSearch = (v: string) => { setSearch(v); setPage(1); };
    const handleFilters = (v: typeof filters) => { setFilters(v); setPage(1); };
    const activeFilterCount = [filters.estado, filters.producto, filters.variable].filter(Boolean).length;

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary mb-1">Inventario</h1>
                <p className="text-secondary text-sm">Gestioná el stock de tus productos y variantes.</p>
                <hr className='mt-3 border-orange-100' />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="w-3.5 h-3.5 text-orange-400" />
                        <p className="text-xs text-secondary font-medium">Stock total</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{stats.totalStock}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        <p className="text-xs text-secondary font-medium">Sin stock</p>
                    </div>
                    <p className="text-2xl font-bold text-red-500">{stats.sinStock}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="w-3.5 h-3.5 text-yellow-500" />
                        <p className="text-xs text-secondary font-medium">Stock bajo</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-500">{stats.stockBajo}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <p className="text-xs text-secondary font-medium mb-1">Valor inventario</p>
                    <p className="text-2xl font-bold text-primary">
                        ${stats.valorInventario.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 p-5 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Buscar por producto, marca o aroma..."
                                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                            />
                            {search && (
                                <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters((v) => !v)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters || activeFilterCount > 0
                                ? 'border-orange-400 bg-orange-50 text-orange-600'
                                : 'border-gray-200 text-secondary hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filtrar
                            {activeFilterCount > 0 && (
                                <span className="ml-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {showFilters && (
                        <FilterPanel
                            filters={filters}
                            setFilters={handleFilters}
                            onClose={() => setShowFilters(false)}
                            rows={rows}
                        />
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-center text-secondary text-xs font-semibold uppercase tracking-wide">
                                <th className="px-5 py-3 text-left">Producto</th>
                                <th className="px-5 py-3">Aroma</th>
                                <th className="px-5 py-3">Estado</th>
                                <th className="px-5 py-3">Precio de venta</th>
                                <th className="px-5 py-3">Stock</th>
                                <th className="px-5 py-3">Editar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-center">
                            {pageRows.length > 0 ? (
                                pageRows.map((p) => {
                                    const isPaused = p.pausadoProducto || p.pausadoVariante;
                                    const status = isPaused
                                        ? { label: 'Pausado', color: 'bg-gray-200 text-gray-500' }
                                        : getStockStatus(p.stock, p.stockMin);
                                    return (
                                        <tr key={p.varianteId} className={`transition-colors ${isPaused ? 'bg-gray-100 opacity-70 hover:opacity-90' : 'hover:bg-gray-50/60'
                                            }`}>
                                            <td className="px-5 py-4 text-left">
                                                <p className={`font-medium ${isPaused ? 'text-gray-400' : 'text-primary'}`}>{p.nombre}</p>
                                                <p className="text-xs text-secondary">{p.marca}</p>
                                            </td>
                                            <td className={`px-5 py-4 ${isPaused ? 'text-gray-400' : 'text-secondary'}`}>{p.variable}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className={`px-5 py-4 ${isPaused ? 'text-gray-400' : 'text-primary'}`}>
                                                ${p.precio.toLocaleString('es-AR')}
                                            </td>
                                            <td className={`px-5 py-4 font-semibold ${isPaused ? 'text-gray-400' : 'text-primary'}`}>
                                                {p.stock}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Link
                                                    href={`/inventory/${p.productoId}`}
                                                    title={`Editar ${p.nombre}`}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-secondary text-sm">
                                        No se encontraron resultados para tu búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: row count + pagination */}
                <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-secondary">
                        Mostrando {pageRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{(safePage - 1) * PAGE_SIZE + pageRows.length} de {filteredRows.length} registros
                    </p>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="p-1.5 rounded-lg text-secondary hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setPage(n)}
                                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${n === safePage
                                        ? 'bg-orange-500 text-white'
                                        : 'text-secondary hover:bg-gray-100'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="p-1.5 rounded-lg text-secondary hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
