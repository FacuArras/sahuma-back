'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, Plus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { createOrder, updateOrder, deleteOrder, type ItemInput } from './actions';

// ── DB Types (mirrored from schema) ──────────────────────────────────────────
interface Variante {
    id: string;
    aroma: string;
    precioCompra: number;
}
interface ProductoDB {
    id: string;
    nombre: string;
    marca: string;
    variantes: Variante[];
}

interface ItemPedido {
    id: string;
    nombre: string;
    marca: string;
    aroma: string;
    precioCompra: number;
    cantidad: number;
    pedidoId: string;
}

interface Pedido {
    id: string;
    fecha: Date;
    costoTotal: number;
    gananciaTotal: number;
    createdAt: Date;
    updatedAt: Date;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PedidoWithItems = Pedido & { items: ItemPedido[] };

interface NewItem {
    id: string;
    productoId: string;
    marca: string;
    aromaId: string;
    precioCompra: string;
    cantidad: string;
    isSaved: boolean;
    isEditing: boolean;
}

type ActiveModal =
    | { kind: 'deleteOrder'; orderId: string }
    | { kind: 'saveOrder'; orderId: string }
    | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
const mkItem = (id: string): NewItem => ({ id, productoId: '', marca: '', aromaId: '', precioCompra: '', cantidad: '', isSaved: false, isEditing: false });

function parsePrecio(s: string | number): number {
    if (typeof s === 'number') return s;
    const clean = s.replace(/[^0-9.,]/g, '');
    // Argentine format: dots = thousands separator, comma = decimal separator.
    // Remove all dots first, then swap comma for dot.
    return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Field({ label, value, readOnly = false, onChange, placeholder = '' }: {
    label: string; value: string; readOnly?: boolean;
    onChange?: (v: string) => void; placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary font-medium">{label}</label>
            <input
                type="text" value={value} readOnly={readOnly} placeholder={placeholder}
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

// ── New Order Item Card ───────────────────────────────────────────────────────

function NewOrderItemCard({ item, productos, onUpdate, onSave, onEdit, onDelete }: {
    item: NewItem;
    productos: ProductoDB[];
    onUpdate: (field: keyof NewItem, value: string) => void;
    onSave: () => void; onEdit: () => void; onDelete: () => void;
}) {
    const producto = productos.find((p) => p.id === item.productoId);
    const aromaName = producto?.variantes.find((v) => v.id === item.aromaId)?.aroma ?? '';
    const isReadOnly = item.isSaved && !item.isEditing;
    const isPending = !item.isSaved;

    const handleProductChange = (id: string) => {
        const p = productos.find((pr) => pr.id === id);
        onUpdate('productoId', id);
        onUpdate('marca', p?.marca ?? '');
        onUpdate('precioCompra', p ? `$${p.variantes[0]?.precioCompra.toLocaleString('es-AR') ?? ''}` : '');
        onUpdate('aromaId', '');
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
                            onChange={handleProductChange} placeholder="Elegí tu producto"
                            options={productos.map((p) => ({ value: p.id, label: p.nombre }))}
                        />
                        <Field label="Marca" value={item.marca} readOnly placeholder="Elegí la marca" />
                        <SelectField
                            label="Aroma" value={item.aromaId}
                            onChange={(v) => onUpdate('aromaId', v)} placeholder="Elegí el aroma"
                            options={(producto?.variantes ?? []).map((v) => ({ value: v.id, label: v.aroma }))}
                            disabled={!item.productoId}
                        />
                    </>
                )}
            </div>
            <div className="flex flex-wrap items-end justify-between md:justify-start gap-3">
                <div className="w-40">
                    <Field label="Precio de compra" value={item.precioCompra} readOnly={isReadOnly} onChange={(v) => onUpdate('precioCompra', v)} placeholder="$0" />
                </div>
                <div className="w-28">
                    <Field label="Cantidad" value={item.cantidad} readOnly={isReadOnly} onChange={(v) => onUpdate('cantidad', v)} placeholder="0" />
                </div>
                <div className="ml-auto flex items-end gap-2">
                    {isPending && (
                        <button onClick={onSave} className="px-4 py-2 mt-5 sm:mt-0 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
                            Agregar al pedido
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
                            <button onClick={onDelete} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── History Item Card ─────────────────────────────────────────────────────────

function HistoryItemCard({ item, editable, onChange }: {
    item: ItemPedido; editable: boolean;
    onChange?: (field: keyof ItemInput, value: string) => void;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Producto" value={item.nombre} readOnly={!editable} onChange={(v) => onChange?.('nombre', v)} />
                <Field label="Marca" value={item.marca} readOnly={!editable} onChange={(v) => onChange?.('marca', v)} />
                <Field label="Aroma" value={item.aroma} readOnly={!editable} onChange={(v) => onChange?.('aroma', v)} />
            </div>
            <div className="flex gap-3 sm:max-w-xs">
                <Field label="Precio de compra" value={`$${item.precioCompra.toLocaleString('es-AR')}`} readOnly={!editable} onChange={(v) => onChange?.('precioCompra', v)} />
                <Field label="Cantidad" value={String(item.cantidad)} readOnly={!editable} onChange={(v) => onChange?.('cantidad', v)} />
            </div>
        </div>
    );
}

// ── History Order Card ────────────────────────────────────────────────────────

function HistoryOrderCard({ order, onToggle, onStartEdit, onCancelEdit, setModal, editDraft, onChangeDraft, isEditing, isExpanded }: {
    order: PedidoWithItems;
    onToggle: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    setModal: (m: ActiveModal) => void;
    editDraft: ItemInput[];
    onChangeDraft: (idx: number, field: keyof ItemInput, value: string) => void;
    isEditing: boolean;
    isExpanded: boolean;
}) {
    const displayItems = isExpanded
        ? (isEditing ? order.items : order.items)
        : order.items.slice(0, 2);

    const fmtDate = (d: Date) => new Date(d).toLocaleDateString('es-AR');

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-secondary">
                Fecha de pedido: <span className="font-medium text-primary">{fmtDate(order.fecha)}</span>
                {' · '}Coste total del pedido: <span className="font-medium text-primary">{fmt(order.costoTotal)}</span>
                {' · '}Ganancia aproximada total: <span className="font-medium text-primary">{fmt(order.gananciaTotal)}</span>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {displayItems.map((item: ItemPedido, idx: number) => (
                    <HistoryItemCard
                        key={item.id} item={isEditing ? { ...item, precioCompra: editDraft[idx]?.precioCompra ?? item.precioCompra, cantidad: editDraft[idx]?.cantidad ?? item.cantidad, nombre: editDraft[idx]?.nombre ?? item.nombre, marca: editDraft[idx]?.marca ?? item.marca, aroma: editDraft[idx]?.aroma ?? item.aroma } : item}
                        editable={isExpanded && isEditing}
                        onChange={(f, v) => onChangeDraft(idx, f, v)}
                    />
                ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center">
                <button onClick={onToggle} className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors mx-auto">
                    {isExpanded
                        ? <>Minimizar pedido <ChevronUp className="w-4 h-4" /> </>
                        : <>Ver pedido completo <ChevronDown className="w-4 h-4" /></>
                    }
                </button>

                {isExpanded && !isEditing && (
                    <div className="flex gap-2 ml-4">
                        <button onClick={onStartEdit} className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors" title="Editar pedido">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setModal({ kind: 'deleteOrder', orderId: order.id })} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar pedido">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {isExpanded && isEditing && (
                    <div className="flex gap-2 ml-4">
                        <button onClick={onCancelEdit} className="px-3 py-2 rounded-lg border border-gray-200 text-xs text-secondary hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button onClick={() => setModal({ kind: 'saveOrder', orderId: order.id })} className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors" title="Guardar cambios">
                            <Check className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export default function OrdersClient({ initialOrders, productos }: { initialOrders: PedidoWithItems[]; productos: ProductoDB[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [newItems, setNewItems] = useState<NewItem[]>([mkItem('initial')]);
    const [modal, setModal] = useState<ActiveModal>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Expansion / editing state per order (keyed by order id)
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editing, setEditing] = useState<Record<string, boolean>>({});
    const [drafts, setDrafts] = useState<Record<string, ItemInput[]>>({});

    // ── New order handlers ──────────────────────────────────────────────────
    const updateItem = (id: string, field: keyof NewItem, value: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));

    const saveItem = (id: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, isSaved: true, isEditing: false } : it));

    const editItem = (id: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, isEditing: true } : it));

    const deleteItem = (id: string) =>
        setNewItems((prev) => prev.filter((it) => it.id !== id));

    // ── Running total ───────────────────────────────────────────────────────
    const runningTotal = newItems
        .filter((it) => it.isSaved)
        .reduce((sum, it) => sum + parsePrecio(it.precioCompra) * (parseInt(it.cantidad) || 0), 0);

    const handleRegisterOrder = () => {
        const saved = newItems.filter((it) => it.isSaved);
        if (!saved.length) return;

        const items: ItemInput[] = saved.map((it) => {
            const producto = productos.find((p) => p.id === it.productoId);
            const variante = producto?.variantes.find((v) => v.id === it.aromaId);
            return {
                nombre: producto?.nombre ?? it.productoId,
                marca: it.marca,
                aroma: variante?.aroma ?? it.aromaId,
                precioCompra: parsePrecio(it.precioCompra),
                cantidad: parseInt(it.cantidad) || 1,
                varianteId: it.aromaId || undefined,
            };
        });

        startTransition(async () => {
            await createOrder(items);
            setNewItems([mkItem(Date.now().toString())]);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                router.refresh();
            }, 2000);
        });
    };

    // ── History handlers ────────────────────────────────────────────────────
    const toggleExpand = (id: string) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    const startEdit = (order: PedidoWithItems) => {
        setEditing((prev) => ({ ...prev, [order.id]: true }));
        setExpanded((prev) => ({ ...prev, [order.id]: true }));
        setDrafts((prev) => ({
            ...prev,
            [order.id]: order.items.map((i) => ({
                nombre: i.nombre, marca: i.marca, aroma: i.aroma,
                precioCompra: i.precioCompra, cantidad: i.cantidad,
            })),
        }));
    };

    const cancelEdit = (id: string) => {
        setEditing((prev) => ({ ...prev, [id]: false }));
        setDrafts((prev) => { const n = { ...prev }; delete n[id]; return n; });
    };

    const changeDraft = (orderId: string, idx: number, field: keyof ItemInput, value: string) =>
        setDrafts((prev) => {
            const d = [...(prev[orderId] ?? [])];
            d[idx] = { ...d[idx], [field]: value };
            return { ...prev, [orderId]: d };
        });

    const handleSaveEdit = (orderId: string) => {
        const draft = drafts[orderId] ?? [];
        const items: ItemInput[] = draft.map((d) => ({
            ...d,
            precioCompra: typeof d.precioCompra === 'string' ? parsePrecio(d.precioCompra as unknown as string) : d.precioCompra,
            cantidad: typeof d.cantidad === 'string' ? parseInt(d.cantidad as unknown as string) || 1 : d.cantidad,
        }));

        startTransition(async () => {
            await updateOrder(orderId, items);
            cancelEdit(orderId);
            setModal(null);
            router.refresh();
        });
    };

    const handleDeleteOrder = (orderId: string) => {
        startTransition(async () => {
            await deleteOrder(orderId);
            setModal(null);
            router.refresh();
        });
    };

    const hasSaved = newItems.some((it) => it.isSaved);


    return (
        <>
            {/* Success toast */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center pointer-events-none">
                    <div className="m-6 flex items-center gap-3 bg-green-600 text-white px-5 py-4 rounded-2xl shadow-xl">
                        <Check className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">¡Pedido registrado correctamente!</p>
                            <p className="text-xs text-green-100 mt-0.5">El stock de los productos fue actualizado.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {modal?.kind === 'deleteOrder' && (

                <ConfirmModal
                    title="Eliminar pedido"
                    message="¿Estás seguro de que querés eliminar este pedido? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar pedido" danger isPending={isPending}
                    onConfirm={() => handleDeleteOrder(modal.orderId)}
                    onCancel={() => setModal(null)}
                />
            )}
            {modal?.kind === 'saveOrder' && (
                <ConfirmModal
                    title="Guardar cambios"
                    message="¿Estás seguro de que querés guardar los cambios realizados en este pedido?"
                    confirmLabel="Guardar" danger={false} isPending={isPending}
                    onConfirm={() => handleSaveEdit(modal.orderId)}
                    onCancel={() => setModal(null)}
                />
            )}

            <div className="flex flex-col gap-10 max-w-4xl">

                {/* ── Crear pedido nuevo ── */}
                <section>
                    <h1 className="text-3xl font-bold text-primary mb-1">Crear pedido nuevo</h1>
                    <p className="text-secondary text-sm">
                        Formulario para ingresar las compras hechas en el mes, todo producto va a ser agregado automáticamente al stock.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col gap-4">
                        {newItems.map((item) => (
                            <NewOrderItemCard
                                key={item.id} item={item}
                                productos={productos}
                                onUpdate={(f, v) => updateItem(item.id, f, v)}
                                onSave={() => saveItem(item.id)}
                                onEdit={() => editItem(item.id)}
                                onDelete={() => deleteItem(item.id)}
                            />
                        ))}

                        <button
                            onClick={() => setNewItems((prev) => [...prev, mkItem(Date.now().toString())])}
                            className="w-full py-3 rounded-2xl border border-dashed border-gray-300 bg-white flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:border-orange-400 hover:bg-orange-50/30 hover:text-orange-500 transition-colors"
                        >
                            Agregar más productos
                            <Plus className="w-4 h-4" />
                        </button>

                        {hasSaved && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-secondary font-medium">Total del pedido</span>
                                    <span className="text-2xl font-bold text-green-600">{fmt(runningTotal)}</span>
                                </div>
                                <button
                                    onClick={handleRegisterOrder}
                                    disabled={isPending}
                                    className="px-8 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200 disabled:opacity-70"
                                >
                                    {isPending ? 'Guardando...' : 'Registrar pedido'}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Historial de pedidos ── */}
                <section className='my-6'>
                    <h2 className="text-2xl font-bold text-primary mb-1">Historial de pedidos</h2>
                    <p className="text-secondary text-sm mb-6">
                        En esta sección vas a poder visualizar todos los pedidos realizados desde que se creó la aplicación.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col gap-6">
                        {initialOrders.map((order: PedidoWithItems) => (
                            <HistoryOrderCard
                                key={order.id} order={order}
                                isExpanded={!!expanded[order.id]}
                                isEditing={!!editing[order.id]}
                                editDraft={drafts[order.id] ?? []}
                                onToggle={() => toggleExpand(order.id)}
                                onStartEdit={() => startEdit(order)}
                                onCancelEdit={() => cancelEdit(order.id)}
                                setModal={setModal}
                                onChangeDraft={(idx, f, v) => changeDraft(order.id, idx, f, v)}
                            />
                        ))}
                        {initialOrders.length === 0 && (
                            <div className="text-center py-12 text-secondary text-sm bg-white rounded-2xl border border-gray-100">
                                No hay pedidos registrados todavía.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
