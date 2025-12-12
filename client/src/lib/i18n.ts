import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      app: {
        title: 'LLM VRAM ESTIMATOR',
        subtitle: 'v1.0.0 // CORE',
        github: 'GITHUB',
        about: 'ABOUT',
        footer: '© 2024 LLM VRAM ESTIMATOR. MIT LICENSE.',
        systemOnline: 'SYSTEM ONLINE',
      },
      config: {
        title: 'CONFIGURATION // INPUT',
        import: {
          title: 'IMPORT FROM URL',
          placeholder: 'HuggingFace / ModelScope URL',
          button: 'IMPORT',
          error: 'Failed to import config',
        },
        modelParams: {
          title: 'MODEL PARAMETERS',
          totalParams: 'Total Parameters',
          totalParamsPlaceholder: 'e.g. 70B, 7B',
          format: 'Format: 70B, 7B, 1.5B',
          quantization: 'Quantization',
          selectPrecision: 'Select precision',
          layers: 'Layers',
          hiddenSize: 'Hidden Size',
          attnHeads: 'Attn Heads',
          kvHeads: 'KV Heads',
        },
        inference: {
          title: 'INFERENCE SETTINGS',
          batchSize: 'Batch Size',
          seqLength: 'Sequence Length (Context)',
        },
        quantization: {
          FP16: 'FP16 (Half Precision)',
          BF16: 'BF16 (BFloat16)',
          FP8: 'FP8 (8-bit Float)',
          INT8: 'INT8 (8-bit Integer)',
          INT4: 'INT4 (4-bit Integer)',
        }
      },
      estimation: {
        title: 'ESTIMATION // OUTPUT',
        totalVram: 'TOTAL VRAM REQUIRED',
        modelWeights: 'MODEL WEIGHTS',
        kvCache: 'KV CACHE',
        overhead: 'OVERHEAD (20%)',
        attentionMechanism: 'ATTENTION MECHANISM',
        formula: '// KV Cache Formula',
      },
      visualization: {
        title: 'VISUALIZATION // GRAPH',
        model: 'Model',
        kvCache: 'KV Cache',
        overhead: 'Overhead',
      }
    }
  },
  zh: {
    translation: {
      app: {
        title: 'LLM 显存估算器',
        subtitle: 'v1.0.0 // 核心版',
        github: 'GITHUB',
        about: '关于',
        footer: '© 2024 LLM 显存估算器. MIT 协议.',
        systemOnline: '系统在线',
      },
      config: {
        title: '配置 // 输入',
        import: {
          title: '从 URL 导入',
          placeholder: 'HuggingFace / ModelScope 链接',
          button: '导入',
          error: '导入配置失败',
        },
        modelParams: {
          title: '模型参数',
          totalParams: '总参数量',
          totalParamsPlaceholder: '例如 70B, 7B',
          format: '格式: 70B, 7B, 1.5B',
          quantization: '量化精度',
          selectPrecision: '选择精度',
          layers: '层数 (Layers)',
          hiddenSize: '隐藏层大小 (Hidden Size)',
          attnHeads: '注意力头数 (Attn Heads)',
          kvHeads: 'KV 头数 (KV Heads)',
        },
        inference: {
          title: '推理设置',
          batchSize: '批处理大小 (Batch Size)',
          seqLength: '序列长度 (上下文)',
        },
        quantization: {
          FP16: 'FP16 (半精度)',
          BF16: 'BF16 (BFloat16)',
          FP8: 'FP8 (8位浮点)',
          INT8: 'INT8 (8位整数)',
          INT4: 'INT4 (4位整数)',
        }
      },
      estimation: {
        title: '估算结果 // 输出',
        totalVram: '所需总显存',
        modelWeights: '模型权重',
        kvCache: 'KV 缓存',
        overhead: '系统开销 (20%)',
        attentionMechanism: '注意力机制',
        formula: '// KV Cache 计算公式',
      },
      visualization: {
        title: '可视化 // 图表',
        model: '模型',
        kvCache: 'KV 缓存',
        overhead: '开销',
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh', // Default language set to Chinese
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
