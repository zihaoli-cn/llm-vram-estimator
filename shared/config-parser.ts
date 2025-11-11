/**
 * Model Config Parser
 * 解析各种来源的模型配置
 */

export interface ParsedModelConfig {
  // Model identification
  modelName?: string;
  
  // Core parameters for VRAM estimation
  totalParameters?: number | string;
  numLayers?: number;
  hiddenSize?: number;
  numAttentionHeads?: number;
  numKvHeads?: number;
  headDim?: number;
  
  // Additional metadata
  architectures?: string[];
  modelType?: string;
  
  // Raw config for reference
  rawConfig?: any;
}

/**
 * Parse Hugging Face / ModelScope config.json
 * Supports various model architectures
 */
export function parseTransformersConfig(configJson: any): ParsedModelConfig {
  const parsed: ParsedModelConfig = {
    rawConfig: configJson,
  };
  
  // Model name
  parsed.modelName = configJson._name_or_path || configJson.model_type || 'Unknown Model';
  
  // Architectures
  parsed.architectures = configJson.architectures;
  parsed.modelType = configJson.model_type;
  
  // Total parameters (try to infer from config if not directly provided)
  if (configJson.num_parameters) {
    parsed.totalParameters = configJson.num_parameters;
  }
  
  // Number of layers
  parsed.numLayers = 
    configJson.num_hidden_layers || 
    configJson.n_layer || 
    configJson.num_layers ||
    configJson.n_layers;
  
  // Hidden size
  parsed.hiddenSize = 
    configJson.hidden_size || 
    configJson.n_embd || 
    configJson.d_model;
  
  // Number of attention heads
  parsed.numAttentionHeads = 
    configJson.num_attention_heads || 
    configJson.n_head || 
    configJson.num_heads;
  
  // Number of KV heads (for GQA/MQA)
  parsed.numKvHeads = 
    configJson.num_key_value_heads || 
    configJson.num_kv_heads ||
    configJson.n_head_kv;
  
  // Head dimension
  if (configJson.head_dim) {
    parsed.headDim = configJson.head_dim;
  } else if (parsed.hiddenSize && parsed.numAttentionHeads) {
    // Calculate head_dim from hidden_size / num_attention_heads
    parsed.headDim = Math.floor(parsed.hiddenSize / parsed.numAttentionHeads);
  }
  
  return parsed;
}

/**
 * Validate if config has minimum required fields for VRAM estimation
 */
export function validateConfig(config: ParsedModelConfig): {
  valid: boolean;
  missingFields: string[];
} {
  const requiredFields = [
    'numLayers',
    'numAttentionHeads',
    'headDim',
  ];
  
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (config[field as keyof ParsedModelConfig] === undefined || 
        config[field as keyof ParsedModelConfig] === null) {
      missingFields.push(field);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Estimate total parameters from config if not provided
 * This is a rough estimation based on model architecture
 */
export function estimateTotalParameters(config: ParsedModelConfig): number | undefined {
  const { numLayers, hiddenSize, numAttentionHeads } = config;
  
  if (!numLayers || !hiddenSize) {
    return undefined;
  }
  
  // Rough estimation formula for transformer models
  // Parameters ≈ 12 × num_layers × hidden_size²
  // This is a simplified formula and may not be accurate for all models
  const estimated = 12 * numLayers * Math.pow(hiddenSize, 2);
  
  return estimated;
}
