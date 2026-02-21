'use client';

import { useState, useMemo } from 'react';
import { PRODUCTOS } from '@/lib/mockData';
import { Search, Filter, ChevronDown, X, ChevronLeft, ChevronRight, Pencil, Trash2, AlertTriangle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SaleRecord {
    id: string;
    fecha: string;
    mes: string;
    anio: string;
    nombre: string;
    marca: string;
    aroma: string;
    precioVenta: string;
    cantidad: string;
    metodoPago: string;
    pagado: string;
}

type EditModal = { kind: 'edit'; sale: SaleRecord } | { kind: 'delete'; saleId: string } | null;

const METODOS_PAGO = ['Transferencia', 'Efectivo', 'Transferencia y efectivo'];
const PAGADO_OPTS = ['Pagado', 'No pagado'];
type Filters = { producto: string; aroma: string; mes: string; anio: string; metodoPago: string };

// ── Mock sales history ────────────────────────────────────────────────────────

const MOCK_SALES_INIT: SaleRecord[] = [
    { id: 's1', fecha: '01/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Lavanda', precioVenta: '$3.400', cantidad: '2', metodoPago: 'Efectivo', pagado: 'Pagado' },
    { id: 's2', fecha: '03/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Flora', marca: 'Shama', aroma: 'Naranja', precioVenta: '$2.900', cantidad: '1', metodoPago: 'Transferencia', pagado: 'Pagado' },
    { id: 's3', fecha: '05/01/2026', mes: 'Enero', anio: '2026', nombre: 'Incienso Zen', marca: 'Ananda', aroma: 'Sándalo', precioVenta: '$4.200', cantidad: '3', metodoPago: 'Transferencia y efectivo', pagado: 'No pagado' },
    { id: 's4', fecha: '10/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Rosa', precioVenta: '$3.400', cantidad: '1', metodoPago: 'Efectivo', pagado: 'Pagado' },
    { id: 's5', fecha: '12/01/2026', mes: 'Enero', anio: '2026', nombre: 'Incienso Zen', marca: 'Ananda', aroma: 'Menta', precioVenta: '$4.200', cantidad: '2', metodoPago: 'Transferencia', pagado: 'Pagado' },
    { id: 's6', fecha: '15/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Flora', marca: 'Shama', aroma: 'Jazmín', precioVenta: '$2.900', cantidad: '4', metodoPago: 'Efectivo', pagado: 'No pagado' },
    { id: 's7', fecha: '18/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Lavanda', precioVenta: '$3.400', cantidad: '2', metodoPago: 'Transferencia', pagado: 'Pagado' },
    { id: 's8', fecha: '20/01/2026', mes: 'Enero', anio: '2026', nombre: 'Incienso Zen', marca: 'Ananda', aroma: 'Sándalo', precioVenta: '$4.200', cantidad: '1', metodoPago: 'Efectivo', pagado: 'Pagado' },
    { id: 's9', fecha: '22/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Flora', marca: 'Shama', aroma: 'Naranja', precioVenta: '$2.900', cantidad: '3', metodoPago: 'Transferencia y efectivo', pagado: 'Pagado' },
    { id: 's10', fecha: '25/01/2026', mes: 'Enero', anio: '2026', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Rosa', precioVenta: '$3.400', cantidad: '2', metodoPago: 'Efectivo', pagado: 'No pagado' },
    { id: 's11', fecha: '02/02/2026', mes: 'Febrero', anio: '2026', nombre: 'Incienso Zen', marca: 'Ananda', aroma: 'Menta', precioVenta: '$4.200', cantidad: '1', metodoPago: 'Transferencia', pagado: 'Pagado' },
    { id: 's12', fecha: '08/02/2026', mes: 'Febrero', anio: '2026', nombre: 'Sahumerio Flora', marca: 'Shama', aroma: 'Jazmín', precioVenta: '$2.900', cantidad: '2', metodoPago: 'Efectivo', pagado: 'Pagado' },
    { id: 's13', fecha: '14/02/2026', mes: 'Febrero', anio: '2026', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Lavanda', precioVenta: '$3.400', cantidad: '3', metodoPago: 'Transferencia y efectivo', pagado: 'Pagado' },
];

const PAGE_SIZE = 10;

// ── Shared UI ─────────────────────────────────────────────────────────────────

const selectCls = 'w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors pr-7';

function SelectField({ label, value, onChange, options, disabled = false, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; disabled?: boolean; placeholder: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs text-secondary font-medium">{label}</label>}
            <div className="relative">
                <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={`${selectCls} ${disabled ? 'bg-gray-50 text-secondary cursor-not-allowed' : ''}`}>
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
            </div>
        </div>
    );
}

function TextField({ label, value, onChange, placeholder = '' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label className="text-xs text-secondary font-medium">{label}</label>}
            <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors w-full" />
        </div>
    );
}

// ── Edit / Delete Modal ────────────────────────────────────────────────────────

function EditSaleModal({ sale, onSave, onDelete, onClose }: {
    sale: SaleRecord;
    onSave: (updated: SaleRecord) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}) {
    const [draft, setDraft] = useState<SaleRecord>({ ...sale });
    const [confirmDelete, setConfirmDelete] = useState(false);

    const set = (field: keyof SaleRecord, value: string) => setDraft((d) => ({ ...d, [field]: value }));

    const selectedProducto = PRODUCTOS.find((p) => p.nombre === draft.nombre);
    const handleProductoChange = (nombre: string) => {
        const p = PRODUCTOS.find((pr) => pr.nombre === nombre);
        setDraft((d) => ({ ...d, nombre, marca: p?.marca ?? '', aroma: '', precioVenta: p ? `$${p.precioVenta.toLocaleString('es-AR')}` : '' }));
    };

    if (confirmDelete) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                        <h3 className="text-lg font-bold text-primary">Eliminar venta</h3>
                    </div>
                    <p className="text-sm text-secondary mb-6">¿Estás seguro de que querés eliminar este registro de venta? Esta acción no se puede deshacer.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button onClick={() => onDelete(sale.id)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">Eliminar</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-primary">Editar venta</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-secondary hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                </div>

                {/* Form */}
                <div className="p-6 flex flex-col gap-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField
                            label="Producto" value={draft.nombre} onChange={handleProductoChange}
                            options={PRODUCTOS.map((p) => ({ value: p.nombre, label: p.nombre }))} placeholder="Seleccioná"
                        />
                        <SelectField
                            label="Aroma" value={draft.aroma}
                            onChange={(v) => set('aroma', v)}
                            options={(selectedProducto?.variables ?? []).map((v) => ({ value: v.nombre, label: v.nombre }))}
                            disabled={!draft.nombre} placeholder="Seleccioná"
                        />
                    </div>
                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-3">
                        <TextField label="Precio de venta" value={draft.precioVenta} onChange={(v) => set('precioVenta', v)} placeholder="$0" />
                        <TextField label="Cantidad" value={draft.cantidad} onChange={(v) => set('cantidad', v)} placeholder="0" />
                    </div>
                    {/* Row 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SelectField
                            label="Método de pago" value={draft.metodoPago} onChange={(v) => set('metodoPago', v)}
                            options={METODOS_PAGO.map((m) => ({ value: m, label: m }))} placeholder="Seleccioná"
                        />
                        <SelectField
                            label="¿Pagado?" value={draft.pagado} onChange={(v) => set('pagado', v)}
                            options={PAGADO_OPTS.map((o) => ({ value: o, label: o }))} placeholder="Seleccioná"
                        />
                    </div>
                    <TextField label="Fecha" value={draft.fecha} onChange={(v) => set('fecha', v)} placeholder="DD/MM/AAAA" />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors">
                        <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button onClick={() => onSave(draft)} className="px-5 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Filter Panel ──────────────────────────────────────────────────────────────

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function FilterPanel({ filters, setFilters, onClose, sales }: {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    onClose: () => void;
    sales: SaleRecord[];
}) {
    const productos = [...new Set(sales.map((s) => s.nombre))];
    const aromas = [...new Set(sales.map((s) => s.aroma))];
    const anios = [...new Set(sales.map((s) => s.anio))];
    const hasFilters = Object.values(filters).some(Boolean);
    const clear = () => setFilters({ producto: '', aroma: '', mes: '', anio: '', metodoPago: '' });

    return (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">Filtros</span>
                <div className="flex items-center gap-2">
                    {hasFilters && <button onClick={clear} className="text-xs text-orange-500 hover:text-orange-600 font-medium">Limpiar todo</button>}
                    <button onClick={onClose} className="p-1 rounded-lg text-secondary hover:bg-gray-200 transition-colors"><X className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <SelectField label="Producto" value={filters.producto} onChange={(v) => setFilters((f) => ({ ...f, producto: v }))} options={productos.map((p) => ({ value: p, label: p }))} placeholder="Todos" />
                <SelectField label="Aroma" value={filters.aroma} onChange={(v) => setFilters((f) => ({ ...f, aroma: v }))} options={aromas.map((a) => ({ value: a, label: a }))} placeholder="Todos" />
                <SelectField label="Mes" value={filters.mes} onChange={(v) => setFilters((f) => ({ ...f, mes: v }))} options={MESES.map((m) => ({ value: m, label: m }))} placeholder="Todos" />
                <SelectField label="Año" value={filters.anio} onChange={(v) => setFilters((f) => ({ ...f, anio: v }))} options={anios.map((a) => ({ value: a, label: a }))} placeholder="Todos" />
                <SelectField label="Método de pago" value={filters.metodoPago} onChange={(v) => setFilters((f) => ({ ...f, metodoPago: v }))} options={METODOS_PAGO.map((m) => ({ value: m, label: m }))} placeholder="Todos" />
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VentasPage() {
    // ── New sale form ──────────────────────────────────────────────────────
    const [form, setForm] = useState({ productoId: '', aromaId: '', precioVenta: '', metodoPago: '', pagado: '', cantidad: '' });
    const selectedProducto = PRODUCTOS.find((p) => p.id === form.productoId);

    const handleProductoChange = (id: string) => {
        const p = PRODUCTOS.find((pr) => pr.id === id);
        setForm({ ...form, productoId: id, aromaId: '', precioVenta: p ? `$${p.precioVenta.toLocaleString('es-AR')}` : '' });
    };

    const handleConfirm = () => {
        setForm({ productoId: '', aromaId: '', precioVenta: '', metodoPago: '', pagado: '', cantidad: '' });
    };

    // ── History state ──────────────────────────────────────────────────────
    const [sales, setSales] = useState<SaleRecord[]>(MOCK_SALES_INIT);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({ producto: '', aroma: '', mes: '', anio: '', metodoPago: '' });
    const [page, setPage] = useState(1);
    const [editModal, setEditModal] = useState<EditModal>(null);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return sales.filter((s) => {
            if (q && !s.nombre.toLowerCase().includes(q) && !s.aroma.toLowerCase().includes(q) && !s.fecha.includes(q)) return false;
            if (filters.producto && s.nombre !== filters.producto) return false;
            if (filters.aroma && s.aroma !== filters.aroma) return false;
            if (filters.mes && s.mes !== filters.mes) return false;
            if (filters.anio && s.anio !== filters.anio) return false;
            if (filters.metodoPago && s.metodoPago !== filters.metodoPago) return false;
            return true;
        });
    }, [sales, search, filters]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const activeFilters = Object.values(filters).filter(Boolean).length;

    const handleSearch = (v: string) => { setSearch(v); setPage(1); };
    const handleFilters = (f: React.SetStateAction<Filters>) => { setFilters(f); setPage(1); };

    const handleSaveEdit = (updated: SaleRecord) => {
        setSales((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        setEditModal(null);
    };

    const handleDelete = (id: string) => {
        setSales((prev) => prev.filter((s) => s.id !== id));
        setEditModal(null);
    };

    const pagadoBadge = (v: string) => v === 'Pagado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

    return (
        <>
            {/* Edit modal */}
            {editModal?.kind === 'edit' && (
                <EditSaleModal
                    sale={editModal.sale}
                    onSave={handleSaveEdit}
                    onDelete={handleDelete}
                    onClose={() => setEditModal(null)}
                />
            )}

            <div className="flex flex-col gap-10 max-w-5xl">

                {/* ── Registrar nueva venta ── */}
                <section>
                    <h1 className="text-3xl font-bold text-primary mb-1">Registrar nueva venta</h1>
                    <p className="text-secondary text-sm">
                        Completando el siguiente formulario registras una venta, el producto correspondiente se va a descontar automáticamente del stock.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <SelectField
                                label="Producto" value={form.productoId} onChange={handleProductoChange}
                                options={PRODUCTOS.map((p) => ({ value: p.id, label: p.nombre }))} placeholder="Seleccionar producto"
                            />
                            <SelectField
                                label="Aroma" value={form.aromaId}
                                onChange={(v) => setForm((f) => ({ ...f, aromaId: v }))}
                                options={(selectedProducto?.variables ?? []).map((v) => ({ value: v.id, label: v.nombre }))}
                                disabled={!form.productoId} placeholder="Seleccionar aroma"
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-secondary font-medium">Precio de venta</label>
                                <input
                                    type="number" value={form.precioVenta}
                                    onChange={(e) => setForm((f) => ({ ...f, precioVenta: e.target.value }))}
                                    placeholder="$"
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 justify-between md:justify-start items-end gap-3">
                            <SelectField label="Método de pago" value={form.metodoPago} onChange={(v) => setForm((f) => ({ ...f, metodoPago: v }))} options={METODOS_PAGO.map((m) => ({ value: m, label: m }))} placeholder="Seleccioná una opción" />
                            <SelectField label="¿Pagado?" value={form.pagado} onChange={(v) => setForm((f) => ({ ...f, pagado: v }))} options={PAGADO_OPTS.map((o) => ({ value: o, label: o }))} placeholder="Seleccioná una opción" />
                            <div className="w-28 flex flex-col gap-1">
                                <label className="text-xs text-secondary font-medium">Cantidad</label>
                                <input
                                    type="number" min={1} value={form.cantidad}
                                    onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                                    placeholder="0"
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleConfirm}
                                className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-sm"
                            >
                                Confirmar venta!
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── Historial de ventas ── */}
                <section className="my-10">
                    <h2 className="text-3xl font-bold text-primary mb-1">Historial de ventas</h2>
                    <p className="text-secondary text-sm">Historial de tus ventas desde que empezaste a usar la aplicación.</p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex flex-col gap-3 p-5 border-b border-gray-100">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                    <input
                                        type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Buscar por producto, fecha, o aroma..."
                                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                                    />
                                    {search && (
                                        <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowFilters((v) => !v)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showFilters || activeFilters > 0 ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-secondary hover:bg-gray-50'}`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filtrar
                                    {activeFilters > 0 && <span className="ml-1 bg-orange-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>}
                                </button>
                            </div>
                            {showFilters && <FilterPanel filters={filters} setFilters={handleFilters} onClose={() => setShowFilters(false)} sales={sales} />}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-center">
                                <thead>
                                    <tr className="bg-gray-50 text-secondary text-xs font-semibold uppercase tracking-wide">
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Producto</th>
                                        <th className="px-4 py-3">Aroma</th>
                                        <th className="px-4 py-3">Precio de venta</th>
                                        <th className="px-4 py-3">Cantidad</th>
                                        <th className="px-4 py-3">Método de pago</th>
                                        <th className="px-4 py-3">¿Pagado?</th>
                                        <th className="px-4 py-3">Editar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {pageRows.length > 0 ? pageRows.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-4 py-3 text-secondary whitespace-nowrap">{s.fecha}</td>
                                            <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">{s.nombre}</td>
                                            <td className="px-4 py-3 text-secondary">{s.aroma}</td>
                                            <td className="px-4 py-3 font-medium text-primary whitespace-nowrap">{s.precioVenta}</td>
                                            <td className="px-4 py-3 font-semibold text-primary">{s.cantidad}</td>
                                            <td className="px-4 py-3 text-secondary whitespace-nowrap">{s.metodoPago}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${pagadoBadge(s.pagado)}`}>{s.pagado}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setEditModal({ kind: 'edit', sale: s })}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                                                    title="Editar venta"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="px-4 py-10 text-center text-secondary text-sm">No se encontraron resultados.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-xs text-secondary">
                                Mostrando {pageRows.length} de {filtered.length} ventas
                            </span>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                        className="p-1.5 rounded-lg border border-gray-200 text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-xs text-secondary px-2">Pág. {page} / {totalPages}</span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        className="p-1.5 rounded-lg border border-gray-200 text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
