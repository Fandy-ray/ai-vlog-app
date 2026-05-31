/** 剪辑页 Toast 文案（集中维护，避免编码损坏） */
export const editorToasts = {
  importVideoOnly: '请选择 mp4 / mov 等视频文件',
  importSuccess: (n: number) => `已导入 ${n} 个视频片段`,
  importFailed: '导入失败，请换文件后重试',
  cropApplied: '裁剪已应用',
  splitNeedPlayhead: '请将播放指针移到选中片段内再分割',
  splitDone: '已分割片段',
  deleteNeedOne: '至少保留一段视频',
  deleteDone: '已删除片段',
  clipboardEmpty: '剪贴板为空，请先复制',
  pasted: '已粘贴',
  copied: '已复制',
  cutDone: '已剪切到剪贴板',
  deleted: '已删除',
  bgmCopied: '已复制配乐设置',
  bgmClosed: '已关闭配乐',
  featureDev: (label: string) => `${label} 功能开发中`,
  effectOff: '已关闭特效',
  effectOn: (name: string) => `已应用特效：${name}`,
  filterOff: '已移除滤镜',
  filterOn: (name: string, intensity: number) =>
    `已应用${name}滤镜 · 强度 ${intensity}%`,
  stickerOn: (name: string) => `已添加贴纸：${name}`,
  textSaved: '文字已保存',
  exportNeedProject: '请先导入视频素材',
  exportNeedLocal: '导出需要本地导入的视频片段',
  exportNeedLocalCollab:
    '视频尚未同步完成，请等待创建者上传完毕或稍后重试',
  exportNeedLocalCollabOwner:
    '正在上传视频到协作空间，请稍候再导出',
  collabVideoAttached: (n: number) => `已为 ${n} 个片段绑定本地视频，可以导出了`,
  collabVideoSyncing: '正在同步视频到协作空间…',
  collabVideoSynced: (n: number) => `已同步 ${n} 个视频片段，协作者可直接导出`,
  collabVideoSyncFailed: '视频同步失败，请确认后端已启动并重试',
  exportDone: '导出完成，已存入记忆花园',
  exportFailed: '导出失败',
  exportMemHint: '，可尝试缩短时长或降低分辨率',
  titleUpdated: '标题已更新',
  undo: '已撤销',
  redo: '已重做',
  narrationOn: '旁白已开启',
  narrationOff: '旁白已关闭',
  audioSaved: '音频设置已保存',
  transitionNeedClips: '至少需要两段视频才能设置转场',
  transitionNeedTarget:
    '转场请说明衔接点秒数（须对准两段的交界），或说「第1和第2个片段之间加叠化」',
  transitionJoinInvalid: (from: number, to: number) =>
    `片段 ${from} 与 ${to} 不是相邻两段，请说「第${from}和第${from + 1}个片段之间」`,
  transitionJoinOutOfRange: (label: string) =>
    `未找到 ${label} 的衔接处，请检查片段数量`,
  transitionTimeNotJoin: (at: number, joinHint: string) =>
    `第 ${Math.round(at)} 秒不是片段衔接处。当前衔接点：${joinHint}`,
  transitionOff: '已移除转场',
  transitionOn: (label: string, kind: string, duration: number) =>
    `已设置 ${label}：${kind} · ${duration.toFixed(1)} 秒`,
} as const
