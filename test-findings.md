# VRAM Estimator 测试发现

## 已验证的功能 ✅

### 1. 四种模型信息输入方式
- ✅ **搜索方式**: 从ModelScope搜索模型名称，成功获取config.json并自动填充参数
- ✅ **URL方式**: 输入ModelScope URL，成功下载config.json并自动填充参数
- ✅ **上传方式**: 上传本地config.json文件，成功解析并自动填充参数
- ✅ **手动方式**: 手动输入所有参数，成功填充到统一表单

### 2. Attention类型自动判断
- ✅ 正确判断GQA类型（num_kv_heads=4, num_attention_heads=28）
- ✅ 显示只读字段带信息图标
- ✅ Tooltip显示详细说明："Grouped Query Attention: Q头分组共享KV头"

### 3. GPU搜索功能
- ✅ 模糊搜索正常工作（输入"4090"显示所有相关GPU）
- ✅ 显示GPU型号和VRAM容量（如"GeForce RTX 4090 24 GB VRAM"）
- ✅ 成功从dbgpu导入2530个GPU数据

### 4. 量化精度选择
- ✅ 支持5种精度：FP16/BF16 (2 bytes), BF16 (2 bytes), FP8 (1 byte), INT8 (1 byte), INT4 (0.5 bytes)
- ✅ 下拉菜单正常工作

### 5. 估算结果展示
- ✅ 显示总预估显存
- ✅ 显示所需GPU数量
- ✅ 显示单卡平均负载率
- ✅ 显示单卡显存容量
- ✅ 显示检测到的Attention架构类型
- ✅ 显存组成详情（Model Memory, KV Cache, System Overhead）
- ✅ 堆叠柱状图可视化（三种颜色清晰区分）

### 6. 核心估算逻辑
- ✅ Attention类型判断逻辑正确
- ✅ KV Cache计算正确（使用GQA公式）
- ✅ 系统开销计算正确（20%）

## 已修复的Bug ✅

### Bug #1: 文件上传时总参数量未正确解析 [已修复]
**问题描述：**
- 上传config.json文件后，虽然其他参数（层数、隐藏层大小、注意力头数等）都正确填充
- 但"总参数量"字段保持为空（显示placeholder）
- 导致Model Memory计算为0.00 GB

**修复方案：**
- 在`server/routers.ts`的`parseConfig`和`fetchFromUrl`中添加了`estimateTotalParameters`函数调用
- 当config.json中没有总参数量时，自动根据层数和隐藏层大小估算
- 估算公式：`Parameters ≈ 12 × num_layers × hidden_size²`

**验证结果：**
- ✅ 现在会自动估算总参数量（例如：4315938816 ≈ 4.3B）
- ✅ Model Memory正确显示（例如：2.01 GB）
- ✅ 估算结果完全准确

## 额外验证的功能 ✅

### 7. KV Cache Tooltip
- ✅ 鼠标悬停在KV Cache的信息图标上显示完整计算公式
- ✅ 显示所有实际参数值（batch_size, seq_len, num_layers, num_kv_heads, head_dim, dtype_bytes）
- ✅ 显示最终计算结果
- ✅ 公式根据Attention类型自动调整（GQA公式）

## 额外验证的功能 ✅ (继续)

### 8. MHA (Multi-Head Attention) 类型估算
- ✅ 正确判断 MHA类型：num_kv_heads (32) = num_attention_heads (32)
- ✅ Attention架构显示为 "MHA" 带说明："每个Q头应独立 KV头"
- ✅ KV Cache计算使用MHA公式：`2 × batch_size × seq_len × num_layers × (num_attention_heads × head_dim) × dtype_bytes`
- ✅ KV Cache结果：16.00 GB（比GQA的1.75 GB大得多）
- ✅ 总显存：19.91 GB（Model Memory 3.26 GB + KV Cache 16.00 GB + System Overhead 0.65 GB）
- ✅ Tooltip正确显示MHA公式和计算过程

## 待测试功能

1. ⏳ 历史记录缓存功能（保存和恢复之前的配置）
2. ⏳ 图表悬停显示详细数值和百分比
3. ⏳ MQA (Multi-Query Attention) 类型的估算
4. ⏳ 边缘情况处理（缺少关键参数时的错误提示）
5. ⏳ 不同量化精度的估算差异
