import { readFileSync, writeFileSync } from 'fs'

const path = new URL('../src/pages/EditorPage/EditorPage.tsx', import.meta.url)
let s = readFileSync(path, 'utf8')

if (!s.includes('editorToasts')) {
  s = s.replace(
    "import { usePlayback } from '@/hooks/usePlayback'",
    "import { editorToasts } from '@/constants/editorToasts'\nimport { usePlayback } from '@/hooks/usePlayback'",
  )
}

const reps = [
  ["show('????????????')", 'show(editorToasts.clipboardEmpty)'],
  ["show('???????')", 'show(editorToasts.cutDone)'],
  ["show('???????????????')", 'show(editorToasts.bgmCopied)'],
  ["show('???')", 'show(editorToasts.deleted)'],
  ["show('?????')", 'show(editorToasts.pasted)'],
  [
    "if (draftEffectId === 'none') {\n      show('?????')",
    "if (draftEffectId === 'none') {\n      show(editorToasts.effectOff)",
  ],
  [
    "show(`??????${name}`)",
    'show(editorToasts.effectOn(name))',
  ],
  [
    "if (draftFilterId === 'none') {\n      show('?????')",
    "if (draftFilterId === 'none') {\n      show(editorToasts.filterOff)",
  ],
  [
    /show\(`[^`]*\$\{name\}[^`]*\$\{draftIntensity\}[^`]*`\)/,
    'show(editorToasts.filterOn(name, draftIntensity))',
  ],
  [
    "const name = getStickerPreset(draftSticker.stickerId)?.name ?? '??'",
    "const name = getStickerPreset(draftSticker.stickerId)?.name ?? '贴纸'",
  ],
  ['show(`???${name}`)', 'show(editorToasts.stickerOn(name))'],
  ["show('???')\n  }\n\n\n  const buildExportSnapshot", "show(editorToasts.textSaved)\n  }\n\n\n  const buildExportSnapshot"],
  ["show('????????')", 'show(editorToasts.exportNeedProject)'],
  ["show('?????????????')", 'show(editorToasts.exportNeedLocal)'],
  ["show('???')\n      navigate('/complete')", "show(editorToasts.exportDone)\n      navigate('/complete')"],
  ["show((msg || '????') + hint)", "show((msg || editorToasts.exportFailed) + hint)"],
  [
    "msg.includes('??') || msg.includes('Memory')",
    "msg.includes('内存') || msg.includes('Memory')",
  ],
  [
    "? '???????????? 1?2 ????'",
    "? editorToasts.exportMemHint",
  ],
  ["show('???')\n      }\n      setIsEditingTitle(false)", "show(editorToasts.titleUpdated)\n      }\n      setIsEditingTitle(false)"],
  ["show('???')\n  }, [canUndo", "show(editorToasts.undo)\n  }, [canUndo"],
  ["show('???')\n  }, [canRedo", "show(editorToasts.redo)\n  }, [canRedo"],
]

for (const item of reps) {
  const [from, to] = item
  if (from instanceof RegExp) {
    s = s.replace(from, to)
  } else if (s.includes(from)) {
    s = s.split(from).join(to)
  } else {
    console.warn('skip:', String(from).slice(0, 50))
  }
}

writeFileSync(path, s, 'utf8')
console.log('done')
