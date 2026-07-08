'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pencil, Trash2, Check, Plus, ChevronDown, ChevronUp,
    AlertTriangle, Search, Filter, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { createVenta, deleteVenta, type ItemVentaInput } from './actions';

// ── DB Types ──────────────────────────────────────────────────────────────────

interface Variante {
    id: string;
    aroma: string;
    precioVenta: number;
    stock: number;
}
interface ProductoDB {
    id: string;
    nombre: string;
    marca: string;
    variantes: Variante[];
}

interface ItemVenta {
    id: string;
    nombre: string;
    marca: string;
    aroma: string;
    precioVenta: number;
    cantidad: number;
    ventaId: string;
}

interface Venta {
    id: string;
    fecha: Date;
    totalVenta: number;
    metodoPago: string;
    pagado: boolean;
    items: ItemVenta[];
}

// ── UI Types ──────────────────────────────────────────────────────────────────

interface NewItem {
    id: string;
    productoId: string;
    marca: string;
    aromaId: string;
    precioVenta: string;
    cantidad: string;
    isSaved: boolean;
    isEditing: boolean;
}

type Filters = { producto: string; metodoPago: string; pagado: string };

const METODOS_PAGO = ['Transferencia', 'Efectivo', 'Transferencia y efectivo'];
const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
const mkItem = (id: string): NewItem => ({ id, productoId: '', marca: '', aromaId: '', precioVenta: '', cantidad: '', isSaved: false, isEditing: false });
function parsePrecio(s: string | number): number {
    if (typeof s === 'number') return s;
    const clean = s.replace(/[^0-9.,]/g, '');
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Field({ label, value, readOnly = false, onChange, placeholder = '', type = 'text' }: {
    label: string; value: string; readOnly?: boolean;
    onChange?: (v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary font-medium">{label}</label>
            <input
                type={type} value={value} readOnly={readOnly} placeholder={placeholder}
                onChange={(e) => onChange?.(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm w-full outline-none transition-colors ${readOnly
                    ? 'bg-gray-50 border-gray-200 text-primary cursor-default'
                    : 'bg-white border-gray-300 text-primary focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    }`}
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options, disabled = false, placeholder }: {
    label: string; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; disabled?: boolean; placeholder: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary font-medium">{label}</label>
            <div className="relative">
                <select
                    value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors pr-7 disabled:bg-gray-50 disabled:text-secondary disabled:cursor-not-allowed"
                >
                    <option value="">{placeholder}</option>
                    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary pointer-events-none" />
            </div>
        </div>
    );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ title, message, confirmLabel, danger = true, onConfirm, onCancel, isPending }: {
    title: string; message: string; confirmLabel: string; danger?: boolean;
    onConfirm: () => void; onCancel: () => void; isPending?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${danger ? 'bg-red-50' : 'bg-orange-50'}`}>
                        <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-orange-500'}`} />
                    </div>
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                </div>
                <p className="text-sm text-secondary mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={isPending} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={isPending} className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-70 ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                        {isPending ? 'Guardando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── New Sale Item Card ─────────────────────────────────────────────────────────

function NewSaleItemCard({ item, productos, onUpdate, onSave, onEdit, onDelete }: {
    item: NewItem;
    productos: ProductoDB[];
    onUpdate: (field: keyof NewItem, value: string) => void;
    onSave: () => void; onEdit: () => void; onDelete: () => void;
}) {
    const producto = productos.find((p) => p.id === item.productoId);
    const variante = producto?.variantes.find((v) => v.id === item.aromaId);
    const aromaName = variante?.aroma ?? '';
    const isReadOnly = item.isSaved && !item.isEditing;
    const isPending = !item.isSaved;

    const handleProductChange = (id: string) => {
        const p = productos.find((pr) => pr.id === id);
        onUpdate('productoId', id);
        onUpdate('marca', p?.marca ?? '');
        onUpdate('precioVenta', p ? `$${p.variantes[0]?.precioVenta.toLocaleString('es-AR') ?? ''}` : '');
        onUpdate('aromaId', '');
    };

    const handleAromaChange = (id: string) => {
        const v = producto?.variantes.find((vr) => vr.id === id);
        onUpdate('aromaId', id);
        if (v) onUpdate('precioVenta', `$${v.precioVenta.toLocaleString('es-AR')}`);
    };

    return (
        <div className={`rounded-2xl border p-5 transition-all ${isPending ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                {isReadOnly ? (
                    <>
                        <Field label="Producto" value={producto?.nombre ?? ''} readOnly />
                        <Field label="Marca" value={item.marca} readOnly />
                        <Field label="Aroma" value={aromaName} readOnly />
                    </>
                ) : (
                    <>
                        <SelectField
                            label="Producto" value={item.productoId}
                            onChange={handleProductChange} placeholder="Elegí el producto"
                            options={productos.map((p) => ({ value: p.id, label: p.nombre }))}
                        />
                        <Field label="Marca" value={item.marca} readOnly placeholder="Se completa solo" />
                        <SelectField
                            label="Aroma" value={item.aromaId}
                            onChange={handleAromaChange} placeholder="Elegí el aroma"
                            options={(producto?.variantes ?? []).map((v) => ({ value: v.id, label: v.aroma }))}
                            disabled={!item.productoId}
                        />
                    </>
                )}
            </div>
            <div className="flex flex-wrap items-end justify-between md:justify-start gap-3">
                <div className="w-40">
                    <Field label="Precio de venta" value={item.precioVenta} readOnly={isReadOnly} onChange={(v) => onUpdate('precioVenta', v)} placeholder="$0" />
                </div>
                <div className="w-28">
                    <Field label="Cantidad" value={item.cantidad} readOnly={isReadOnly} onChange={(v) => onUpdate('cantidad', v)} placeholder="0" type="number" />
                </div>
                <div className="ml-auto flex items-end gap-2">
                    {isPending && (
                        <button onClick={onSave} className="px-4 py-2 mt-5 sm:mt-0 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
                            Agregar al carrito
                        </button>
                    )}
                    {item.isSaved && item.isEditing && (
                        <button onClick={onSave} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                            <Check className="w-4 h-4" />
                        </button>
                    )}
                    {item.isSaved && !item.isEditing && (
                        <>
                            <button onClick={onEdit} className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors" title="Editar">
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={onDelete} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Quitar">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── History Card ──────────────────────────────────────────────────────────────

function HistoryVentaCard({ venta, isExpanded, onToggle, onDelete, isPending }: {
    venta: Venta;
    isExpanded: boolean;
    onToggle: () => void;
    onDelete: () => void;
    isPending: boolean;
}) {
    const fmtDate = (d: Date) => new Date(d).toLocaleDateString('es-AR');
    const displayItems = isExpanded ? venta.items : venta.items.slice(0, 2);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
                <span>Fecha: <span className="font-medium text-primary">{fmtDate(venta.fecha)}</span></span>
                <span>Total: <span className="font-medium text-primary">{fmt(venta.totalVenta)}</span></span>
                <span>Pago: <span className="font-medium text-primary">{venta.metodoPago}</span></span>
                <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${venta.pagado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {venta.pagado ? 'Pagado' : 'No pagado'}
                </span>
            </div>

            {/* Items */}
            <div className="p-4 flex flex-col gap-2">
                {displayItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                        <div><p className="text-xs text-secondary">Producto</p><p className="font-medium text-primary">{item.nombre}</p></div>
                        <div><p className="text-xs text-secondary">Aroma</p><p className="text-primary">{item.aroma}</p></div>
                        <div><p className="text-xs text-secondary">Precio unit.</p><p className="text-primary">{fmt(item.precioVenta)}</p></div>
                        <div><p className="text-xs text-secondary">Cantidad</p><p className="font-semibold text-primary">{item.cantidad}</p></div>
                    </div>
                ))}
                {!isExpanded && venta.items.length > 2 && (
                    <p className="text-xs text-secondary text-center">+{venta.items.length - 2} productos más...</p>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center">
                <button onClick={onToggle} className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors mx-auto">
                    {isExpanded
                        ? <><span>Minimizar</span><ChevronUp className="w-4 h-4" /></>
                        : <><span>Ver detalle completo</span><ChevronDown className="w-4 h-4" /></>
                    }
                </button>
                {isExpanded && (
                    <button onClick={onDelete} disabled={isPending} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50" title="Eliminar venta">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export default function SalesClient({ initialSales, productos }: { initialSales: Venta[]; productos: ProductoDB[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // ── New sale state ──────────────────────────────────────────────────────
    const [newItems, setNewItems] = useState<NewItem[]>([mkItem('initial')]);
    const [metodoPago, setMetodoPago] = useState('');
    const [pagado, setPagado] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [confirmSale, setConfirmSale] = useState(false);

    // ── History state ───────────────────────────────────────────────────────
    const [sales] = useState<Venta[]>(initialSales);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({ producto: '', metodoPago: '', pagado: '' });
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [deleteModal, setDeleteModal] = useState<string | null>(null);

    // ── New item handlers ───────────────────────────────────────────────────
    const updateItem = (id: string, field: keyof NewItem, value: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));

    const saveItem = (id: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, isSaved: true, isEditing: false } : it));

    const editItem = (id: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, isEditing: true } : it));

    const deleteItem = (id: string) =>
        setNewItems((prev) => prev.filter((it) => it.id !== id));

    const runningTotal = newItems
        .filter((it) => it.isSaved)
        .reduce((sum, it) => sum + parsePrecio(it.precioVenta) * (parseInt(it.cantidad) || 0), 0);

    const hasSaved = newItems.some((it) => it.isSaved);

    const handleRegisterSale = () => {
        const saved = newItems.filter((it) => it.isSaved);
        if (!saved.length || !metodoPago) return;

        const items: ItemVentaInput[] = saved.map((it) => {
            const producto = productos.find((p) => p.id === it.productoId);
            const variante = producto?.variantes.find((v) => v.id === it.aromaId);
            return {
                nombre: producto?.nombre ?? it.productoId,
                marca: it.marca,
                aroma: variante?.aroma ?? it.aromaId,
                precioVenta: parsePrecio(it.precioVenta),
                cantidad: parseInt(it.cantidad) || 1,
                varianteId: it.aromaId || undefined,
            };
        });

        startTransition(async () => {
            await createVenta(items, metodoPago, pagado === 'Pagado');
            setNewItems([mkItem(Date.now().toString())]);
            setMetodoPago('');
            setPagado('');
            setConfirmSale(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.refresh();
            }, 2000);
        });
    };

    // ── History handlers ────────────────────────────────────────────────────
    const filteredSales = useMemo(() => {
        const q = search.toLowerCase().trim();
        return sales.filter((v) => {
            const matchSearch = !q || v.items.some(
                (i) => i.nombre.toLowerCase().includes(q) || i.aroma.toLowerCase().includes(q)
            ) || v.metodoPago.toLowerCase().includes(q);
            const matchProducto = !filters.producto || v.items.some((i) => i.nombre === filters.producto);
            const matchMetodo = !filters.metodoPago || v.metodoPago === filters.metodoPago;
            const matchPagado = !filters.pagado || (filters.pagado === 'Pagado' ? v.pagado : !v.pagado);
            return matchSearch && matchProducto && matchMetodo && matchPagado;
        });
    }, [sales, search, filters]);

    const totalPages = Math.max(1, Math.ceil(filteredSales.length / PAGE_SIZE));
    const pageRows = filteredSales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const activeFilters = Object.values(filters).filter(Boolean).length;

    const productosUnicos = [...new Set(sales.flatMap((v) => v.items.map((i) => i.nombre)))];

    const handleDeleteVenta = (id: string) => {
        startTransition(async () => {
            await deleteVenta(id);
            setDeleteModal(null);
            router.refresh();
        });
    };

    return (
        <>
            {/* Success toast */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center pointer-events-none">
                    <div className="m-6 flex items-center gap-3 bg-green-600 text-white px-5 py-4 rounded-2xl shadow-xl">
                        <Check className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">¡Venta registrada correctamente!</p>
                            <p className="text-xs text-green-100 mt-0.5">El stock de los productos fue descontado.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm sale modal */}
            {confirmSale && (
                <ConfirmModal
                    title="Confirmar venta"
                    message={`Vas a registrar una venta de ${newItems.filter(it => it.isSaved).length} producto(s) por un total de ${fmt(runningTotal)}. ¿Confirmás?`}
                    confirmLabel="Confirmar venta" danger={false} isPending={isPending}
                    onConfirm={handleRegisterSale}
                    onCancel={() => setConfirmSale(false)}
                />
            )}

            {/* Delete confirmation */}
            {deleteModal && (
                <ConfirmModal
                    title="Eliminar venta"
                    message="¿Estás seguro de que querés eliminar este registro? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar" danger isPending={isPending}
                    onConfirm={() => handleDeleteVenta(deleteModal)}
                    onCancel={() => setDeleteModal(null)}
                />
            )}

            <div className="flex flex-col gap-10 max-w-5xl">

                {/* ── Registrar nueva venta ── */}
                <section>
                    <h1 className="text-3xl font-bold text-primary mb-1">Registrar nueva venta</h1>
                    <p className="text-secondary text-sm">
                        Agregá los productos vendidos, completá el método de pago y confirmá. El stock se descuenta automáticamente.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col gap-4">
                        {newItems.map((item) => (
                            <NewSaleItemCard
                                key={item.id} item={item}
                                productos={productos}
                                onUpdate={(f, v) => updateItem(item.id, f, v)}
                                onSave={() => saveItem(item.id)}
                                onEdit={() => editItem(item.id)}
                                onDelete={() => deleteItem(item.id)}
                            />
                        ))}

                        {/* Add more button */}
                        <button
                            onClick={() => setNewItems((prev) => [...prev, mkItem(Date.now().toString())])}
                            className="w-full py-3 rounded-2xl border border-dashed border-gray-300 bg-white flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:border-orange-400 hover:bg-orange-50/30 hover:text-orange-500 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar más productos
                        </button>

                        {/* Payment + confirm */}
                        {hasSaved && (
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-wrap items-end gap-4">
                                <div className="w-56">
                                    <SelectField
                                        label="Método de pago" value={metodoPago}
                                        onChange={setMetodoPago} placeholder="Seleccioná"
                                        options={METODOS_PAGO.map((m) => ({ value: m, label: m }))}
                                    />
                                </div>
                                <div className="w-40">
                                    <SelectField
                                        label="¿Pagado?" value={pagado}
                                        onChange={setPagado} placeholder="Seleccioná"
                                        options={[{ value: 'Pagado', label: 'Pagado' }, { value: 'No pagado', label: 'No pagado' }]}
                                    />
                                </div>
                                <div className="ml-auto flex flex-col items-end gap-1">
                                    <span className="text-xs text-secondary font-medium">Total de la venta</span>
                                    <span className="text-2xl font-bold text-green-600">{fmt(runningTotal)}</span>
                                </div>
                                <button
                                    onClick={() => setConfirmSale(true)}
                                    disabled={isPending || !metodoPago}
                                    className="px-8 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isPending ? 'Guardando...' : 'Confirmar venta'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Historial de ventas ── */}
                <section className="my-6">
                    <h2 className="text-3xl font-bold text-primary mb-1">Historial de ventas</h2>
                    <p className="text-secondary text-sm">Historial de tus ventas registradas en la base de datos.</p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 mb-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                                <input
                                    type="text" value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Buscar por producto, aroma o método de pago..."
                                    className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors"
                                />
                                {search && (
                                    <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary">
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

                        {showFilters && (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-primary">Filtros</span>
                                    <div className="flex items-center gap-2">
                                        {activeFilters > 0 && <button onClick={() => setFilters({ producto: '', metodoPago: '', pagado: '' })} className="text-xs text-orange-500 hover:text-orange-600 font-medium">Limpiar todo</button>}
                                        <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg text-secondary hover:bg-gray-200 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <SelectField label="Producto" value={filters.producto} onChange={(v) => { setFilters((f) => ({ ...f, producto: v })); setPage(1); }} options={productosUnicos.map((p) => ({ value: p, label: p }))} placeholder="Todos" />
                                    <SelectField label="Método de pago" value={filters.metodoPago} onChange={(v) => { setFilters((f) => ({ ...f, metodoPago: v })); setPage(1); }} options={METODOS_PAGO.map((m) => ({ value: m, label: m }))} placeholder="Todos" />
                                    <SelectField label="Estado" value={filters.pagado} onChange={(v) => { setFilters((f) => ({ ...f, pagado: v })); setPage(1); }} options={[{ value: 'Pagado', label: 'Pagado' }, { value: 'No pagado', label: 'No pagado' }]} placeholder="Todos" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-4">
                        {pageRows.length > 0 ? pageRows.map((venta) => (
                            <HistoryVentaCard
                                key={venta.id}
                                venta={venta}
                                isExpanded={!!expanded[venta.id]}
                                onToggle={() => setExpanded((prev) => ({ ...prev, [venta.id]: !prev[venta.id] }))}
                                onDelete={() => setDeleteModal(venta.id)}
                                isPending={isPending}
                            />
                        )) : (
                            <div className="text-center py-12 text-secondary text-sm bg-white rounded-2xl border border-gray-100">
                                No hay ventas registradas{search || activeFilters > 0 ? ' que coincidan con los filtros.' : ' todavía.'}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-secondary">Mostrando {pageRows.length} de {filteredSales.length} ventas</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs text-secondary px-2">Pág. {page} / {totalPages}</span>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
