import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { WeightEntry } from '../../types';

interface CalorieWeightChartProps {
  entries: WeightEntry[];
  weightUnit: 'kg' | 'lbs';
  t: any;
}

export function CalorieWeightChart({ entries, weightUnit, t }: CalorieWeightChartProps) {
  const convertWeight = (kg: number) => weightUnit === 'lbs' ? kg * 2.20462 : kg;

  const chartData = useMemo(() => {
    if (entries.length === 0) return [];

    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    return dates.map(date => {
      const entry = entries.find(e => e.date === date);
      const weight = entry?.morningWeight || entry?.eveningWeight;
      return {
        date,
        calories: entry?.estimatedCalories || 0,
        weight: weight ? parseFloat(convertWeight(weight).toFixed(1)) : null
      };
    });
  }, [entries, weightUnit]);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center h-80">
        <BarChart2 className="w-10 h-10 text-slate-200 mb-2" />
        <p className="text-sm text-slate-500">{t.noEntriesYet || 'No entries yet'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-1">{t.calories || 'Calories'} vs {t.morningWeight || 'Morning Weight'}</h3>
      <p className="text-sm text-slate-500 mb-4">{t.trend || 'Trend'}</p>
      
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} orientation="left" />
            <YAxis yAxisId="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} orientation="right" domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="calories" name={t.calories || 'Calories'} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="weight" name={t.morningWeight || 'Weight'} stroke="#2563eb" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
