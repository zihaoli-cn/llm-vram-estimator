import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/tech-ui';
import { VRAMEstimation } from '@/lib/core/index';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

interface VRAMVisualizationProps {
  estimation: VRAMEstimation;
}

export function VRAMVisualization({ estimation }: VRAMVisualizationProps) {
  const { t } = useTranslation();

  const data = [
    {
      name: t('visualization.model'),
      value: estimation.modelMemoryGB,
      color: 'var(--chart-1)',
    },
    {
      name: t('visualization.kvCache'),
      value: estimation.kvCacheGB,
      color: 'var(--chart-2)',
    },
    {
      name: t('visualization.overhead'),
      value: estimation.systemOverheadGB,
      color: 'var(--chart-3)',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border-2 border-border p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-mono font-bold uppercase mb-1">{label}</p>
          <p className="text-sm font-mono text-primary">
            {payload[0].value.toFixed(2)} GB
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('visualization.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                width={60}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--muted)/20'}} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentage Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex h-4 w-full overflow-hidden border border-border bg-muted">
            <div 
              className="h-full bg-chart-1 transition-all duration-500" 
              style={{ width: `${(estimation.modelMemoryGB / estimation.totalVRAMGB) * 100}%` }}
            />
            <div 
              className="h-full bg-chart-2 transition-all duration-500" 
              style={{ width: `${(estimation.kvCacheGB / estimation.totalVRAMGB) * 100}%` }}
            />
            <div 
              className="h-full bg-chart-3 transition-all duration-500" 
              style={{ width: `${(estimation.systemOverheadGB / estimation.totalVRAMGB) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-chart-1"></div>
              <span>{t('visualization.model')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-chart-2"></div>
              <span>{t('visualization.kvCache')}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-chart-3"></div>
              <span>{t('visualization.overhead')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
