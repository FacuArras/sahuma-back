'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, ImagePlus, Plus, AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { crearProducto } from '@/app/actions/productos';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Variable {
    id: string;
    aroma: string;
    stock: string;
    precioVenta: string;
    imagenUrl?: string;
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

// ─── Variable Image Upload ────────────────────────────────────────────────────

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
                            alt="Imagen de la variante"
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

// ─── Input Field ──────────────────────────────────────────────────────────────

function InputField({
    label,
    value,
    onChange,
    readOnly = false,
    placeholder = '',
    type = 'text',
    className = '',
    required = false,
}: {
    label?: string;
    value: string;
    onChange: (v: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    type?: string;
    className?: string;
    required?: boolean;
}) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-xs text-secondary font-medium">
                    {label}
                    {required && <span className="text-orange-500 ml-0.5">*</span>}
                </label>
            )}
            <input
                type={type}
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
                    <h3 className="text-lg font-bold text-primary">Eliminar variante</h3>
                </div>
                <p className="text-sm text-secondary mb-6">
                    ¿Estás seguro de que querés eliminar la variante{' '}
                    <span className="font-semibold text-primary">&quot;{variableName}&quot;</span>?
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
            <div className="flex flex-col lg:flex-row">

                {/* ── Col 1: Imagen ── */}
                <div className="lg:w-44 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                    <VariableImageUpload
                        imageUrl={variable.imagenUrl || undefined}
                        onUploaded={(url) => onChange('imagenUrl', url)}
                        disabled={isReadOnly}
                    />
                </div>

                {/* ── Col 2: Formulario ── */}
                <div className="flex-1 p-4 lg:p-5 flex flex-col gap-3 border-b lg:border-b-0 lg:border-r border-gray-100">
                    <InputField
                        label="Nombre / aroma de la variante"
                        value={variable.aroma}
                        onChange={(v) => onChange('aroma', v)}
                        readOnly={isReadOnly}
                        placeholder="Ej: Lavanda"
                        required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField
                            label="Stock inicial"
                            value={variable.stock}
                            onChange={(v) => onChange('stock', v)}
                            readOnly={isReadOnly}
                            placeholder="0"
                            type="number"
                            required
                        />
                        <InputField
                            label="Precio de venta"
                            value={variable.precioVenta}
                            onChange={(v) => onChange('precioVenta', v)}
                            readOnly={isReadOnly}
                            placeholder="$0"
                            type="number"
                            required
                        />
                    </div>
                </div>

                {/* ── Col 3: Acciones ── */}
                <div className="lg:w-24 lg:flex-shrink-0 p-4 lg:p-5 flex lg:flex-col items-center justify-center gap-2">
                    {isEditable ? (
                        <button
                            onClick={onSave}
                            title="Guardar variante"
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
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // ── Product principal form state ─────────────────────────────────────────
    const [product, setProduct] = useState({
        nombre: '',
        marca: '',
        descripcion: '',
        imagenPadre: '',
        precioVenta: '',
        precioCompra: '',
    });

    // ── Sync variante precioVenta when principal changes ─────────────────────
    const handleProductPrecioVenta = (precio: string) => {
        setProduct((p) => ({ ...p, precioVenta: precio }));
        // Auto-fill variantes que aún no fueron guardadas
        setVariables((prev) =>
            prev.map((v) => (v.isNew ? { ...v, precioVenta: precio } : v))
        );
    };

    // ── Variables state — starts with one empty variable ─────────────────────
    const [variables, setVariables] = useState<Variable[]>([
        {
            id: '1',
            aroma: '',
            stock: '',
            precioVenta: '',
            imagenUrl: '',
            isNew: true,
            isEditing: false,
        },
    ]);

    // ── Modal & Form state ───────────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleAddVariable = () => {
        const newVar: Variable = {
            id: Date.now().toString(),
            aroma: '',
            stock: '',
            precioVenta: product.precioVenta,  // auto-fill from principal
            imagenUrl: '',
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

    const handleDelete = (id: string) => setDeleteTarget(id);

    const confirmDelete = () => {
        if (deleteTarget) {
            setVariables((prev) => prev.filter((v) => v.id !== deleteTarget));
            setDeleteTarget(null);
        }
    };

    const handleChangeVariable = (
        id: string,
        field: keyof Variable,
        value: string
    ) => {
        setVariables((prev) =>
            prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = () => {
        setSubmitError(null);

        // Validaciones del cliente
        if (!product.nombre.trim()) {
            setSubmitError('El nombre del producto es requerido.');
            return;
        }
        if (!product.marca.trim()) {
            setSubmitError('La marca del producto es requerida.');
            return;
        }
        if (!product.imagenPadre.trim()) {
            setSubmitError('La imagen del producto es requerida.');
            return;
        }

        // Incluimos TODAS las variantes que tengan aroma (guardadas o no)
        const variantesListas = variables.filter((v) => v.aroma.trim() !== '');
        if (variantesListas.length === 0) {
            setSubmitError('Debe agregar al menos una variante con nombre/aroma.');
            return;
        }

        startTransition(async () => {
            const precioCompraGlobal = parseFloat(product.precioCompra) || 0;
            const result = await crearProducto({
                nombre: product.nombre,
                marca: product.marca,
                descripcion: product.descripcion || undefined,
                imagenPadre: product.imagenPadre,
                variantes: variantesListas.map((v) => ({
                    aroma: v.aroma,
                    stock: parseInt(v.stock) || 0,
                    precioVenta: parseFloat(v.precioVenta) || 0,
                    precioCompra: precioCompraGlobal,
                    imagenUrl: v.imagenUrl || undefined,
                })),
            });

            if (result?.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else if (result && !result.success) {
                setSubmitError(result.error ?? 'Error desconocido al guardar.');
            }
        });
    };

    const deleteTargetVariable = variables.find((v) => v.id === deleteTarget);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            {/* Loading / Success Overlays */}
            {(isPending || showSuccess) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 border border-gray-100 flex flex-col items-center justify-center text-center gap-4">
                        {showSuccess ? (
                            <>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-primary">Producto creado exitosamente</h3>
                            </>
                        ) : (
                            <>
                                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-2" />
                                <h3 className="text-xl font-bold text-primary">Guardando producto...</h3>
                                <p className="text-sm text-secondary">Por favor, esperá un momento.</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteTarget && deleteTargetVariable && (
                <DeleteModal
                    variableName={deleteTargetVariable.aroma || 'sin nombre'}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <div className="flex flex-col gap-10 max-w-4xl">
                {/* ── Section 1: Producto principal ── */}
                <section>
                    <h1 className="text-3xl font-bold text-primary mb-1">
                        Crear producto principal
                    </h1>
                    <p className="text-secondary text-sm">
                        Completá los datos del producto principal. Luego agregá las variantes (aromas) disponibles.
                    </p>

                    <hr className='mt-3 mb-6 border-orange-100' />

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image upload */}
                        <ProductImageUpload
                            imageUrl={product.imagenPadre || undefined}
                            onUploaded={(url) => setProduct((p) => ({ ...p, imagenPadre: url }))}
                        />

                        {/* Fields */}
                        <div className="flex-1 flex flex-col gap-5">
                            <InputField
                                label="Nombre del producto"
                                value={product.nombre}
                                onChange={(v) => setProduct((p) => ({ ...p, nombre: v }))}
                                placeholder="Ej: Sahumerio Flora"
                                required
                            />
                            <InputField
                                label="Marca del producto"
                                value={product.marca}
                                onChange={(v) => setProduct((p) => ({ ...p, marca: v }))}
                                placeholder="Ej: Shama"
                                required
                            />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField
                                    label="Precio de venta"
                                    value={product.precioVenta}
                                    onChange={handleProductPrecioVenta}
                                    placeholder="$0"
                                    type="number"
                                    required
                                />
                                <InputField
                                    label="Precio de compra"
                                    value={product.precioCompra}
                                    onChange={(v) => setProduct((p) => ({ ...p, precioCompra: v }))}
                                    placeholder="$0"
                                    type="number"
                                    required
                                />
                            </div>
                            <InputField
                                label="Descripción (opcional)"
                                value={product.descripcion}
                                onChange={(v) => setProduct((p) => ({ ...p, descripcion: v }))}
                                placeholder="Breve descripción del producto"
                            />
                        </div>
                    </div>
                </section>

                {/* ── Section 2: Variables ── */}
                <section className='mt-6 mb-3'>
                    <h2 className="text-3xl font-bold text-primary mb-1">
                        Variantes del producto
                    </h2>
                    <p className="text-secondary text-sm">
                        Agregá cada variante (aroma) con su stock y precio de venta. Presioná ✓ para guardar cada una.
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
                            Agregar variante
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </section>

                {/* ── Error message ── */}
                {submitError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700">{submitError}</p>
                        <button
                            onClick={() => setSubmitError(null)}
                            className="ml-auto text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── Footer buttons ── */}
                <div className="flex items-center justify-between pb-8">
                    <button
                        onClick={() => router.push('/inventory')}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="flex items-center gap-2 px-8 py-3 cursor-pointer rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Guardando…
                            </>
                        ) : (
                            'Crear producto'
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
