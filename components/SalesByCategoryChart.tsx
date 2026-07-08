'use client';

import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export interface CategoryData {
    nombre: string;
    valor: number;
}

const COLORS = [
    '#B07D62',
    '#7A5C3E',
    '#D4B49F',
    '#C9956F',
    '#4E6B5E',
    '#8FAF9F',
];

export default function SalesByCategoryChart({ data }: { data: CategoryData[] }) {
    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                <div className="mb-5">
                    <h3 className="text-lg font-bold text-primary">Ventas por Marca</h3>
                    <p className="text-sm text-orange-400">Distribución de ingresos por marca este mes</p>
                </div>
                <p className="text-sm text-secondary py-8 text-center">Sin ventas registradas este mes</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="mb-5">
                <h3 className="text-lg font-bold text-primary">Ventas por Marca</h3>
                <p className="text-sm text-orange-400">Distribución de ingresos por marca este mes</p>
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
                            formatter={(value: number) => [`${value} uds`, 'Vendidos']}
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
