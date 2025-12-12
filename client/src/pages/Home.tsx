import React, { useState, useEffect } from 'react';
import { EstimatorLayout } from '@/components/EstimatorLayout';
import { ModelConfigForm } from '@/components/ModelConfigForm';
import { ResultCard } from '@/components/ResultCard';
import { VRAMVisualization } from '@/components/VRAMVisualization';
import { estimateVRAM, ModelConfig, VRAMEstimation } from '@/lib/core/index';

const DEFAULT_CONFIG: ModelConfig = {
  totalParameters: '70B',
  numLayers: 80,
  hiddenSize: 8192,
  numAttentionHeads: 64,
  numKvHeads: 8,
  headDim: 128,
  quantization: 'INT4',
  batchSize: 1,
  seqLength: 4096,
  systemOverheadPercent: 20,
};

export default function Home() {
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [estimation, setEstimation] = useState<VRAMEstimation | null>(null);

  useEffect(() => {
    try {
      const result = estimateVRAM(config);
      setEstimation(result);
    } catch (error) {
      console.error("Estimation failed:", error);
    }
  }, [config]);

  return (
    <EstimatorLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <ModelConfigForm config={config} onChange={setConfig} />
        </div>

        {/* Right Column: Results & Visualization */}
        <div className="lg:col-span-7 space-y-6">
          {estimation && (
            <>
              <ResultCard estimation={estimation} />
              <VRAMVisualization estimation={estimation} />
            </>
          )}
        </div>
      </div>
    </EstimatorLayout>
  );
}
