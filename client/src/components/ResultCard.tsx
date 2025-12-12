import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/tech-ui';
import { VRAMEstimation } from '@/lib/core/index';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ResultCardProps {
  estimation: VRAMEstimation;
}

export function ResultCard({ estimation }: ResultCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="h-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('estimation.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total VRAM Display */}
        <div className="relative overflow-hidden border-2 border-primary bg-primary/5 p-6">
          <div className="absolute top-0 right-0 p-2">
            <div className="w-2 h-2 bg-primary animate-pulse"></div>
          </div>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{t('estimation.totalVram')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-mono font-bold text-primary tracking-tighter">
              {estimation.totalVRAMGB.toFixed(2)}
            </span>
            <span className="text-xl font-mono text-muted-foreground">GB</span>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-border p-4 bg-card hover:border-chart-1 transition-colors group">
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1 group-hover:text-chart-1">{t('estimation.modelWeights')}</p>
            <p className="text-xl font-mono font-bold">{estimation.modelMemoryGB.toFixed(2)} <span className="text-xs text-muted-foreground">GB</span></p>
          </div>
          
          <div className="border-2 border-border p-4 bg-card hover:border-chart-2 transition-colors group">
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1 group-hover:text-chart-2">{t('estimation.kvCache')}</p>
            <p className="text-xl font-mono font-bold">{estimation.kvCacheGB.toFixed(2)} <span className="text-xs text-muted-foreground">GB</span></p>
          </div>
          
          <div className="border-2 border-border p-4 bg-card hover:border-chart-3 transition-colors group">
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1 group-hover:text-chart-3">{t('estimation.overhead')}</p>
            <p className="text-xl font-mono font-bold">{estimation.systemOverheadGB.toFixed(2)} <span className="text-xs text-muted-foreground">GB</span></p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="space-y-2 border-t-2 border-border pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-muted-foreground uppercase">{t('estimation.attentionMechanism')}</span>
            <span className={cn(
              "text-xs font-mono font-bold px-2 py-0.5 border border-border",
              estimation.attentionType === 'MQA' ? "bg-chart-1 text-black border-chart-1" :
              estimation.attentionType === 'GQA' ? "bg-chart-2 text-black border-chart-2" :
              "bg-muted text-foreground"
            )}>
              {estimation.attentionType}
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground text-right">
            {estimation.attentionJudgmentReason}
          </p>
        </div>

        {/* Formula Display */}
        <div className="bg-muted p-3 border border-border font-mono text-[10px] text-muted-foreground overflow-x-auto whitespace-nowrap">
          <p className="mb-1 text-primary/70">{t('estimation.formula')}</p>
          {estimation.kvCacheFormulaWithValues}
        </div>
      </CardContent>
    </Card>
  );
}
