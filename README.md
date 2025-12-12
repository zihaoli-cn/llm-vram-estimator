# LLM VRAM Estimator Web

一个简洁精美的大语言模型显存估算Web应用，基于 `llm-vram-estimator-core` 核心库构建。

## 功能特性

- **核心估算**：精确计算 Model Memory、KV Cache 和 System Overhead。
- **多种模型支持**：支持手动输入参数或从 HuggingFace / ModelScope URL 导入配置。
- **Attention类型自动判断**：自动识别 MHA、GQA、MQA。
- **精美界面**：采用 Neo-Brutalism / Tech-Utilitarian 设计风格，提供专业工具的使用体验。
- **实时可视化**：直观的柱状图和数据展示。

## 技术栈

- **前端**：React 19, Tailwind CSS 4, shadcn/ui, Recharts
- **后端**：Express (用于代理配置请求)
- **核心库**：llm-vram-estimator-core (TypeScript)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 项目结构

```
llm-vram-estimator-web/
├── client/
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── lib/
│   │   │   └── core/      # 核心计算库
│   │   ├── pages/         # 页面组件
│   │   └── index.css      # 全局样式 (Neo-Brutalism Theme)
├── server/                # Express后端
└── package.json
```

## 设计风格

本项目采用 **Neo-Brutalism / Tech-Utilitarian** 设计风格：
- **高对比度**：深色背景搭配电光绿强调色。
- **模块化**：Bento Grid 布局。
- **技术感**：等宽字体、粗边框、硬阴影。

## 许可证

MIT License
