import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button } from './ui/tech-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ModelConfig, QuantizationType, parseTransformersConfig } from '@/lib/core/index';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface ModelConfigFormProps {
  config: ModelConfig;
  onChange: (config: ModelConfig) => void;
}

export function ModelConfigForm({ config, onChange }: ModelConfigFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof ModelConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleImport = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/config/fetch?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      
      const configJson = await response.json();
      const parsed = parseTransformersConfig(configJson);
      
      onChange({
        ...config,
        totalParameters: parsed.totalParameters || config.totalParameters,
        numLayers: parsed.numLayers || config.numLayers,
        hiddenSize: parsed.hiddenSize || config.hiddenSize,
        numAttentionHeads: parsed.numAttentionHeads || config.numAttentionHeads,
        numKvHeads: parsed.numKvHeads || config.numKvHeads,
        headDim: parsed.headDim || config.headDim,
      });
      
    } catch (err: any) {
      setError(err.message || t('config.import.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('config.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Section */}
        <div className="space-y-4 bg-muted/50 p-4 border border-border">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary"></div>
            <h4 className="text-sm font-mono font-bold uppercase text-muted-foreground">{t('config.import.title')}</h4>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder={t('config.import.placeholder')} 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleImport} disabled={loading || !url} className="w-24">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
          {error && (
            <Alert variant="destructive" className="py-2 rounded-none border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-mono ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Model Parameters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary"></div>
            <h4 className="text-sm font-mono font-bold uppercase text-muted-foreground">{t('config.modelParams.title')}</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalParameters">{t('config.modelParams.totalParams')}</Label>
              <Input 
                id="totalParameters" 
                value={config.totalParameters} 
                onChange={(e) => handleChange('totalParameters', e.target.value)}
                placeholder={t('config.modelParams.totalParamsPlaceholder')}
              />
              <p className="text-[10px] text-muted-foreground font-mono">{t('config.modelParams.format')}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantization">{t('config.modelParams.quantization')}</Label>
              <Select 
                value={config.quantization} 
                onValueChange={(value) => handleChange('quantization', value as QuantizationType)}
              >
                <SelectTrigger className="w-full bg-input border-2 border-border font-mono rounded-none focus:ring-0 focus:border-primary">
                  <SelectValue placeholder={t('config.modelParams.selectPrecision')} />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border rounded-none font-mono">
                  <SelectItem value="FP16">{t('config.quantization.FP16')}</SelectItem>
                  <SelectItem value="BF16">{t('config.quantization.BF16')}</SelectItem>
                  <SelectItem value="FP8">{t('config.quantization.FP8')}</SelectItem>
                  <SelectItem value="INT8">{t('config.quantization.INT8')}</SelectItem>
                  <SelectItem value="INT4">{t('config.quantization.INT4')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numLayers">{t('config.modelParams.layers')}</Label>
              <Input 
                id="numLayers" 
                type="number"
                value={config.numLayers || ''} 
                onChange={(e) => handleChange('numLayers', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hiddenSize">{t('config.modelParams.hiddenSize')}</Label>
              <Input 
                id="hiddenSize" 
                type="number"
                value={config.hiddenSize || ''} 
                onChange={(e) => handleChange('hiddenSize', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numAttentionHeads">{t('config.modelParams.attnHeads')}</Label>
              <Input 
                id="numAttentionHeads" 
                type="number"
                value={config.numAttentionHeads || ''} 
                onChange={(e) => handleChange('numAttentionHeads', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numKvHeads">{t('config.modelParams.kvHeads')}</Label>
              <Input 
                id="numKvHeads" 
                type="number"
                value={config.numKvHeads || ''} 
                onChange={(e) => handleChange('numKvHeads', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border w-full"></div>

        {/* Inference Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary"></div>
            <h4 className="text-sm font-mono font-bold uppercase text-muted-foreground">{t('config.inference.title')}</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t('config.inference.batchSize')}</Label>
                <span className="text-xs font-mono text-primary">{config.batchSize}</span>
              </div>
              <Slider 
                value={[config.batchSize]} 
                min={1} 
                max={128} 
                step={1}
                onValueChange={(vals) => handleChange('batchSize', vals[0])}
                className="py-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>{t('config.inference.seqLength')}</Label>
                <span className="text-xs font-mono text-primary">{config.seqLength}</span>
              </div>
              <Slider 
                value={[config.seqLength]} 
                min={512} 
                max={128000} 
                step={512}
                onValueChange={(vals) => handleChange('seqLength', vals[0])}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>512</span>
                <span>128k</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
