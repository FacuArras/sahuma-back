'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const data = [
    { nombre: 'Palo Santo', unidades: 17 },
    { nombre: 'Lavanda', unidades: 14 },
    { nombre: 'Conos de Sándalo', unidades: 8 },
    { nombre: 'Copal', unidades: 8 },
    { nombre: 'Conos de Canela', unidades: 6 },
    { nombre: 'Cedrón', unidades: 5 },
];

// Ordenamos de mayor a menor para que el más vendido quede arriba
const sorted = [...data].sort((a, b) => b.unidades - a.unidades);

const BAR_COLOR = '#B07D62';       // var(--color-chart-bar) — terracota
const BAR_COLOR_LIGHT = '#D4B49F'; // var(--color-chart-light) — arena

export default function TopProductsChart() {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-primary">Productos Más Vendidos</h3>
                <p className="text-sm text-orange-400">Ranking de unidades vendidas en los últimos 6 meses</p>
            </div>

            <ResponsiveContainer width="100%" height={sorted.length * 52}>
                <BarChart
                    data={sorted}
                    layout="vertical"
                    margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                    barSize={20}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8C8C8C', fontSize: 12 }}
                        domain={[0, 20]}
                        ticks={[0, 5, 10, 15, 20]}
                    />
                    <YAxis
                        type="category"
                        dataKey="nombre"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#555', fontSize: 12 }}
                        width={120}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(76,175,110,0.06)' }}
                        contentStyle={{
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: 13,
                        }}
                        formatter={(value: number | undefined) => [`${value ?? 0} unidades`, 'Vendidos']}
                    />
                    <Bar dataKey="unidades" radius={[0, 4, 4, 0]}>
                        {sorted.map((entry, index) => (
                            <Cell
                                key={entry.nombre}
                                fill={index === 0 ? BAR_COLOR : BAR_COLOR_LIGHT}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
