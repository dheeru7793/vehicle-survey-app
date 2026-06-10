'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Row = { _id: { surveyorName: string }; count: number };

export function PerformanceChart({ data }: { data: Row[] }) {
  const flat = data.map((r) => ({ name: r._id.surveyorName, count: r.count }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, flat.length * 32)}>
      <BarChart data={flat} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={140} />
        <Tooltip />
        <Bar dataKey="count" fill="#37474F" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
