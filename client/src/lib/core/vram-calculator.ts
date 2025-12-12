/**
 * VRAM Estimator Core Logic
 * 核心显存估算逻辑模块
 */

export type AttentionType = 'MHA' | 'GQA' | 'MQA' | 'UNKNOWN';

export type QuantizationType = 'FP16' | 'BF16' | 'FP8' | 'INT8' | 'INT4';

export interface ModelConfig {
  // Model parameters
  totalParameters?: number | string; // Can be string like "70B"
  numLayers?: number;
  hiddenSize?: number;
  numAttentionHeads?: number;
  numKvHeads?: number;
  headDim?: number;
  
  // Inference config
  quantization: QuantizationType;
  batchSize: number;
  seqLength: number;
  systemOverheadPercent?: number; // Default 20%
}

export interface VRAMEstimation {
  // Components
  modelMemoryGB: number;
  kvCacheGB: number;
  systemOverheadGB: number;
  totalVRAMGB: number;
  
  // Attention info
  attentionType: AttentionType;
  attentionJudgmentReason: string;
  
  // KV Cache formula
  kvCacheFormula: string;
  kvCacheFormulaWithValues: string;
  
  // GPU requirements
  requiredGPUs?: number;
  avgGPULoad?: number; // Percentage
  gpuVRAMCapacityGB?: number;
}

/**
 * Get bytes per parameter based on quantization type
 */
export function getQuantizationBytes(quantization: QuantizationType): number {
  const bytesMap: Record<QuantizationType, number> = {
    'FP16': 2,
    'BF16': 2,
    'FP8': 1,
    'INT8': 1,
    'INT4': 0.5,
  };
  return bytesMap[quantization];
}

/**
 * Parse parameter count string like "70B", "7B", "1.5B" to number
 */
export function parseParameterCount(params: number | string): number {
  if (typeof params === 'number') {
    return params;
  }
  
  const str = params.toString().toUpperCase().trim();
  
  // Match patterns like "70B", "7.5B", "1.5B"
  const match = str.match(/^([\d.]+)([BMK])?$/);
  if (!match) {
    throw new Error(`Invalid parameter count format: ${params}`);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2] || '';
  
  switch (unit) {
    case 'B':
      return value * 1e9;
    case 'M':
      return value * 1e6;
    case 'K':
      return value * 1e3;
    default:
      return value;
  }
}

/**
 * Determine attention type based on model config
 */
export function determineAttentionType(config: ModelConfig): {
  type: AttentionType;
  reason: string;
} {
  const { numAttentionHeads, numKvHeads } = config;
  
  // Missing critical parameters
  if (numAttentionHeads === undefined || numAttentionHeads === null) {
    return {
      type: 'UNKNOWN',
      reason: 'num_attention_heads 未提供，无法判断Attention类型',
    };
  }
  
  // num_kv_heads missing - default to MHA
  if (numKvHeads === undefined || numKvHeads === null) {
    return {
      type: 'MHA',
      reason: 'num_kv_heads 未提供，默认按 MHA 计算（num_kv_heads = num_attention_heads）',
    };
  }
  
  // MHA: num_kv_heads == num_attention_heads
  if (numKvHeads === numAttentionHeads) {
    return {
      type: 'MHA',
      reason: `num_kv_heads (${numKvHeads}) == num_attention_heads (${numAttentionHeads})`,
    };
  }
  
  // MQA: num_kv_heads == 1
  if (numKvHeads === 1) {
    return {
      type: 'MQA',
      reason: `num_kv_heads == 1（所有Q头共享单个KV头）`,
    };
  }
  
  // GQA: 1 < num_kv_heads < num_attention_heads
  if (numKvHeads > 1 && numKvHeads < numAttentionHeads) {
    return {
      type: 'GQA',
      reason: `1 < num_kv_heads (${numKvHeads}) < num_attention_heads (${numAttentionHeads})`,
    };
  }
  
  // Invalid configuration
  return {
    type: 'UNKNOWN',
    reason: `无效的配置：num_kv_heads (${numKvHeads}) > num_attention_heads (${numAttentionHeads})`,
  };
}

/**
 * Calculate model memory in GB
 */
export function calculateModelMemory(config: ModelConfig): number {
  const paramCount = parseParameterCount(config.totalParameters || 0);
  const bytesPerParam = getQuantizationBytes(config.quantization);
  
  // Model Memory = Parameters × Bytes per parameter
  const bytes = paramCount * bytesPerParam;
  const gb = bytes / (1024 ** 3);
  
  return gb;
}

/**
 * Calculate KV Cache in GB
 */
export function calculateKVCache(config: ModelConfig, attentionType: AttentionType): {
  sizeGB: number;
  formula: string;
  formulaWithValues: string;
} {
  const {
    batchSize,
    seqLength,
    numLayers,
    numAttentionHeads,
    numKvHeads,
    headDim,
    quantization,
  } = config;
  
  // Validate required parameters
  if (!numLayers || !headDim) {
    return {
      sizeGB: 0,
      formula: 'KV Cache 计算需要 num_layers 和 head_dim',
      formulaWithValues: '',
    };
  }
  
  const dtypeBytes = getQuantizationBytes(quantization);
  
  let kvHeadsEffective: number;
  let formula: string;
  
  switch (attentionType) {
    case 'MHA':
      kvHeadsEffective = numAttentionHeads || 0;
      formula = '2 × batch_size × seq_len × num_layers × (num_attention_heads × head_dim) × dtype_bytes';
      break;
      
    case 'GQA':
      kvHeadsEffective = numKvHeads || 0;
      formula = '2 × batch_size × seq_len × num_layers × (num_kv_heads × head_dim) × dtype_bytes';
      break;
      
    case 'MQA':
      kvHeadsEffective = 1;
      formula = '2 × batch_size × seq_len × num_layers × (1 × head_dim) × dtype_bytes';
      break;
      
    default:
      return {
        sizeGB: 0,
        formula: '无法计算：Attention类型未知',
        formulaWithValues: '',
      };
  }
  
  // Calculate KV Cache size
  const bytes = 2 * batchSize * seqLength * numLayers * (kvHeadsEffective * headDim) * dtypeBytes;
  const gb = bytes / (1024 ** 3);
  
  // Formula with actual values
  const formulaWithValues = `2 × ${batchSize} × ${seqLength} × ${numLayers} × (${kvHeadsEffective} × ${headDim}) × ${dtypeBytes} bytes`;
  
  return {
    sizeGB: gb,
    formula,
    formulaWithValues,
  };
}

/**
 * Main estimation function
 */
export function estimateVRAM(config: ModelConfig, gpuVRAMCapacityGB?: number): VRAMEstimation {
  // Determine attention type
  const { type: attentionType, reason: attentionJudgmentReason } = determineAttentionType(config);
  
  // Calculate components
  const modelMemoryGB = calculateModelMemory(config);
  
  const kvCache = calculateKVCache(config, attentionType);
  const kvCacheGB = kvCache.sizeGB;
  
  const systemOverheadPercent = config.systemOverheadPercent ?? 20;
  const systemOverheadGB = modelMemoryGB * (systemOverheadPercent / 100);
  
  const totalVRAMGB = modelMemoryGB + kvCacheGB + systemOverheadGB;
  
  // GPU requirements
  let requiredGPUs: number | undefined;
  let avgGPULoad: number | undefined;
  
  if (gpuVRAMCapacityGB && gpuVRAMCapacityGB > 0) {
    requiredGPUs = Math.ceil(totalVRAMGB / gpuVRAMCapacityGB);
    avgGPULoad = (totalVRAMGB / requiredGPUs / gpuVRAMCapacityGB) * 100;
  }
  
  return {
    modelMemoryGB,
    kvCacheGB,
    systemOverheadGB,
    totalVRAMGB,
    attentionType,
    attentionJudgmentReason,
    kvCacheFormula: kvCache.formula,
    kvCacheFormulaWithValues: kvCache.formulaWithValues,
    requiredGPUs,
    avgGPULoad,
    gpuVRAMCapacityGB,
  };
}
