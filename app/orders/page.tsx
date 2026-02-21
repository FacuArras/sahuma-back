'use client';

import { useState } from 'react';
import { PRODUCTOS } from '@/lib/mockData';
import { Pencil, Trash2, Check, Plus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface HistoryItem {
    id: string;
    nombre: string;
    marca: string;
    aroma: string;
    precioCompra: string;
    cantidad: string;
}

interface HistoryOrder {
    id: string;
    fecha: string;
    costoTotal: number;
    gananciaTotal: number;
    items: HistoryItem[];
    editDraft: HistoryItem[];
    isExpanded: boolean;
    isEditing: boolean;
}

type ActiveModal =
    | { kind: 'deleteOrder'; orderId: string }
    | { kind: 'saveOrder'; orderId: string }
    | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
const mkItem = (id: string): NewItem => ({ id, productoId: '', marca: '', aromaId: '', precioCompra: '', cantidad: '', isSaved: false, isEditing: false });

// ── Mock history ──────────────────────────────────────────────────────────────

const INITIAL_ORDERS: HistoryOrder[] = [
    {
        id: 'h1', fecha: '10/01/2026', costoTotal: 42750.31, gananciaTotal: 30509.39,
        isExpanded: false, isEditing: false, editDraft: [],
        items: [
            { id: 'h1-1', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Lavanda', precioCompra: '$3.400', cantidad: '3' },
            { id: 'h1-2', nombre: 'Sahumerio Luminosa', marca: 'Shama', aroma: 'Rosa', precioCompra: '$3.400', cantidad: '2' },
            { id: 'h1-3', nombre: 'Sahumerio Flora', marca: 'Shama', aroma: 'Naranja', precioCompra: '$2.900', cantidad: '5' },
        ],
    },
    {
        id: 'h2', fecha: '15/01/2026', costoTotal: 28400.00, gananciaTotal: 18600.00,
        isExpanded: false, isEditing: false, editDraft: [],
        items: [
            { id: 'h2-1', nombre: 'Incienso Zen', marca: 'Ananda', aroma: 'Sándalo', precioCompra: '$4.200', cantidad: '4' },
            { id: 'h2-2', nombre: 'Incienso Zen', marca: 'Ananda', aroma: 'Menta', precioCompra: '$4.200', cantidad: '3' },
        ],
    },
];

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

function ConfirmModal({ title, message, confirmLabel, danger = true, onConfirm, onCancel }: {
    title: string; message: string; confirmLabel: string; danger?: boolean;
    onConfirm: () => void; onCancel: () => void;
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
                    <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── New Order Item Card ───────────────────────────────────────────────────────

function NewOrderItemCard({ item, onUpdate, onSave, onEdit, onDelete }: {
    item: NewItem;
    onUpdate: (field: keyof NewItem, value: string) => void;
    onSave: () => void; onEdit: () => void; onDelete: () => void;
}) {
    const producto = PRODUCTOS.find((p) => p.id === item.productoId);
    const aromaName = producto?.variables.find((v) => v.id === item.aromaId)?.nombre ?? '';
    const isReadOnly = item.isSaved && !item.isEditing;
    const isPending = !item.isSaved;

    const handleProductChange = (id: string) => {
        const p = PRODUCTOS.find((pr) => pr.id === id);
        onUpdate('productoId', id);
        onUpdate('marca', p?.marca ?? '');
        onUpdate('precioCompra', p ? `$${p.precioCompra.toLocaleString('es-AR')}` : '');
        onUpdate('aromaId', '');
    };

    return (
        <div className={`rounded-2xl border p-5 transition-all ${isPending ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 bg-white shadow-sm'}`}>
            {/* Row 1 */}
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
                            options={PRODUCTOS.map((p) => ({ value: p.id, label: p.nombre }))}
                        />
                        <Field label="Marca" value={item.marca} readOnly placeholder="Elegí la marca" />
                        <SelectField
                            label="Aroma" value={item.aromaId}
                            onChange={(v) => onUpdate('aromaId', v)} placeholder="Elegí el aroma"
                            options={(producto?.variables ?? []).map((v) => ({ value: v.id, label: v.nombre }))}
                            disabled={!item.productoId}
                        />
                    </>
                )}
            </div>
            {/* Row 2 */}
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
    item: HistoryItem; editable: boolean;
    onChange?: (field: keyof HistoryItem, value: string) => void;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Producto" value={item.nombre} readOnly={!editable} onChange={(v) => onChange?.('nombre', v)} />
                <Field label="Marca" value={item.marca} readOnly={!editable} onChange={(v) => onChange?.('marca', v)} />
                <Field label="Aroma" value={item.aroma} readOnly={!editable} onChange={(v) => onChange?.('aroma', v)} />
            </div>
            <div className="flex gap-3 sm:max-w-xs">
                <Field label="Precio de compra" value={item.precioCompra} readOnly={!editable} onChange={(v) => onChange?.('precioCompra', v)} />
                <Field label="Cantidad" value={item.cantidad} readOnly={!editable} onChange={(v) => onChange?.('cantidad', v)} />
            </div>
        </div>
    );
}

// ── History Order Card ────────────────────────────────────────────────────────

function HistoryOrderCard({ order, onToggle, onStartEdit, onCancelEdit, setModal, onChangeDraft }: {
    order: HistoryOrder;
    onToggle: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    setModal: (m: ActiveModal) => void;
    onChangeDraft: (itemId: string, field: keyof HistoryItem, value: string) => void;
}) {
    const visibleItems = order.isExpanded
        ? (order.isEditing ? order.editDraft : order.items)
        : order.items.slice(0, 2);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            {/* Header */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs text-secondary">
                Fecha de pedido: <span className="font-medium text-primary">{order.fecha}</span>
                {' · '}Coste total del pedido: <span className="font-medium text-primary">{fmt(order.costoTotal)}</span>
                {' · '}Ganancia aproximada total: <span className="font-medium text-primary">{fmt(order.gananciaTotal)}</span>
            </div>

            {/* Items */}
            <div className="p-4 flex flex-col gap-3">
                {visibleItems.map((item) => (
                    <HistoryItemCard
                        key={item.id} item={item}
                        editable={order.isExpanded && order.isEditing}
                        onChange={(f, v) => onChangeDraft(item.id, f, v)}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center">
                <button onClick={onToggle} className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-primary transition-colors mx-auto">
                    {order.isExpanded
                        ? <>Minimizar pedido <ChevronUp className="w-4 h-4" /> </>
                        : <> Ver pedido completo <ChevronDown className="w-4 h-4" /></>
                    }
                </button>

                {order.isExpanded && !order.isEditing && (
                    <div className="flex gap-2 ml-4">
                        <button onClick={onStartEdit} className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors" title="Editar pedido">
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setModal({ kind: 'deleteOrder', orderId: order.id })} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Eliminar pedido">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {order.isExpanded && order.isEditing && (
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
    const [newItems, setNewItems] = useState<NewItem[]>([mkItem('initial')]);
    const [orders, setOrders] = useState<HistoryOrder[]>(INITIAL_ORDERS);
    const [modal, setModal] = useState<ActiveModal>(null);

    // ── New order handlers ──────────────────────────────────────────────────
    const updateItem = (id: string, field: keyof NewItem, value: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));

    const saveItem = (id: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, isSaved: true, isEditing: false } : it));

    const editItem = (id: string) =>
        setNewItems((prev) => prev.map((it) => it.id === id ? { ...it, isEditing: true } : it));

    const deleteItem = (id: string) =>
        setNewItems((prev) => prev.filter((it) => it.id !== id));

    // ── History handlers ────────────────────────────────────────────────────
    const toggleExpand = (orderId: string) =>
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, isExpanded: !o.isExpanded } : o));

    const startEdit = (orderId: string) =>
        setOrders((prev) => prev.map((o) => o.id === orderId
            ? { ...o, isEditing: true, isExpanded: true, editDraft: o.items.map((i) => ({ ...i })) }
            : o
        ));

    const cancelEdit = (orderId: string) =>
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, isEditing: false, editDraft: [] } : o));

    const saveOrderEdit = (orderId: string) => {
        setOrders((prev) => prev.map((o) => o.id === orderId
            ? { ...o, items: o.editDraft, isEditing: false, editDraft: [] }
            : o
        ));
        setModal(null);
    };

    const deleteOrder = (orderId: string) => {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        setModal(null);
    };

    const changeDraft = (orderId: string, itemId: string, field: keyof HistoryItem, value: string) =>
        setOrders((prev) => prev.map((o) => o.id === orderId
            ? { ...o, editDraft: o.editDraft.map((it) => it.id === itemId ? { ...it, [field]: value } : it) }
            : o
        ));

    const hasSaved = newItems.some((it) => it.isSaved);

    return (
        <>
            {/* Modals */}
            {modal?.kind === 'deleteOrder' && (
                <ConfirmModal
                    title="Eliminar pedido"
                    message="¿Estás seguro de que querés eliminar este pedido? Esta acción no se puede deshacer."
                    confirmLabel="Eliminar pedido" danger
                    onConfirm={() => deleteOrder(modal.orderId)}
                    onCancel={() => setModal(null)}
                />
            )}
            {modal?.kind === 'saveOrder' && (
                <ConfirmModal
                    title="Guardar cambios"
                    message="¿Estás seguro de que querés guardar los cambios realizados en este pedido?"
                    confirmLabel="Guardar" danger={false}
                    onConfirm={() => saveOrderEdit(modal.orderId)}
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
                            <div className="flex justify-end">
                                <button className="px-8 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200">
                                    Registrar pedido
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
                        {orders.map((order) => (
                            <HistoryOrderCard
                                key={order.id} order={order}
                                onToggle={() => toggleExpand(order.id)}
                                onStartEdit={() => startEdit(order.id)}
                                onCancelEdit={() => cancelEdit(order.id)}
                                setModal={setModal}
                                onChangeDraft={(itemId, f, v) => changeDraft(order.id, itemId, f, v)}
                            />
                        ))}
                        {orders.length === 0 && (
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
