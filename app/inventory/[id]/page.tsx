'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Pencil, Trash2, ImagePlus, Plus, AlertTriangle,
    Check, ArrowLeft, Save, Pause, Play, X, Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { PRODUCTOS } from '@/lib/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariableState {
    id: string;
    nombre: string;
    cantidadInicial: string;
    precio: string;
    descuento: string;
    imagen: string;
    pausado: boolean;
    isNew?: boolean;
    isEditing?: boolean;
}

// ─── Shared input field ───────────────────────────────────────────────────────

function InputField({
    label,
    value,
    onChange,
    readOnly = false,
    placeholder = '',
    className = '',
}: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && <label className="text-xs text-secondary font-medium">{label}</label>}
            <input
                type="text"
                value={value}
                readOnly={readOnly}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`
                    border rounded-lg px-3 py-2 text-sm w-full outline-none transition-colors
                    ${readOnly
                        ? 'bg-gray-50 border-gray-200 text-primary cursor-default select-none'
                        : 'bg-white border-gray-300 text-primary focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
                    }
                `}
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

// ─── Product Image Upload (large — for main product) ──────────────────────────

function ProductImageUpload({
    imageUrl,
    onUploaded,
}: {
    imageUrl?: string;
    onUploaded: (url: string) => void;
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
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
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
                        <Image
                            src={imageUrl}
                            alt="Imagen del producto"
                            fill
                            className="object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-2xl">
                            <ImagePlus className="w-7 h-7 text-white" />
                            <span className="text-sm font-medium text-white">Cambiar imagen</span>
                        </div>
                    </>
                ) : (
                    <>
                        <ImagePlus className="w-8 h-8 group-hover:text-orange-400 transition-colors" />
                        <span className="text-sm font-medium group-hover:text-orange-500 transition-colors">
                            Subir imagen del producto
                        </span>
                    </>
                )}
            </button>
        </>
    );
}

// ─── Image Upload Button (small — for variable cards) ─────────────────────────

function ImageUploadButton({
    imageUrl,
    onUploaded,
    disabled = false,
}: {
    imageUrl?: string;
    onUploaded: (url: string) => void;
    disabled?: boolean;
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
        <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary font-medium">Imagen de la variable</label>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />
            <button
                type="button"
                disabled={disabled || uploading}
                onClick={() => inputRef.current?.click()}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${disabled
                        ? 'border-gray-200 bg-gray-50 text-secondary cursor-default'
                        : 'border-gray-300 bg-white text-primary hover:bg-gray-50 hover:border-orange-300 cursor-pointer'
                    }
                `}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Subiendo…
                    </>
                ) : imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt="preview"
                            width={20}
                            height={20}
                            className="rounded object-cover"
                        />
                        Cambiar imagen
                    </>
                ) : (
                    <>
                        <ImagePlus className="w-4 h-4" />
                        Subir imagen
                    </>
                )}
            </button>
        </div>
    );
}

// ─── Variable Image Upload (square card — for variable col 1) ─────────────────

function VariableImageUpload({
    imageUrl,
    onUploaded,
    disabled = false,
}: {
    imageUrl?: string;
    onUploaded: (url: string) => void;
    disabled?: boolean;
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
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />
            <button
                type="button"
                onClick={() => !disabled && inputRef.current?.click()}
                disabled={uploading}
                className={`
                    w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50
                    flex flex-col items-center justify-center gap-2 text-secondary
                    transition-colors group overflow-hidden relative
                    ${disabled ? 'cursor-default' : 'hover:border-orange-400 hover:bg-orange-50/30 cursor-pointer'}
                `}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                        <span className="text-xs font-medium text-orange-500">Subiendo…</span>
                    </>
                ) : imageUrl ? (
                    <>
                        <Image
                            src={imageUrl}
                            alt="Imagen de la variable"
                            fill
                            className="object-cover"
                        />
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
                        {!disabled && (
                            <span className="text-xs font-medium group-hover:text-orange-500 transition-colors">Subir imagen</span>
                        )}
                    </>
                )}
            </button>
        </>
    );
}

// ─── Generic confirmation modal ───────────────────────────────────────────────

function ConfirmModal({
    title,
    description,
    confirmLabel,
    confirmClass,
    icon,
    onConfirm,
    onCancel,
}: {
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    confirmClass: string;
    icon: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    {icon}
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                </div>
                <p className="text-sm text-secondary mb-6">{description}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors ${confirmClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Variable card ────────────────────────────────────────────────────────────

function VariableCard({
    variable,
    onEdit,
    onSave,
    onDelete,
    onTogglePause,
    onChange,
    onImageChange,
}: {
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
        <div className={`
            rounded-2xl border transition-all overflow-hidden
            ${variable.pausado
                ? 'border-gray-200 bg-gray-50/60 opacity-60'
                : isEditable
                    ? 'border-orange-300 bg-orange-50/30 shadow-sm'
                    : 'border-gray-200 bg-white shadow-sm'
            }
        `}>
            {/* Paused badge */}
            {variable.pausado && (
                <div className="px-5 pt-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Pause className="w-3 h-3" /> En pausa
                    </span>
                </div>
            )}

            {/* 3-column layout on lg+, stacked on mobile */}
            <div className="flex flex-col lg:flex-row">

                {/* ── Col 1: Imagen ── */}
                <div className="lg:w-44 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                    <VariableImageUpload
                        imageUrl={variable.imagen || undefined}
                        onUploaded={onImageChange}
                        disabled={isReadOnly}
                    />
                </div>

                {/* ── Col 2: Formulario ── */}
                <div className="flex-1 p-4 lg:p-5 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px] gap-3">
                        <InputField
                            label="Nombre de la variable"
                            value={variable.nombre}
                            onChange={(v) => onChange('nombre', v)}
                            readOnly={isReadOnly}
                            placeholder="Ej: Lavanda"
                        />
                        <InputField
                            label="Cantidad inicial"
                            value={variable.cantidadInicial}
                            onChange={(v) => onChange('cantidadInicial', v)}
                            readOnly={isReadOnly}
                            placeholder="0"
                        />
                        <InputField
                            label="Precio"
                            value={variable.precio}
                            onChange={(v) => onChange('precio', v)}
                            readOnly={isReadOnly}
                            placeholder="$0"
                        />
                    </div>
                    <InputField
                        label="¿Descuento?"
                        value={variable.descuento}
                        onChange={(v) => onChange('descuento', v)}
                        readOnly={isReadOnly}
                        placeholder="$0"
                        className="w-32"
                    />
                </div>

                {/* ── Col 3: Acciones ── */}
                <div className="lg:w-24 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center gap-2">
                    {/* Pause / Resume */}
                    <button
                        onClick={onTogglePause}
                        title={variable.pausado ? 'Reanudar variable' : 'Pausar variable'}
                        className={`p-2 rounded-lg transition-colors ${variable.pausado
                            ? 'bg-green-50 text-green-600 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {variable.pausado
                            ? <Play className="w-4 h-4" />
                            : <Pause className="w-4 h-4" />
                        }
                    </button>

                    {isEditable ? (
                        <button
                            onClick={onSave}
                            title="Guardar"
                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onEdit}
                            title="Editar"
                            className="p-2 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={onDelete}
                        title="Eliminar"
                        className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditarProductoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const productoOriginal = PRODUCTOS.find((p) => p.id === id);

    // ── All hooks MUST be called before any conditional return ─────────────────

    const [product, setProduct] = useState(() => productoOriginal ? {
        nombre: productoOriginal.nombre,
        marca: productoOriginal.marca,
        precioCompra: `$${productoOriginal.precioCompra.toLocaleString('es-AR')}`,
        precioVenta: `$${productoOriginal.precioVenta.toLocaleString('es-AR')}`,
        descuento: `$${productoOriginal.descuento}`,
        imagen: productoOriginal.imagen ?? '',
        pausado: productoOriginal.pausado,
    } : { nombre: '', marca: '', precioCompra: '', precioVenta: '', descuento: '', imagen: '', pausado: false });

    const [variables, setVariables] = useState<VariableState[]>(() =>
        productoOriginal?.variables.map((v) => ({
            id: v.id,
            nombre: v.nombre,
            cantidadInicial: String(v.cantidadInicial),
            precio: `$${v.precio.toLocaleString('es-AR')}`,
            descuento: `$${v.descuento}`,
            imagen: v.imagen ?? '',
            pausado: v.pausado,
            isNew: false,
            isEditing: false,
        })) ?? []
    );

    // Modal state: 'deleteVariable' | 'deleteProduct' | null
    const [modal, setModal] = useState<
        | { type: 'deleteVariable'; variableId: string }
        | { type: 'deleteProduct' }
        | null
    >(null);

    // ── 404 guard ─────────────────────────────────────────────────────────────

    if (!productoOriginal) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-secondary">
                <p className="text-lg font-medium">Producto no encontrado.</p>
                <button
                    onClick={() => router.push('/inventory')}
                    className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                    Volver al inventario
                </button>
            </div>
        );
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleAddVariable = () => {
        setVariables((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                nombre: '',
                cantidadInicial: '',
                precio: '',
                descuento: '',
                imagen: '',
                pausado: false,
                isNew: true,
                isEditing: false,
            },
        ]);
    };

    const handleEdit = (vid: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, isEditing: true } : v));

    const handleSave = (vid: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, isEditing: false, isNew: false } : v));

    const handleDeleteVariable = (vid: string) =>
        setModal({ type: 'deleteVariable', variableId: vid });

    const handleTogglePauseVariable = (vid: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, pausado: !v.pausado } : v));

    const handleChangeVariable = (vid: string, field: keyof VariableState, value: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, [field]: value } : v));

    const handleVariableImageChange = (vid: string, url: string) =>
        setVariables((prev) => prev.map((v) => v.id === vid ? { ...v, imagen: url } : v));

    const confirmDeleteVariable = () => {
        if (modal?.type === 'deleteVariable') {
            setVariables((prev) => prev.filter((v) => v.id !== modal.variableId));
            setModal(null);
        }
    };

    const confirmDeleteProduct = () => {
        // Remove from mock data array and navigate back
        const idx = PRODUCTOS.findIndex((p) => p.id === id);
        if (idx !== -1) PRODUCTOS.splice(idx, 1);
        router.push('/inventory');
    };

    // Modal variable name for display
    const deleteVarName = modal?.type === 'deleteVariable'
        ? (variables.find((v) => v.id === modal.variableId)?.nombre || 'sin nombre')
        : '';

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Delete variable modal ── */}
            {modal?.type === 'deleteVariable' && (
                <ConfirmModal
                    title="Eliminar variable"
                    description={
                        <>
                            ¿Estás seguro de que querés eliminar la variable{' '}
                            <span className="font-semibold text-primary">&quot;{deleteVarName}&quot;</span>?
                            Esta acción no se puede deshacer.
                        </>
                    }
                    confirmLabel="Eliminar"
                    confirmClass="bg-red-500 hover:bg-red-600"
                    icon={<div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
                    onConfirm={confirmDeleteVariable}
                    onCancel={() => setModal(null)}
                />
            )}

            {/* ── Delete product modal ── */}
            {modal?.type === 'deleteProduct' && (
                <ConfirmModal
                    title="Eliminar producto"
                    description={
                        <>
                            ¿Estás seguro de que querés eliminar el producto{' '}
                            <span className="font-semibold text-primary">&quot;{productoOriginal.nombre}&quot;</span>{' '}
                            y todas sus variables? Esta acción no se puede deshacer.
                        </>
                    }
                    confirmLabel="Eliminar producto"
                    confirmClass="bg-red-500 hover:bg-red-600"
                    icon={<div className="bg-red-50 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
                    onConfirm={confirmDeleteProduct}
                    onCancel={() => setModal(null)}
                />
            )}

            <div className="flex flex-col gap-10 md:max-w-xl lg:max-w-3xl">

                {/* Back button + header */}
                <div className="flex flex-col">
                    <button
                        onClick={() => router.push('/inventory')}
                        className="flex mb-6 md:hidden items-center gap-2 text-sm text-secondary hover:text-primary transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inventario
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Editar producto</h1>
                        <p className="text-secondary text-sm">
                            Editá los datos del producto y sus variables.
                        </p>
                    </div>
                    {product.pausado && (
                        <div className="flex mt-6 items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-gray-500 font-medium w-fit">
                            <Pause className="w-4 h-4" />
                            Este producto está en pausa y no aparece en el inventario.
                        </div>
                    )}
                    <hr className='mt-3 border-orange-100' />
                </div>


                {/* ── Section 1: Producto principal ── */}
                <section>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Product image */}
                        <ProductImageUpload
                            imageUrl={product.imagen || undefined}
                            onUploaded={(url) => setProduct((p) => ({ ...p, imagen: url }))}
                        />

                        {/* Fields */}
                        <div className="flex-1 flex flex-col justify-between w-full gap-4">
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
                            <InputField
                                label="Precio de compra del producto"
                                value={product.precioCompra}
                                onChange={(v) => setProduct((p) => ({ ...p, precioCompra: v }))}
                                placeholder="$0"
                            />
                            <InputField
                                label="Precio de venta del producto"
                                value={product.precioVenta}
                                onChange={(v) => setProduct((p) => ({ ...p, precioVenta: v }))}
                                placeholder="$0"
                            />
                            <InputField
                                label="¿Descuento?"
                                value={product.descuento}
                                onChange={(v) => setProduct((p) => ({ ...p, descuento: v }))}
                                placeholder="$0"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Section 2: Variables ── */}
                <section className="mt-10">
                    <h2 className="text-2xl font-semibold text-primary mb-1">Variables del producto</h2>
                    <p className="text-secondary text-sm mb-4">
                        Editá los distintos aromas del producto y sus datos:
                        <br />
                        - Presioná ⏸️ para pausar una variable.
                        <br />
                        - Presioná ✏️ para modificar una variable existente.
                        <br />
                        - Presioná 🗑️ para eliminar una variable.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col gap-4">
                        {variables.map((variable) => (
                            <VariableCard
                                key={variable.id}
                                variable={variable}
                                onEdit={() => handleEdit(variable.id)}
                                onSave={() => handleSave(variable.id)}
                                onDelete={() => handleDeleteVariable(variable.id)}
                                onTogglePause={() => handleTogglePauseVariable(variable.id)}
                                onChange={(field, value) => handleChangeVariable(variable.id, field, value)}
                                onImageChange={(url) => handleVariableImageChange(variable.id, url)}
                            />
                        ))}

                        {/* Add variable */}
                        <button
                            onClick={handleAddVariable}
                            className="w-full py-3 rounded-2xl border border-dashed border-gray-300 bg-white flex items-center justify-center gap-2 text-sm font-medium text-secondary hover:border-orange-400 hover:bg-orange-50/30 hover:text-orange-500 transition-colors"
                        >
                            Agregar variable
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* ── Footer: guardar + acciones de producto ── */}
                <div className="flex flex-col items-end gap-5 pb-8">
                    {/* Guardar */}
                    <button className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl text-orange-500 border border-orange-500 font-medium hover:bg-orange-50 active:scale-95 transition-all">
                        <Save className="w-4 h-4" />
                        Guardar cambios
                    </button>

                    <button
                        onClick={() => setProduct((p) => ({ ...p, pausado: !p.pausado }))}
                        title={product.pausado ? 'Reanudar producto' : 'Pausar producto'}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${product.pausado
                            ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-gray-200 bg-white text-secondary hover:bg-gray-50'
                            }`}
                    >
                        {product.pausado
                            ? <><Play className="w-4 h-4" />Reanudar producto</>
                            : <><Pause className="w-4 h-4" />Pausar producto</>
                        }
                    </button>
                    <button
                        onClick={() => setModal({ type: 'deleteProduct' })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar producto
                    </button>
                </div>
            </div>
        </>
    );
}
