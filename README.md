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
npm install
npm run dev
```

图片生成、旁白和导出接口由 `backend` 服务提供。首次运行服务端前，创建仅本地使用的配置文件并填写 vivo AIGC 凭证：

```powershell
Copy-Item backend/.env.example backend/.env
cd backend
npm install
npm run dev
```

另开终端在项目根目录运行 `npm run dev`。开发服务器会将 `/api` 与 `/uploads` 代理到后端。

## 魔法涂鸦

剪辑页的「魔法涂鸦」支持：

- `贴纸`：将手绘图层或文本描述发送至图片生成接口，并作为可移动贴纸叠加到时间轴。
- `动态绘画`：直接在视频上用鼠标绘制，记录笔画过程并在回放/导出中逐笔呈现，绘制完成后自动淡出。
- `风格`：使用当前帧与涂鸦作为参考，生成单帧风格化画面。

服务端通过 `POST /api/doodle/generate` 代理调用 vivo `image_generation`，密钥仅从 `backend/.env` 的 `VIVO_AIGC_APP_KEY` 读取。当前没有向上游发送 `mask`，因此不提供仅修改指定涂抹区域的精确消除或扩图。

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
