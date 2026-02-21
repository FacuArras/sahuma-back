'use client';

import { useRef, useState } from 'react';
import { Pencil, Trash2, ImagePlus, Plus, AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Variable {
    id: string;
    nombre: string;
    cantidadInicial: string;
    precio: string;
    descuento: string;
    imageUrl?: string;
    isNew?: boolean;      // recién añadida, aún no "guardada"
    isEditing?: boolean;  // en modo edición
}

// ─── Cloudinary upload helper ─────────────────────────────────────────────────

async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Error al subir la imagen');
    const data = await res.json();
    return data.url as string;
}

// ─── Image Upload Button ──────────────────────────────────────────────────────

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
            // Reset input so same file can be re-selected
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

// ─── Product Image Upload ─────────────────────────────────────────────────────

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
                className="flex-shrink-0 cursor-pointer self-center w-full md:w-56 lg:w-80 min-h-[200px] h-96 md:h-72 lg:h-96 rounded-2xl border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center gap-3 text-secondary hover:border-orange-400 hover:bg-orange-50/30 transition-colors group overflow-hidden relative"
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

// ─── Variable Image Upload (square card — for variable col 1) ───────────────

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

// ─── Sub-components ──────────────────────────────────────────────────────────

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

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({
    variableName,
    onConfirm,
    onCancel,
}: {
    variableName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-red-50 p-2 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-primary">Eliminar variable</h3>
                </div>
                <p className="text-sm text-secondary mb-6">
                    ¿Estás seguro de que querés eliminar la variable{' '}
                    <span className="font-semibold text-primary">"{variableName}"</span>?
                    Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 cursor-pointer px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 cursor-pointer px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Variable Card ────────────────────────────────────────────────────────────

function VariableCard({
    variable,
    onEdit,
    onSave,
    onDelete,
    onChange,
}: {
    variable: Variable;
    onEdit: () => void;
    onSave: () => void;
    onDelete: () => void;
    onChange: (field: keyof Variable, value: string) => void;
}) {
    const isReadOnly = !variable.isEditing && !variable.isNew;
    const isEditable = variable.isEditing || variable.isNew;

    return (
        <div className={`
            rounded-2xl border transition-all overflow-hidden
            ${isEditable
                ? 'border-orange-300 bg-orange-50/30 shadow-sm'
                : 'border-gray-200 bg-white shadow-sm'
            }
        `}>
            {/* 3-column layout on lg+, stacked on mobile */}
            <div className="flex flex-col lg:flex-row">

                {/* ── Col 1: Imagen ── */}
                <div className="lg:w-44 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                    <VariableImageUpload
                        imageUrl={variable.imageUrl || undefined}
                        onUploaded={(url) => onChange('imageUrl', url)}
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
                    {isEditable ? (
                        <button
                            onClick={onSave}
                            title="Guardar"
                            className="p-2 cursor-pointer rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onEdit}
                            title="Editar"
                            className="p-2 cursor-pointer rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        title="Eliminar"
                        className="p-2 cursor-pointer rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NuevoProductoPage() {
    // Product form state
    const [product, setProduct] = useState({
        nombre: '',
        marca: '',
        precioCompra: '',
        precioVenta: '',
        descuento: '',
        imageUrl: '',
    });

    // Variables state — starts with one empty variable ready to fill
    const [variables, setVariables] = useState<Variable[]>([
        {
            id: '1',
            nombre: '',
            cantidadInicial: '',
            precio: '',
            descuento: '',
            imageUrl: '',
            isNew: true,
            isEditing: false,
        },
    ]);

    // Delete confirmation modal state
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    // ── Handlers ────────────────────────────────────────────────────────────────

    const handleAddVariable = () => {
        const newVar: Variable = {
            id: Date.now().toString(),
            nombre: '',
            cantidadInicial: '',
            precio: '',
            descuento: '',
            imageUrl: '',
            isNew: true,
            isEditing: false,
        };
        setVariables((prev) => [...prev, newVar]);
    };

    const handleEdit = (id: string) => {
        setVariables((prev) =>
            prev.map((v) => (v.id === id ? { ...v, isEditing: true } : v))
        );
    };

    const handleSave = (id: string) => {
        setVariables((prev) =>
            prev.map((v) =>
                v.id === id ? { ...v, isEditing: false, isNew: false } : v
            )
        );
    };

    const handleDelete = (id: string) => {
        setDeleteTarget(id);
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            setVariables((prev) => prev.filter((v) => v.id !== deleteTarget));
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => setDeleteTarget(null);

    const handleChangeVariable = (
        id: string,
        field: keyof Variable,
        value: string
    ) => {
        setVariables((prev) =>
            prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    const deleteTargetVariable = variables.find((v) => v.id === deleteTarget);

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Delete confirmation modal */}
            {deleteTarget && deleteTargetVariable && (
                <DeleteModal
                    variableName={deleteTargetVariable.nombre || 'sin nombre'}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}

            <div className="flex flex-col gap-10 max-w-4xl">
                {/* ── Section 1: Producto principal ── */}
                <section>
                    <h1 className="text-3xl font-bold text-primary mb-1">
                        Crear producto principal
                    </h1>
                    <p className="text-secondary text-sm">
                        Acá vas a poder crear el producto principal del que luego saldrán las distintas variables (aromas).
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image upload */}
                        <ProductImageUpload
                            imageUrl={product.imageUrl || undefined}
                            onUploaded={(url) => setProduct((p) => ({ ...p, imageUrl: url }))}
                        />

                        {/* Fields */}
                        <div className="flex-1 flex flex-col gap-4">
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
                <section className='mt-6 mb-3'>
                    <h2 className="text-3xl font-bold text-primary mb-1">
                        Crear variables del producto principal
                    </h2>
                    <p className="text-secondary text-sm">
                        Acá vas a poder crear las distintas variables (aromas) del producto principal.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col gap-4">
                        {variables.map((variable) => (
                            <VariableCard
                                key={variable.id}
                                variable={variable}
                                onEdit={() => handleEdit(variable.id)}
                                onSave={() => handleSave(variable.id)}
                                onDelete={() => handleDelete(variable.id)}
                                onChange={(field, value) =>
                                    handleChangeVariable(variable.id, field, value)
                                }
                            />
                        ))}

                        {/* Add variable button */}
                        <button
                            onClick={handleAddVariable}
                            className="
                w-full py-3 rounded-2xl border border-dashed border-gray-300 bg-white
                flex items-center justify-center gap-2
                text-sm font-medium text-secondary
                hover:border-orange-400 hover:bg-orange-50/30 hover:text-orange-500
                transition-colors cursor-pointer
              "
                        >
                            Agregar variable
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* ── Save Product Button ── */}
                <div className="flex justify-end pb-8">
                    <button className="px-8 py-3 cursor-pointer rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200">
                        Crear producto nuevo
                    </button>
                </div>
            </div>
        </>
    );
}
