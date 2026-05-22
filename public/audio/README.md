# 本地配乐目录 · 获取与维护指南

## 已内置 6 首 Mixkit 精选

项目已通过脚本下载并登记（旅行 / 日常 / 安静 / 都市 / 卡点 / 电影感）：

- 6 首 MP3 **随仓库一起提交**，队友 `git clone` 后无需再下载即可试听  
- `npm run audio:fetch` — 仅当缺失 MP3 或需要重新拉取时使用  
- 曲目登记在 `src/data/audioLibrary.ts` → `CURATED_LOCAL`

## 手动扩充（可选）

1. **下载** — [Mixkit](https://mixkit.co/free-stock-music/) 或按场景矩阵继续下  
2. **登记** — 在 `CURATED_LOCAL` 追加条目，`previewUrl: '/audio/文件名.mp3'`  
3. **验证** — `npm run dev` → 音频面板试听 / 智能推荐

---

当前编辑器里的 **SoundHelix 曲目仅适合开发调试**（听感一般）。  
界面在「有精选曲」后会默认只显示精选库。

## 一、去哪里找合适且多样的音乐？

优先选 **明确允许在视频/Vlog 中使用** 的免版权站，按分类浏览，而不是随机示例链接。

| 来源 | 授权 | 风格分类 | 适合 |
|------|------|----------|------|
| [Mixkit Music](https://mixkit.co/free-stock-music/) | Mixkit License，免费用于视频 | 有 Happy / Ambient / Hip-hop 等 | **首选**，分类清晰 |
| [Pixabay Music](https://pixabay.com/music/) | Pixabay License | 按情绪、流派筛选 | 量大，需试听筛选 |
| [YouTube Audio Library](https://studio.youtube.com/) | 需登录 Google，按授权类型筛选 | 有氛围、电子、民谣等 | 质量稳定，注意部分需署名 |
| [Free Music Archive](https://freemusicarchive.org/) | 各曲 CC 协议不同 | 流派多 | 注意看清 CC-BY 是否署名 |
| [Uppbeat](https://uppbeat.io/) | 免费档有配额 | 偏 Vlog/创作者 | 需注册 |

**不建议**：SoundHelix 示例、无授权的网易云/QQ 下载、随机网盘 MP3。

## 二、怎样保证「多样」？

不要连续下载同一类，按 **场景矩阵** 各挑 1～2 首（先凑 12～20 首即可）：

| 场景 / 情绪 | 建议标签 mood | 建议 tags | 数量 |
|-------------|---------------|-----------|------|
| 日常 vlog | 轻松、治愈 | 日常、生活、vlog | 2 |
| 旅行 / 户外 | 清新、自由 | 旅行、海边、公路 | 2 |
| 都市 / 街拍 | 活力、都市 | 都市、夜景、节奏 | 2 |
| 安静 / 治愈 | 安静、治愈 | 咖啡、室内、慢生活 | 2 |
| 温暖 / 回忆 | 温暖、治愈 | 黄昏、胶片、回忆 | 2 |
| 雨天 / 情绪 | 安静、情绪 | 雨天、室内 | 1 |
| 轻快 / 卡点 | 活力、轻松 | 节奏、快剪 | 2 |
| 夜晚 | 浪漫、安静 | 夜晚、星空 | 1 |

下载时在站内就用相近关键词搜（如 "travel acoustic"、"calm lofi"），减少标签和听感脱节。

## 三、接入项目的步骤（与现有方式相同）

1. 从上述网站 **下载 MP3** 到本目录，例如：`travel-acoustic-01.mp3`
2. **完整试听**，确认适合 Vlog 配乐（不要太抢人声、不要突兀收尾）
3. 打开 `src/data/audioLibrary.ts`，在 **`CURATED_LOCAL`** 数组追加：

```ts
{
  id: 'travel-acoustic-01',
  name: '清晨公路',
  artist: 'Mixkit', // 或作者名，便于署名
  duration: '02:30',
  tags: ['旅行', '公路', '清新', 'vlog'],
  mood: ['清新', '自由'],
  bpm: 95,
  scene: '旅行',
  previewUrl: '/audio/travel-acoustic-01.mp3',
  coverFrom: '#B8E8FF',
  coverTo: '#5E7CE0',
  source: 'curated',
},
```

4. 保存后刷新页面 → 搜索 / 列表 / **智能推荐** 都会包含新曲（`source: 'curated'` 在推荐里会优先）

## 四、标签怎么写才准？

1. 以 **听感为准**，不要照抄网站英文标题
2. `bpm` 可粗略估计：慢歌 60–85，中速 85–110，轻快 110–130
3. 同一首歌只对应 **一个** `previewUrl`，不要复用 SoundHelix 链接冒充风格

## 五、版权与比赛提交

- 保留每首歌的来源页面或 License 截图
- CC-BY 类需在成片或说明里 **署名作者**
- Mixkit / Pixabay 一般可免费用于视频项目，仍以当时页面条款为准

## 六、可选：隐藏示例曲（仅展示精选库）

若已凑够 `CURATED_LOCAL`，可在 `audioLibrary.ts` 把导出改为：

```ts
export const NETWORK_AUDIOS = [...CURATED_LOCAL, ...SOUNDHELIX_DEMOS]
// 或仅：export const NETWORK_AUDIOS = CURATED_LOCAL
```

并在音频面板搜索时默认只显示 `source !== 'soundhelix-demo'`（需改前端筛选，可按需实现）。

---

**结论**：好听多样的曲库 = **免版权站按矩阵下载 + 放入 `public/audio/` + 试听后记准标签**。  
没有「一键接入网易云」的捷径；自建 15～20 首精选通常 1～2 小时就能明显改善体验。
