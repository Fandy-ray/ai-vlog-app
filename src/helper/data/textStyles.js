export function createDefaultTextOverlay(content = '输入文字') {
  return {
    content,
    color: '#FFFFFF',
    fontId: 'noto',
    x: 50,
    y: 38,
    width: 42,
    height: 14,
    rotation: 0,
    backgroundColor: '#000000',
    backgroundOpacity: 0
  }
}

export default {
  createDefaultTextOverlay
}
