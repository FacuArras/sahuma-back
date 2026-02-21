'use client';

import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const data = [
    { nombre: 'Sahumerios Premium', valor: 38 },
    { nombre: 'Sahumerios Naturales', valor: 27 },
    { nombre: 'Conos', valor: 14 },
    { nombre: 'Sahumerios Artesanales', valor: 10 },
    { nombre: 'Kits', valor: 7 },
    { nombre: 'Accesorios', valor: 4 },
];

// Paleta de colores tierra — consistente con globals.css
const COLORS = [
    '#B07D62', // chart-bar (terracota)
    '#7A5C3E', // marrón oscuro
    '#D4B49F', // chart-light (arena)
    '#C9956F', // naranja tierra
    '#4E6B5E', // verde oliva oscuro
    '#8FAF9F', // verde oliva claro
];

export default function SalesByCategoryChart() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-primary">Ventas por Categoría</h3>
                <p className="text-sm text-orange-400">Distribución de ingresos por tipo de producto</p>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="valor"
                            nameKey="nombre"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={110}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={entry.nombre}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: 13,
                            }}
                            formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Participación']}
                        />
                        <Legend
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                            formatter={(value) => (
                                <span style={{ color: '#8C8C8C', fontWeight: 500 }}>{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
