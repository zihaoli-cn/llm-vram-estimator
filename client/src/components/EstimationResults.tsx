import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { VRAMEstimation } from "../../../shared/vram-calculator";

interface EstimationResultsProps {
  estimation: VRAMEstimation | null;
}

export default function EstimationResults({ estimation }: EstimationResultsProps) {
  if (!estimation) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>估算结果</CardTitle>
          <CardDescription>
            配置完成后点击"开始估算"查看结果
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
          等待估算...
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = [
    {
      name: 'VRAM组成',
      'Model Memory': parseFloat(estimation.modelMemoryGB.toFixed(2)),
      'KV Cache': parseFloat(estimation.kvCacheGB.toFixed(2)),
      'System Overhead': parseFloat(estimation.systemOverheadGB.toFixed(2)),
    },
  ];

  const colors = {
    'Model Memory': '#3b82f6',
    'KV Cache': '#10b981',
    'System Overhead': '#f59e0b',
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = data['Model Memory'] + data['KV Cache'] + data['System Overhead'];
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          {payload.map((entry: any) => {
            const percentage = ((entry.value / total) * 100).toFixed(1);
            return (
              <div key={entry.name} className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}:</span>
                <span className="text-sm">{entry.value.toFixed(2)} GB ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>估算结果</CardTitle>
        <CardDescription>
          GPU显存使用量详细分析
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">总预估显存</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {estimation.totalVRAMGB.toFixed(2)} GB
            </div>
          </div>

          {estimation.requiredGPUs && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">所需GPU数量</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estimation.requiredGPUs} 块
              </div>
            </div>
          )}

          {estimation.avgGPULoad && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">单卡平均负载</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {estimation.avgGPULoad.toFixed(1)}%
              </div>
            </div>
          )}

          {estimation.gpuVRAMCapacityGB && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">单卡显存容量</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {estimation.gpuVRAMCapacityGB} GB
              </div>
            </div>
          )}
        </div>

        {/* Attention Type Info */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">检测到的Attention架构:</span>
            <span className="font-mono text-sm font-bold text-primary">
              {estimation.attentionType}
            </span>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm max-w-xs">{estimation.attentionJudgmentReason}</p>
              </TooltipContent>
            </UITooltip>
          </div>
          <div className="text-sm text-muted-foreground">
            {estimation.attentionType === 'MHA' && 'Multi-Head Attention: 每个Q头对应独立KV头'}
            {estimation.attentionType === 'GQA' && 'Grouped Query Attention: Q头分组共享KV头'}
            {estimation.attentionType === 'MQA' && 'Multi-Query Attention: 所有Q头共享单个KV头'}
            {estimation.attentionType === 'UNKNOWN' && '无法确定Attention类型'}
          </div>
        </div>

        {/* VRAM Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">显存组成详情</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
              <span className="text-sm font-medium">Model Memory</span>
              <span className="text-sm font-semibold">{estimation.modelMemoryGB.toFixed(2)} GB</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">KV Cache</span>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">计算公式:</p>
                      <p className="text-xs font-mono">{estimation.kvCacheFormula}</p>
                      <p className="text-sm font-semibold mt-2">当前计算:</p>
                      <p className="text-xs font-mono">{estimation.kvCacheFormulaWithValues}</p>
                      <p className="text-xs mt-2">= {estimation.kvCacheGB.toFixed(2)} GB</p>
                    </div>
                  </TooltipContent>
                </UITooltip>
              </div>
              <span className="text-sm font-semibold">{estimation.kvCacheGB.toFixed(2)} GB</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded">
              <span className="text-sm font-medium">System Overhead</span>
              <span className="text-sm font-semibold">{estimation.systemOverheadGB.toFixed(2)} GB</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">显存占用可视化</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" label={{ value: 'GB', position: 'insideBottom', offset: -5 }} />
                <YAxis type="category" dataKey="name" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Model Memory" stackId="a" fill={colors['Model Memory']} />
                <Bar dataKey="KV Cache" stackId="a" fill={colors['KV Cache']} />
                <Bar dataKey="System Overhead" stackId="a" fill={colors['System Overhead']} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
