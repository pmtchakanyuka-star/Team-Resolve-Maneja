import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { ChartSwitcher } from './ChartSwitcher';
import { WeightEntry, Camp } from '../../types';

interface ProjectionChartProps {
  entries: WeightEntry[];
  camp: Camp | null;
  targetWeight: number;
  weightUnit: 'kg' | 'lbs';
  t: any;
}

export function ProjectionChart({ entries, camp, targetWeight, weightUnit, t }: ProjectionChartProps) {
  const [chartType, setChartType] = useState<string>('Line');

  const convertWeight = (kg: number) => weightUnit === 'lbs' ? kg * 2.20462 : kg;
  const displayTarget = convertWeight(targetWeight);

  const { chartData, isOnTrack } = useMemo(() => {
    if (entries.length === 0) return { chartData: [], isOnTrack: false };

    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    const last7 = sortedEntries.slice(-7);
    
    const data: any[] = sortedEntries.map(e => ({
      date: e.date,
      actual: parseFloat(convertWeight(e.morningWeight || e.eveningWeight || 0).toFixed(1)),
      projected: null
    }));

    let isOnTrack = false;

    if (last7.length >= 2 && camp?.targetDate) {
      const first = last7[0];
      const last = last7[last7.length - 1];
      const firstW = convertWeight(first.morningWeight || first.eveningWeight || 0);
      const lastW = convertWeight(last.morningWeight || last.eveningWeight || 0);
      
      const daysDiff = Math.max(1, Math.floor((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 3600 * 24)));
      const avgDailyChange = (lastW - firstW) / daysDiff;

      const lastDate = new Date(last.date);
      const targetDate = new Date(camp.targetDate);
      
      let currentW = lastW;
      
      for (let i = 1; i <= 14; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];
        
        currentW += avgDailyChange;
        
        data.push({
          date: dateStr,
          actual: null,
          projected: parseFloat(currentW.toFixed(1))
        });

        if (dateStr === camp.targetDate && currentW <= displayTarget) {
          isOnTrack = true;
        }
      }
      
      // Also check if target is reached before target date
      if (!isOnTrack) {
        const projectedAtTargetDate = lastW + (avgDailyChange * Math.floor((targetDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)));
        if (projectedAtTargetDate <= displayTarget) {
          isOnTrack = true;
        }
      }
    }

    return { chartData: data, isOnTrack };
  }, [entries, camp, displayTarget, weightUnit]);

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
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-bold text-slate-900">{t.projectedWeight || 'Projected Weight'}</h3>
        {camp?.targetDate && (
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${isOnTrack ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isOnTrack ? (t.onTrack || 'On Track') : (t.atRisk || 'At Risk')}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-4">{t.campTrend || 'Camp Specific Trend'}</p>
      
      <ChartSwitcher options={['Line', 'Area']} selected={chartType} onChange={setChartType} />
      
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'Area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              {displayTarget > 0 && <ReferenceLine y={displayTarget} stroke="#15803d" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: t.targetWeight || 'Target', fill: '#15803d', fontSize: 12 }} />}
              {camp?.targetDate && <ReferenceLine x={camp.targetDate} stroke="#b91c1c" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: camp.targetDate, fill: '#b91c1c', fontSize: 12 }} />}
              <Area type="monotone" dataKey="actual" stroke="#2563eb" fill="#bfdbfe" strokeWidth={2} />
              <Area type="monotone" dataKey="projected" stroke="#2563eb" strokeDasharray="5 5" fill="transparent" strokeWidth={2} />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              {displayTarget > 0 && <ReferenceLine y={displayTarget} stroke="#15803d" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: t.targetWeight || 'Target', fill: '#15803d', fontSize: 12 }} />}
              {camp?.targetDate && <ReferenceLine x={camp.targetDate} stroke="#b91c1c" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: camp.targetDate, fill: '#b91c1c', fontSize: 12 }} />}
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="projected" stroke="#2563eb" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
