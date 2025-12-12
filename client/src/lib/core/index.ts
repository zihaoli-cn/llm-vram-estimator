/**
 * LLM VRAM Estimator - Core Library
 * 大语言模型显存估算核心库
 * 
 * 只包含核心计算逻辑，无数据库、GPU信息等外部依赖
 */

// Export calculator functions
export {
  estimateVRAM,
  calculateModelMemory,
  calculateKVCache,
  determineAttentionType,
  getQuantizationBytes,
  parseParameterCount,
} from './vram-calculator';

// Export config parser functions
export {
  parseTransformersConfig,
  validateConfig,
  estimateTotalParameters,
} from './config-parser';

// Export types
export type {
  ModelConfig,
  VRAMEstimation,
  AttentionType,
  QuantizationType,
} from './vram-calculator';

export type {
  ParsedModelConfig,
} from './config-parser';
