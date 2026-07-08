'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface RevenueChartData {
    name: string;
    ingresos: number;
    costes: number;
}

export default function RevenueChart({ data }: { data: RevenueChartData[] }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-primary">Ingresos vs Costes</h3>
                <p className="text-sm text-secondary">Últimos 6 meses de actividad financiera</p>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barGap={8}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8C8C8C', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#8C8C8C', fontSize: 12 }}
                            tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value) => [`$${(value ?? 0).toLocaleString('es-AR')}`, undefined]}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span className="text-secondary text-sm font-medium ml-1">{value}</span>}
                        />
                        <Bar
                            dataKey="ingresos"
                            name="Ingresos"
                            fill="var(--color-chart-bar)"
                            radius={[4, 4, 4, 4]}
                            barSize={32}
                        />
                        <Bar
                            dataKey="costes"
                            name="Costes"
                            fill="var(--color-chart-light)"
                            radius={[4, 4, 4, 4]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
