import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { ChartSwitcher } from './ChartSwitcher';
import { UserProfile, WeightEntry, Camp } from '../../types';

interface WeightOverviewChartProps {
  fighters: UserProfile[];
  entries: WeightEntry[];
  camps: Camp[];
  weightUnit: 'kg' | 'lbs';
  onStatusClick?: (status: string | null) => void;
  t: any;
}

const STATUS_COLORS = {
  'on-track': '#15803d', // green-700
  'close': '#b45309', // amber-700
  'over': '#b91c1c', // red-700
  'missing': '#b91c1c', // red-700
};

const SPORT_COLORS: Record<string, string> = {
  'mma': '#b91c1c', // red-700
  'karate': '#1d4ed8', // blue-700
  'kickboxing': '#b45309', // amber-700
  'jiu_jitsu': '#7e22ce', // purple-700
};

export function WeightOverviewChart({ fighters, entries, camps, weightUnit, onStatusClick, t }: WeightOverviewChartProps) {
  const [chartType, setChartType] = useState<string>('Bar');

  const convertWeight = (kg: number) => weightUnit === 'lbs' ? kg * 2.20462 : kg;

  const fighterData = useMemo(() => {
    return fighters.map(fighter => {
      const fighterEntries = entries.filter(e => e.uid === fighter.uid).sort((a, b) => b.date.localeCompare(a.date));
      const latestEntry = fighterEntries.find(e => e.morningWeight || e.eveningWeight);
      const activeCamp = camps.find(c => c.uid === fighter.uid && c.isActive);
      const currentWeightKg = latestEntry?.morningWeight || latestEntry?.eveningWeight || activeCamp?.startingWeight || fighter.startingWeight || 0;
      const targetWeightKg = fighter.targetWeight || 0;
      
      const currentWeight = convertWeight(currentWeightKg);
      const targetWeight = convertWeight(targetWeightKg);

      let status = 'missing';
      if (latestEntry) {
        const daysSince = Math.floor((new Date().getTime() - new Date(latestEntry.date).getTime()) / (1000 * 3600 * 24));
        if (daysSince > 2) {
          status = 'missing';
        } else if (targetWeight > 0) {
          const overPercent = ((currentWeight - targetWeight) / targetWeight) * 100;
          if (overPercent <= 1) status = 'on-track';
          else if (overPercent <= 3) status = 'close';
          else status = 'over';
        } else {
          status = 'on-track';
        }
      }

      return {
        ...fighter,
        currentWeight: parseFloat(currentWeight.toFixed(1)),
        targetWeight: parseFloat(targetWeight.toFixed(1)),
        status,
        sport: fighter.sports?.[0] || 'mma',
        entries: fighterEntries
      };
    });
  }, [fighters, entries, camps, weightUnit]);

  const donutData = useMemo(() => {
    const counts = { 'on-track': 0, 'close': 0, 'over': 0, 'missing': 0 };
    fighterData.forEach(f => {
      counts[f.status as keyof typeof counts]++;
    });
    return [
      { name: t.onTrack || 'On Track', value: counts['on-track'], status: 'on-track' },
      { name: 'Close', value: counts['close'], status: 'close' },
      { name: 'Over', value: counts['over'], status: 'over' },
      { name: 'Missing Data', value: counts['missing'], status: 'missing' },
    ].filter(d => d.value > 0);
  }, [fighterData, t]);

  const lineData = useMemo(() => {
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d.toISOString().split('T')[0];
    });

    return dates.map(date => {
      const point: any = { date };
      fighterData.forEach(f => {
        const entry = f.entries.find(e => e.date === date);
        if (entry) {
          const w = entry.morningWeight || entry.eveningWeight;
          if (w) point[f.name] = parseFloat(convertWeight(w).toFixed(1));
        }
      });
      return point;
    });
  }, [fighterData, weightUnit]);

  if (fighters.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center h-80">
        <BarChart2 className="w-10 h-10 text-slate-200 mb-2" />
        <p className="text-sm text-slate-500">{t.noFightersYet || 'No fighters yet'}</p>
      </div>
    );
  }

  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const fighter = fighterData.find(f => f.name === payload.value);
    const color = fighter ? SPORT_COLORS[fighter.sport] : '#64748b';
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill={color} fontSize={12} fontWeight="bold">
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-1">{t.targetVsCurrent || 'Target vs Current'}</h3>
      <p className="text-sm text-slate-500 mb-4">{t.overallTrend || 'Overall Trend'}</p>

      <ChartSwitcher options={['Bar', 'Donut', 'Line']} selected={chartType} onChange={setChartType} />

      <div className="h-60 sm:h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'Bar' ? (
            <BarChart data={fighterData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={<CustomTick />} />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="targetWeight" name={t.targetWeight || 'Target'} fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="currentWeight" name={t.current || 'Current'} radius={[4, 4, 0, 0]}>
                {fighterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === 'Donut' ? (
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                onClick={(data: any) => onStatusClick?.(data.status)}
                className="cursor-pointer"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
            </PieChart>
          ) : (
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              {fighterData.map((fighter, i) => (
                <Line 
                  key={fighter.uid} 
                  type="monotone" 
                  dataKey={fighter.name} 
                  stroke={SPORT_COLORS[fighter.sport] || `hsl(${i * 45}, 70%, 50%)`} 
                  strokeWidth={2} 
                  dot={false} 
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
