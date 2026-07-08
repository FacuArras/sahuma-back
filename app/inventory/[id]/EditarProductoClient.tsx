'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
    Pencil, Trash2, ImagePlus, Plus, AlertTriangle,
    Check, ArrowLeft, Save, Pause, Play, X, Loader2, CheckCircle,
} from 'lucide-react';
import Image from 'next/image';
import {
    actualizarProducto,
    actualizarVariante,
    crearVariante,
    eliminarVariante,
    eliminarProducto,
} from '@/app/actions/productos';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductoPrincipalDB {
    id: string;
    nombre: string;
    marca: string;
    descripcion: string | null;
    imagenPadre: string;
    pausado: boolean;
    variantes: ProductoVarianteDB[];
}

export interface ProductoVarianteDB {
    id: string;
    aroma: string;
    stock: number;
    precioVenta: number;
    precioCompra: number;
    imagenUrl: string | null;
    pausado: boolean;
}

interface VariableState {
    id: string;
    aroma: string;
    stock: string;
    precioVenta: string;
    precioCompra: string;
    imagen: string;
    pausado: boolean;
    isNew?: boolean;
    isEditing?: boolean;
    isSaving?: boolean;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all
            ${type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {type === 'success'
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            }
            {message}
        </div>
    );
}

// ─── Input field ──────────────────────────────────────────────────────────────

function InputField({
    label, value, onChange, readOnly = false, placeholder = '', className = '', type = 'text',
}: {
    label?: string; value: string; onChange: (v: string) => void;
    readOnly?: boolean; placeholder?: string; className?: string; type?: string;
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && <label className="text-xs text-secondary font-medium">{label}</label>}
            <input
                type={type}
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`border rounded-lg px-3 py-2 text-sm w-full outline-none transition-colors
                    ${readOnly
                        ? 'bg-gray-50 border-gray-200 text-primary cursor-default select-none'
                        : 'bg-white border-gray-300 text-primary focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    }`}
            />
        </div>
    );
}

// ─── Cloudinary upload helper ──────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error al subir la imagen');
    const data = await res.json();
    return data.url as string;
}

// ─── Product Image Upload ──────────────────────────────────────────────────────

function ProductImageUpload({ imageUrl, onUploaded }: { imageUrl?: string; onUploaded: (url: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onUploaded(url);
        } catch {
            alert('Hubo un error al subir la imagen. Intentá de nuevo.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex-shrink-0 cursor-pointer self-center w-full md:w-56 lg:w-80 min-h-[200px] h-96 md:h-72 lg:h-96 rounded-2xl border-2 border-none bg-white flex flex-col items-center justify-center gap-3 text-secondary hover:bg-orange-50/30 transition-colors group overflow-hidden relative"
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                        <span className="text-sm font-medium text-orange-500">Subiendo imagen…</span>
                    </>
                ) : imageUrl ? (
                    <>
                        <Image src={imageUrl} alt="Imagen del producto" fill className="object-cover rounded-2xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-2xl">
                            <ImagePlus className="w-7 h-7 text-white" />
                            <span className="text-sm font-medium text-white">Cambiar imagen</span>
                        </div>
                    </>
                ) : (
                    <>
                        <ImagePlus className="w-8 h-8 group-hover:text-orange-400 transition-colors" />
                        <span className="text-sm font-medium group-hover:text-orange-500 transition-colors">Subir imagen del producto</span>
                    </>
                )}
            </button>
        </>
    );
}

// ─── Variable Image Upload ─────────────────────────────────────────────────────

function VariableImageUpload({ imageUrl, onUploaded, disabled = false }: {
    imageUrl?: string; onUploaded: (url: string) => void; disabled?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onUploaded(url);
        } catch {
            alert('Hubo un error al subir la imagen. Intentá de nuevo.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={handleFileChange} disabled={disabled || uploading} />
            <button
                type="button"
                onClick={() => !disabled && inputRef.current?.click()}
                disabled={uploading}
                className={`w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50
                    flex flex-col items-center justify-center gap-2 text-secondary
                    transition-colors group overflow-hidden relative
                    ${disabled ? 'cursor-default' : 'hover:border-orange-400 hover:bg-orange-50/30 cursor-pointer'}`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                        <span className="text-xs font-medium text-orange-500">Subiendo…</span>
                    </>
                ) : imageUrl ? (
                    <>
                        <Image src={imageUrl} alt="Imagen de la variable" fill className="object-cover" />
                        {!disabled && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                                <ImagePlus className="w-5 h-5 text-white" />
                                <span className="text-xs font-medium text-white">Cambiar</span>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <ImagePlus className={`w-6 h-6 transition-colors ${disabled ? 'text-gray-300' : 'group-hover:text-orange-400'}`} />
                        {!disabled && <span className="text-xs font-medium group-hover:text-orange-500 transition-colors">Subir imagen</span>}
                    </>
                )}
            </button>
        </>
    );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ title, description, confirmLabel, confirmClass, icon, onConfirm, onCancel, loading = false }: {
    title: string; description: React.ReactNode; confirmLabel: string;
    confirmClass: string; icon: React.ReactNode; onConfirm: () => void;
    onCancel: () => void; loading?: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">{icon}<h3 className="text-lg font-bold text-primary">{title}</h3></div>
                <p className="text-sm text-secondary mb-6">{description}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 ${confirmClass}`}>
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Variable Card ─────────────────────────────────────────────────────────────

function VariableCard({ variable, onEdit, onSave, onDelete, onTogglePause, onChange, onImageChange }: {
    variable: VariableState;
    onEdit: () => void;
    onSave: () => void;
    onDelete: () => void;
    onTogglePause: () => void;
    onChange: (field: keyof VariableState, value: string) => void;
    onImageChange: (url: string) => void;
}) {
    const isReadOnly = !variable.isEditing && !variable.isNew;
    const isEditable = variable.isEditing || variable.isNew;

    return (
        <div className={`rounded-2xl border transition-all overflow-hidden
            ${variable.pausado
                ? 'border-gray-200 bg-gray-50/60 opacity-60'
                : isEditable
                    ? 'border-orange-300 bg-orange-50/30 shadow-sm'
                    : 'border-gray-200 bg-white shadow-sm'
            }`}>
            {variable.pausado && (
                <div className="px-5 pt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Pause className="w-3 h-3" /> En pausa
                    </span>
                </div>
            )}

            <div className="flex flex-col lg:flex-row">
                {/* Col 1: Imagen */}
                <div className="lg:w-44 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                    <VariableImageUpload
                        imageUrl={variable.imagen || undefined}
                        onUploaded={onImageChange}
                        disabled={isReadOnly}
                    />
                </div>

                {/* Col 2: Formulario */}
                <div className="flex-1 p-4 lg:p-5 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="grid grid-cols-1 gap-3">
                        <InputField
                            label="Nombre / aroma de la variante"
                            value={variable.aroma}
                            onChange={(v) => onChange('aroma', v)}
                            readOnly={isReadOnly}
                            placeholder="Ej: Lavanda"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Stock"
                                value={variable.stock}
                                onChange={(v) => onChange('stock', v)}
                                readOnly={isReadOnly}
                                placeholder="0"
                                type="number"
                            />
                            <InputField
                                label="Precio de venta ($)"
                                value={variable.precioVenta}
                                onChange={(v) => onChange('precioVenta', v)}
                                readOnly={isReadOnly}
                                placeholder="0"
                                type="number"
                            />
                        </div>
                    </div>
                </div>

                {/* Col 3: Acciones */}
                <div className="lg:w-24 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center gap-2">
                    <button
                        onClick={onTogglePause}
                        title={variable.pausado ? 'Reanudar variable' : 'Pausar variable'}
                        disabled={variable.isSaving}
                        className={`p-2 rounded-lg transition-colors ${variable.pausado
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            } disabled:opacity-50`}
                    >
                        {variable.pausado ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>

                    {isEditable ? (
                        <button
                            onClick={onSave}
                            disabled={variable.isSaving}
                            title="Guardar variante"
                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            {variable.isSaving
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Check className="w-4 h-4" />
                            }
                        </button>
                    ) : (
                        <button
                            onClick={onEdit}
                            title="Editar variante"
                            className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={onDelete}
                        title="Eliminar variante"
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

export default function EditarProductoClient({ producto }: { producto: ProductoPrincipalDB }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [product, setProduct] = useState({
        nombre: producto.nombre,
        marca: producto.marca,
        descripcion: producto.descripcion ?? '',
        imagenPadre: producto.imagenPadre,
        pausado: producto.pausado,
        precioVenta: producto.variantes[0] ? String(producto.variantes[0].precioVenta) : '',
        precioCompra: producto.variantes[0] ? String(producto.variantes[0].precioCompra) : '',
    });

    // Variables state — initialized from DB
    const [variables, setVariables] = useState<VariableState[]>(
        producto.variantes.map((v) => ({
            id: v.id,
            aroma: v.aroma,
            stock: String(v.stock),
            precioVenta: String(v.precioVenta),
            precioCompra: String(v.precioCompra),
            imagen: v.imagenUrl ?? '',
            pausado: v.pausado,
            isNew: false,
            isEditing: false,
            isSaving: false,
        }))
    );

    // Modal state
    const [modal, setModal] = useState<
        | { type: 'deleteVariable'; variableId: string }
        | { type: 'deleteProduct' }
        | { type: 'pauseProduct' }
        | { type: 'pauseVariable'; variableId: string }
        | null
    >(null);
    const [modalLoading, setModalLoading] = useState(false);

    const [showSuccess, setShowSuccess] = useState(false);

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Variable handlers ──────────────────────────────────────────────────────

    const handleAddVariable = () => {
        setVariables((prev) => [
            ...prev,
            { id: `new-${Date.now()}`, aroma: '', stock: '', precioVenta: product.precioVenta, precioCompra: product.precioCompra, imagen: '', pausado: false, isNew: true, isEditing: false, isSaving: false },
        ]);
    };

    const handleEdit = (vid: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, isEditing: true } : v));

    const handleSaveVariable = async (vid: string) => {
        const v = variables.find((v) => v.id === vid);
        if (!v) return;

        const stockNum = parseInt(v.stock, 10);
        const pvNum = parseFloat(v.precioVenta);
        const pcNum = parseFloat(v.precioCompra);

        if (!v.aroma.trim()) { showToast('El aroma no puede estar vacío.', 'error'); return; }
        if (isNaN(stockNum) || stockNum < 0) { showToast('Stock inválido.', 'error'); return; }
        if (isNaN(pvNum) || pvNum <= 0) { showToast('Precio de venta inválido.', 'error'); return; }
        if (isNaN(pcNum) || pcNum <= 0) { showToast('Precio de compra inválido.', 'error'); return; }

        setVariables((prev) => prev.map((x) => x.id === vid ? { ...x, isSaving: true } : x));

        if (v.isNew) {
            const res = await crearVariante(producto.id, {
                aroma: v.aroma, stock: stockNum, precioVenta: pvNum, precioCompra: pcNum, imagenUrl: v.imagen || undefined,
            });
            if (res.success && res.id) {
                setVariables((prev) => prev.map((x) => x.id === vid ? { ...x, id: res.id!, isNew: false, isEditing: false, isSaving: false } : x));
                showToast('Variante creada correctamente.', 'success');
            } else {
                setVariables((prev) => prev.map((x) => x.id === vid ? { ...x, isSaving: false } : x));
                showToast(res.error ?? 'Error al crear variante.', 'error');
            }
        } else {
            const res = await actualizarVariante(vid, {
                aroma: v.aroma, stock: stockNum, precioVenta: pvNum, precioCompra: pcNum, imagenUrl: v.imagen || undefined, pausado: v.pausado,
            });
            setVariables((prev) => prev.map((x) => x.id === vid ? { ...x, isEditing: false, isSaving: false } : x));
            if (res.success) showToast('Variante actualizada.', 'success');
            else showToast(res.error ?? 'Error al actualizar variante.', 'error');
        }
    };

    const handleTogglePauseVariable = (vid: string) => {
        const v = variables.find((x) => x.id === vid);
        if (!v || v.isNew) return;

        // Si ya está pausada, reanudar directamente sin confirmación
        if (v.pausado) {
            setVariables((prev) => prev.map((x) => x.id === vid ? { ...x, pausado: false } : x));
            return;
        }

        // Si NO está pausada, pedir confirmación
        setModal({ type: 'pauseVariable', variableId: vid });
    };

    const confirmPauseVariable = () => {
        if (modal?.type !== 'pauseVariable') return;
        const vid = modal.variableId;
        // Solo actualiza el estado local, se guarda junto con "Guardar cambios"
        setVariables((prev) => prev.map((x) => x.id === vid ? { ...x, pausado: true } : x));
        setModal(null);
        showToast('Variante marcada como pausada. Guardá los cambios para aplicar.', 'success');
    };

    const handleChangeVariable = (vid: string, field: keyof VariableState, value: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, [field]: value } : v));

    const handleVariableImageChange = (vid: string, url: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, imagen: url } : v));

    const handleDeleteVariable = (vid: string) => setModal({ type: 'deleteVariable', variableId: vid });

    const confirmDeleteVariable = async () => {
        if (modal?.type !== 'deleteVariable') return;
        const vid = modal.variableId;
        const v = variables.find((x) => x.id === vid);
        if (!v) return;

        setModalLoading(true);
        if (!v.isNew) {
            await eliminarVariante(vid, producto.id);
        }
        setVariables((prev) => prev.filter((x) => x.id !== vid));
        setModalLoading(false);
        setModal(null);
        showToast('Variante eliminada.', 'success');
    };

    const confirmDeleteProduct = async () => {
        setModalLoading(true);
        await eliminarProducto(producto.id);
        // redirect happens server-side, but just in case:
        setModalLoading(false);
        router.push('/inventory');
    };



    const handlePauseProduct = () => {
        // Si ya está pausado, reanudar directamente sin confirmación
        if (product.pausado) {
            setProduct((p) => ({ ...p, pausado: false }));
            return;
        }
        // Si NO está pausado, pedir confirmación
        setModal({ type: 'pauseProduct' });
    };

    const confirmPauseProduct = () => {
        setProduct((p) => ({ ...p, pausado: true }));
        setModal(null);
        showToast('Producto pausado. Guardá los cambios para aplicar.', 'success');
    };

    // ── Product save ─────────────────────────────────────────────────────────────

    const handleSaveProduct = () => {
        startTransition(async () => {
            const pvNum = parseFloat(product.precioVenta);
            const pcNum = parseFloat(product.precioCompra);

            const res = await actualizarProducto(producto.id, {
                nombre: product.nombre,
                marca: product.marca,
                descripcion: product.descripcion || undefined,
                imagenPadre: product.imagenPadre,
                pausado: product.pausado,
                precioVenta: isNaN(pvNum) ? undefined : pvNum,
                precioCompra: isNaN(pcNum) ? undefined : pcNum,
            });

            if (!res?.success) {
                showToast(res?.error ?? 'Error al guardar.', 'error');
                return;
            }

            // Guardar el estado pausado de cada variante existente en la DB
            const variantesExistentes = variables.filter((v) => !v.isNew);
            await Promise.all(
                variantesExistentes.map((v) =>
                    actualizarVariante(v.id, {
                        aroma: v.aroma,
                        stock: parseInt(v.stock, 10) || 0,
                        precioVenta: parseFloat(v.precioVenta) || 0,
                        precioCompra: parseFloat(v.precioCompra) || 0,
                        imagenUrl: v.imagen || undefined,
                        pausado: v.pausado,
                    })
                )
            );

            setShowSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        });
    };

    const deleteVarName = modal?.type === 'deleteVariable'
        ? (variables.find((v) => v.id === modal.variableId)?.aroma || 'sin nombre')
        : '';

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} />}

            {/* Delete variable modal */}
            {modal?.type === 'deleteVariable' && (
                <ConfirmModal
                    title="Eliminar variable"
                    description={<>¿Estás seguro de que querés eliminar la variable <span className="font-semibold text-primary">&quot;{deleteVarName}&quot;</span>? Esta acción no se puede deshacer.</>}
                    confirmLabel="Eliminar"
                    confirmClass="bg-red-500 hover:bg-red-600"
                    icon={<div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
                    onConfirm={confirmDeleteVariable}
                    onCancel={() => setModal(null)}
                    loading={modalLoading}
                />
            )}

            {/* Pause variable modal */}
            {modal?.type === 'pauseVariable' && (() => {
                const pauseVarName = variables.find((v) => v.id === (modal as { type: 'pauseVariable'; variableId: string }).variableId)?.aroma || 'sin nombre';
                return (
                    <ConfirmModal
                        title="Pausar variante"
                        description={<>La variante <span className="font-semibold text-primary">&quot;{pauseVarName}&quot;</span> no se mostrará más en la página principal. Podés reanudarla en cualquier momento.</>}
                        confirmLabel="Pausar"
                        confirmClass="bg-gray-700 hover:bg-gray-800"
                        icon={<div className="bg-gray-100 p-2 rounded-lg"><Pause className="w-5 h-5 text-gray-600" /></div>}
                        onConfirm={confirmPauseVariable}
                        onCancel={() => setModal(null)}
                        loading={modalLoading}
                    />
                );
            })()}

            {/* Pause product modal */}
            {modal?.type === 'pauseProduct' && (
                <ConfirmModal
                    title="Pausar producto"
                    description={<>El producto <span className="font-semibold text-primary">&quot;{producto.nombre}&quot;</span> y todas sus variantes no se mostrarán más en la página principal. Podés reanudarlos en cualquier momento.</>}
                    confirmLabel="Pausar producto"
                    confirmClass="bg-gray-700 hover:bg-gray-800"
                    icon={<div className="bg-gray-100 p-2 rounded-lg"><Pause className="w-5 h-5 text-gray-600" /></div>}
                    onConfirm={confirmPauseProduct}
                    onCancel={() => setModal(null)}
                    loading={false}
                />
            )}

            {modal?.type === 'deleteProduct' && (
                <ConfirmModal
                    title="Eliminar producto"
                    description={<>¿Estás seguro de que querés eliminar <span className="font-semibold text-primary">&quot;{producto.nombre}&quot;</span> y todas sus variables? Esta acción no se puede deshacer.</>}
                    confirmLabel="Eliminar producto"
                    confirmClass="bg-red-500 hover:bg-red-600"
                    icon={<div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
                    onConfirm={confirmDeleteProduct}
                    onCancel={() => setModal(null)}
                    loading={modalLoading}
                />
            )}

            {/* Success overlay */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 border border-gray-100 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-primary">Cambios guardados correctamente</h3>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-10 md:max-w-xl lg:max-w-3xl">

                {/* Header */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => router.push('/inventory')}
                            className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver al inventario
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-1">Editar producto</h1>
                    <p className="text-secondary text-sm">Editá los datos del producto y sus variables.</p>
                    {product.pausado && (
                        <div className="flex mt-6 items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-500 font-medium w-fit">
                            <Pause className="w-4 h-4" />
                            Este producto está en pausa y no aparece en el inventario.
                        </div>
                    )}
                    <hr className="mt-3 border-orange-100" />
                </div>

                {/* Section 1: Producto principal */}
                <section>
                    <div className="flex flex-col md:flex-row gap-6">
                        <ProductImageUpload
                            imageUrl={product.imagenPadre || undefined}
                            onUploaded={(url) => setProduct((p) => ({ ...p, imagenPadre: url }))}
                        />
                        <div className="flex-1 flex flex-col w-full gap-5">
                            <InputField
                                label="Nombre del producto"
                                value={product.nombre}
                                onChange={(v) => setProduct((p) => ({ ...p, nombre: v }))}
                                placeholder="Ej: Sahumerio Flora"
                            />
                            <InputField
                                label="Marca del producto"
                                value={product.marca}
                                onChange={(v) => setProduct((p) => ({ ...p, marca: v }))}
                                placeholder="Ej: Shama"
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label="Precio de venta ($)"
                                    value={product.precioVenta}
                                    onChange={(v) => {
                                        setProduct((p) => ({ ...p, precioVenta: v }));
                                        setVariables((prev) => prev.map((x) => ({ ...x, precioVenta: v })));
                                    }}
                                    type="number"
                                />
                                <InputField
                                    label="Precio de compra ($)"
                                    value={product.precioCompra}
                                    onChange={(v) => {
                                        setProduct((p) => ({ ...p, precioCompra: v }));
                                        setVariables((prev) => prev.map((x) => ({ ...x, precioCompra: v })));
                                    }}
                                    type="number"
                                />
                            </div>
                            <InputField
                                label="Observaciones"
                                value={product.descripcion}
                                onChange={(v) => setProduct((p) => ({ ...p, descripcion: v }))}
                                placeholder="Observaciones del producto"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Variables */}
                <section className="mt-10">
                    <h2 className="text-3xl font-bold text-primary mb-1">Variables del producto</h2>
                    <p className="text-secondary text-sm mb-4">
                        Editá los distintos aromas del producto y sus datos:<br />
                        - Presioná ⏸️ para pausar una variable.<br />
                        - Presioná ✏️ para modificar una variable existente.<br />
                        - Presioná 🗑️ para eliminar una variable.
                    </p>
                    <hr className="mt-3 mb-6 border-orange-100" />
                    <div className="flex flex-col gap-4">
                        {variables.map((variable) => (
                            <VariableCard
                                key={variable.id}
                                variable={variable}
                                onEdit={() => handleEdit(variable.id)}
                                onSave={() => handleSaveVariable(variable.id)}
                                onDelete={() => handleDeleteVariable(variable.id)}
                                onTogglePause={() => handleTogglePauseVariable(variable.id)}
                                onChange={(field, value) => handleChangeVariable(variable.id, field, value)}
                                onImageChange={(url) => handleVariableImageChange(variable.id, url)}
                            />
                        ))}
                        <button
                            onClick={handleAddVariable}
                            className="w-full py-3 rounded-2xl border border-dashed border-gray-300 bg-white flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:border-orange-400 hover:bg-orange-50/30 hover:text-orange-500 transition-colors"
                        >
                            Agregar variable <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* Footer actions */}
                <div className="flex flex-col md:flex-row items-end md:items-center md:justify-between md:flex-row-reverse gap-5 pb-8">
                    <button
                        onClick={handleSaveProduct}
                        disabled={isPending}
                        className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl text-orange-500 border border-orange-500 font-medium hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isPending ? 'Guardando…' : 'Guardar cambios'}
                    </button>

                    <button
                        onClick={handlePauseProduct}
                        title={product.pausado ? 'Reanudar producto' : 'Pausar producto'}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${product.pausado
                            ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-gray-200 bg-white text-secondary hover:bg-gray-50'
                            }`}
                    >
                        {product.pausado ? <><Play className="w-4 h-4" />Reanudar producto</> : <><Pause className="w-4 h-4" />Pausar producto</>}
                    </button>

                    <button
                        onClick={() => setModal({ type: 'deleteProduct' })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar producto
                    </button>
                </div>
            </div>
        </>
    );
}
