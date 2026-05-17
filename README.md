# 忆眸 Memento · UI 原型

AI 辅助 Vlog 剪辑应用的界面与交互原型，按团队预设目录组织。

## 目录结构

```
src/
├── pages/                 # 页面原型
│   ├── HomePage/          # 首页
│   ├── EditorPage/        # 智能剪辑（vlog 剪辑）
│   └── CompletePage/      # 创作完成
├── components/            # 可复用组件
│   ├── Button/
│   ├── Card/
│   ├── MemoryCard/
│   ├── StyleCard/
│   ├── GuideTip/          # 导拍提示框（供导拍页使用）
│   ├── BottomNav/
│   ├── PageShell/
│   └── editor/            # 剪辑页专用组件
├── assets/
│   ├── styles/            # 配色、字体、动画、基础样式
│   ├── images/            # 静态图片资源
│   └── iconfont/          # 图标字体（待接入）
├── data/                  # 演示数据
├── hooks/
└── utils/
```

## 页面路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/editor` | 智能剪辑 |
| `/complete` | 创作完成 |

首页「开始智能创作」→ 剪辑页；剪辑页「导出」→ 完成页；完成页「继续剪辑」→ 剪辑页。

## 本地运行

```bash
cd memento-editor
npm install
npm run dev
```

## 设计规范

见 `src/assets/styles/variables.css`。

| 用途 | 色值 |
|------|------|
| 主色蓝 | `#5E7CE0` |
| 暖色橙 | `#FFB357` |
| 背景 | `#F7F9FC` |
| 主文字 | `#2C3E50` |

## 待实现页面

- vlog 类型选择页
- AI 导拍页
- 视频生成页
- 视频预览页
