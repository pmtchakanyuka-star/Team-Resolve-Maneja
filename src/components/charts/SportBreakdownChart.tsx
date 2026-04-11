import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { ChartSwitcher } from './ChartSwitcher';
import { UserProfile, WeightEntry, Camp } from '../../types';

interface SportBreakdownChartProps {
  fighters: UserProfile[];
  entries: WeightEntry[];
  camps: Camp[];
  weightUnit: 'kg' | 'lbs';
  t: any;
}

const SPORT_COLORS: Record<string, string> = {
  'mma': '#b91c1c', // red-700
  'karate': '#1d4ed8', // blue-700
  'kickboxing': '#b45309', // amber-700
  'jiu_jitsu': '#7e22ce', // purple-700
};

export function SportBreakdownChart({ fighters, entries, camps, weightUnit, t }: SportBreakdownChartProps) {
  const [chartType, setChartType] = useState<string>('Donut');

  const convertWeight = (kg: number) => weightUnit === 'lbs' ? kg * 2.20462 : kg;

  const { donutData, barData } = useMemo(() => {
    const sportCounts: Record<string, number> = { 'mma': 0, 'karate': 0, 'kickboxing': 0, 'jiu_jitsu': 0 };
    const sportWeights: Record<string, { current: number, target: number, count: number }> = {
      'mma': { current: 0, target: 0, count: 0 },
      'karate': { current: 0, target: 0, count: 0 },
      'kickboxing': { current: 0, target: 0, count: 0 },
      'jiu_jitsu': { current: 0, target: 0, count: 0 }
    };

    fighters.forEach(f => {
      const sport = f.sports?.[0] || 'mma';
      sportCounts[sport]++;
      
      const fighterEntries = entries.filter(e => e.uid === f.uid).sort((a, b) => b.date.localeCompare(a.date));
      const latestEntry = fighterEntries.find(e => e.morningWeight || e.eveningWeight);
      const activeCamp = camps.find(c => c.uid === f.uid && c.isActive);
      const currentWeightKg = latestEntry?.morningWeight || latestEntry?.eveningWeight || activeCamp?.startingWeight || f.startingWeight || 0;
      const targetWeightKg = f.targetWeight || 0;

      sportWeights[sport].current += convertWeight(currentWeightKg);
      sportWeights[sport].target += convertWeight(targetWeightKg);
      sportWeights[sport].count++;
    });

    const dData = Object.entries(sportCounts)
      .filter(([_, count]) => count > 0)
      .map(([sport, count]) => ({
        name: t[`sport${sport.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`] || sport,
        value: count,
        sport
      }));

    const bData = Object.entries(sportWeights)
      .filter(([_, data]) => data.count > 0)
      .map(([sport, data]) => ({
        name: t[`sport${sport.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`] || sport,
        currentWeight: parseFloat((data.current / data.count).toFixed(1)),
        targetWeight: parseFloat((data.target / data.count).toFixed(1)),
        sport
      }));

    return { donutData: dData, barData: bData };
  }, [fighters, entries, camps, weightUnit, t]);

  if (fighters.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center justify-center h-80">
        <BarChart2 className="w-10 h-10 text-slate-200 mb-2" />
        <p className="text-sm text-slate-500">{t.noFightersYet || 'No fighters yet'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-1">{t.allSports || 'All Sports'}</h3>
      <p className="text-sm text-slate-500 mb-4">{t.coachSports || 'Assigned Sports'}</p>
      
      <ChartSwitcher options={['Donut', 'Bar']} selected={chartType} onChange={setChartType} />
      
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'Donut' ? (
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SPORT_COLORS[entry.sport]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="targetWeight" name={t.targetWeight || 'Target'} fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="currentWeight" name={t.current || 'Current'} radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SPORT_COLORS[entry.sport]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
