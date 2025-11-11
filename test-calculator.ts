/**
 * Test script for VRAM calculator
 */
import { estimateVRAM, type ModelConfig } from './shared/vram-calculator';

// Test case 1: DeepSeek-R1-Distill-Llama-70B (GQA)
console.log('=== Test Case 1: DeepSeek-R1-Distill-Llama-70B (GQA) ===');
const config1: ModelConfig = {
  totalParameters: '70B',
  numLayers: 80,
  hiddenSize: 8192,
  numAttentionHeads: 64,
  numKvHeads: 8,
  headDim: 128,
  quantization: 'INT4',
  batchSize: 32,
  seqLength: 4096,
  systemOverheadPercent: 20,
};

const result1 = estimateVRAM(config1, 80); // A100 80GB
console.log('Attention Type:', result1.attentionType);
console.log('Reason:', result1.attentionJudgmentReason);
console.log('Model Memory:', result1.modelMemoryGB.toFixed(2), 'GB');
console.log('KV Cache:', result1.kvCacheGB.toFixed(2), 'GB');
console.log('System Overhead:', result1.systemOverheadGB.toFixed(2), 'GB');
console.log('Total VRAM:', result1.totalVRAMGB.toFixed(2), 'GB');
console.log('Required GPUs:', result1.requiredGPUs);
console.log('Avg GPU Load:', result1.avgGPULoad?.toFixed(2), '%');
console.log('KV Cache Formula:', result1.kvCacheFormula);
console.log('KV Cache Formula (with values):', result1.kvCacheFormulaWithValues);
console.log();

// Test case 2: GPT-3 style model (MHA)
console.log('=== Test Case 2: GPT-3 Style Model (MHA) ===');
const config2: ModelConfig = {
  totalParameters: '175B',
  numLayers: 96,
  hiddenSize: 12288,
  numAttentionHeads: 96,
  numKvHeads: 96, // Same as attention heads = MHA
  headDim: 128,
  quantization: 'FP16',
  batchSize: 8,
  seqLength: 2048,
};

const result2 = estimateVRAM(config2, 40); // A100 40GB
console.log('Attention Type:', result2.attentionType);
console.log('Reason:', result2.attentionJudgmentReason);
console.log('Total VRAM:', result2.totalVRAMGB.toFixed(2), 'GB');
console.log('Required GPUs:', result2.requiredGPUs);
console.log();

// Test case 3: MQA model
console.log('=== Test Case 3: MQA Model ===');
const config3: ModelConfig = {
  totalParameters: '7B',
  numLayers: 32,
  hiddenSize: 4096,
  numAttentionHeads: 32,
  numKvHeads: 1, // Single KV head = MQA
  headDim: 128,
  quantization: 'BF16',
  batchSize: 16,
  seqLength: 8192,
};

const result3 = estimateVRAM(config3, 24); // RTX 4090 24GB
console.log('Attention Type:', result3.attentionType);
console.log('Reason:', result3.attentionJudgmentReason);
console.log('Total VRAM:', result3.totalVRAMGB.toFixed(2), 'GB');
console.log('Required GPUs:', result3.requiredGPUs);
console.log();

// Test case 4: Missing num_kv_heads (should default to MHA)
console.log('=== Test Case 4: Missing num_kv_heads ===');
const config4: ModelConfig = {
  totalParameters: '13B',
  numLayers: 40,
  hiddenSize: 5120,
  numAttentionHeads: 40,
  // numKvHeads not provided
  headDim: 128,
  quantization: 'INT8',
  batchSize: 4,
  seqLength: 4096,
};

const result4 = estimateVRAM(config4);
console.log('Attention Type:', result4.attentionType);
console.log('Reason:', result4.attentionJudgmentReason);
console.log('Total VRAM:', result4.totalVRAMGB.toFixed(2), 'GB');
console.log();

console.log('All tests completed!');
