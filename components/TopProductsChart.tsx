'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export interface TopProductData {
    nombre: string;
    unidades: number;
}

const BAR_COLOR = '#B07D62';
const BAR_COLOR_LIGHT = '#D4B49F';

export default function TopProductsChart({ data }: { data: TopProductData[] }) {
    const sorted = [...data].sort((a, b) => b.unidades - a.unidades).slice(0, 8);
    const maxUnidades = Math.max(...sorted.map(d => d.unidades), 1);
    const domainMax = Math.ceil(maxUnidades / 5) * 5 || 5;

    if (sorted.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-primary">Productos Más Vendidos</h3>
                    <p className="text-sm text-orange-400">Ranking de unidades vendidas este mes</p>
                </div>
                <p className="text-sm text-secondary py-8 text-center">Sin ventas registradas este mes</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-primary">Productos Más Vendidos</h3>
                <p className="text-sm text-orange-400">Ranking de unidades vendidas este mes</p>
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
                        domain={[0, domainMax]}
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
                        formatter={(value) => [`${value ?? 0} unidades`, 'Vendidos']}
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
