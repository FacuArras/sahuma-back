# Shauma Backend

Panel de administración interno para la gestión de productos, inventario y ventas de Shauma. Construido con **Next.js 14**, **Tailwind CSS**, **Prisma** y **MongoDB**.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS v4
- **Base de datos**: MongoDB (via Prisma ORM)
- **Imágenes**: Cloudinary
- **Gráficos**: Recharts
- **Lenguaje**: TypeScript

## Funcionalidades

- 📦 Gestión de inventario (productos y variantes)
- 🛒 Registro y historial de ventas
- 📊 Gráficos de ventas por producto y categoría
- ☁️ Subida de imágenes a Cloudinary
- 📱 Diseño responsive (sidebar + navegación inferior)

## Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/shauma-backend.git
cd shauma-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completá con tus credenciales:

```bash
cp .env.example .env
```

Editá `.env` con tus valores reales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URI de conexión a MongoDB Atlas |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary |

### 4. Generar el cliente Prisma

```bash
npx prisma generate
```

### 5. Correr el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en tu navegador.

## Deploy en Vercel

1. Importá el repositorio en [Vercel](https://vercel.com/new)
2. Configurá las variables de entorno en el dashboard de Vercel (las mismas que en `.env.example`)
3. Vercel detectará automáticamente Next.js y desplegará el proyecto

> ⚠️ **Importante**: El archivo `.env` está en `.gitignore` por seguridad. Nunca subas credenciales reales al repositorio. Usá siempre el panel de variables de entorno de Vercel.
