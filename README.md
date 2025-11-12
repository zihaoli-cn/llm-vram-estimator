# LLM VRAM Estimator

一个用于估算大语言模型在推理时GPU显存使用量的Web应用。

## 功能特性

### 🎯 核心功能

- **四种模型信息输入方式**
  - ModelScope搜索：直接搜索模型名称获取配置
  - URL输入：从ModelScope URL下载config.json
  - 文件上传：上传本地config.json文件
  - 手动输入：手动填写所有模型参数

- **Attention类型自动判断**
  - MHA (Multi-Head Attention)：每个Q头对应独立KV头
  - GQA (Grouped Query Attention)：Q头分组共享KV头
  - MQA (Multi-Query Attention)：所有Q头共享单个KV头

- **完整的VRAM估算**
  - Model Memory = 参数量 × 精度字节数
  - KV Cache = 根据Attention类型使用不同公式
  - System Overhead = Model Memory × 20%
  - Total VRAM = Model Memory + KV Cache + System Overhead

- **GPU数据库集成**
  - 集成3000+ GPU数据（来自dbgpu）
  - 模糊搜索功能
  - 自动计算所需GPU数量和负载率

- **可视化展示**
  - 堆叠柱状图显示显存组成
  - Tooltip显示计算公式和详细数值
  - 美观的结果卡片展示

- **量化精度支持**
  - FP16 / BF16 (2 bytes)
  - FP8 (1 byte)
  - INT8 (1 byte)
  - INT4 (0.5 bytes)

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS 4
- **后端**: Express + tRPC
- **数据库**: MySQL (via Drizzle ORM)
- **图表**: Recharts
- **UI组件**: shadcn/ui

## 安装和运行

### 前置要求

- Node.js 22+
- pnpm
- MySQL数据库

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/zihaoli-cn/llm-vram-estimator.git
cd llm-vram-estimator
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
创建`.env`文件并配置以下变量：
```env
DATABASE_URL=mysql://user:password@localhost:3306/vram_estimator
```

4. 初始化数据库
```bash
pnpm db:push
```

5. 导入GPU数据（可选）
```bash
# 安装dbgpu
sudo pip3 install dbgpu

# 导出GPU数据
python3 scripts/export-gpu-data.py

# 导入到数据库
npx tsx scripts/import-gpu-to-db.ts
```

6. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000

## 使用示例

### 1. 使用ModelScope搜索

输入模型名称，例如：`deepseek-ai/DeepSeek-R1-Distill-Llama-70B`

### 2. 配置推理参数

- 选择量化精度（如INT4）
- 设置并发用户数（batch size）
- 设置序列长度
- 选择GPU型号

### 3. 查看估算结果

系统会自动计算：
- 总预估显存
- 所需GPU数量
- 单卡平均负载率
- 显存组成详情（Model Memory、KV Cache、System Overhead）

## 项目结构

```
vram-estimator/
├── client/              # 前端代码
│   └── src/
│       ├── components/  # React组件
│       ├── pages/       # 页面
│       └── lib/         # 工具函数
├── server/              # 后端代码
│   ├── routers.ts       # tRPC路由
│   └── db.ts            # 数据库查询
├── shared/              # 共享代码
│   ├── vram-calculator.ts  # 核心估算逻辑
│   └── config-parser.ts    # 配置解析
├── drizzle/             # 数据库schema
└── scripts/             # 工具脚本
```

## 核心算法

### Model Memory
```
Model Memory = Total Parameters × Precision (bytes)
```

### KV Cache

**MHA (Multi-Head Attention)**:
```
kv_cache_size = 2 × batch_size × seq_len × num_layers × 
                (num_attention_heads × head_dim) × dtype_bytes
```

**GQA (Grouped Query Attention)**:
```
kv_cache_size = 2 × batch_size × seq_len × num_layers × 
                (num_kv_heads × head_dim) × dtype_bytes
```

**MQA (Multi-Query Attention)**:
```
kv_cache_size = 2 × batch_size × seq_len × num_layers × 
                (1 × head_dim) × dtype_bytes
```

### System Overhead
```
System Overhead = Model Memory × 0.2
```

### Total VRAM
```
Total VRAM = Model Memory + KV Cache + System Overhead
```

## 测试

项目包含完整的测试报告，详见 `TESTING_REPORT.md`

运行测试：
```bash
pnpm test
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 作者

Developed with ❤️ by AI Assistant

## 致谢

- GPU数据来源：[dbgpu](https://github.com/painebenjamin/dbgpu)
- UI组件：[shadcn/ui](https://ui.shadcn.com/)
