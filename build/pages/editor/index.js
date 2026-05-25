(function(){
    
    var createPageHandler = function() {
      return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/editor/index.ux?uxType=page":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/editor/index.ux?uxType=page ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _routes = _interopRequireDefault(__webpack_require__(/*! ../../helper/routes */ "./src/helper/routes.js"));
var _utils = _interopRequireDefault(__webpack_require__(/*! ../../helper/utils */ "./src/helper/utils.js"));
var _formatTime = __webpack_require__(/*! ../../helper/formatTime */ "./src/helper/formatTime.js");
var _editorPresets = __webpack_require__(/*! ../../helper/data/editorPresets */ "./src/helper/data/editorPresets.js");
var _audioLibrary = __webpack_require__(/*! ../../helper/data/audioLibrary */ "./src/helper/data/audioLibrary.js");
var _mockProject = __webpack_require__(/*! ../../helper/data/mockProject */ "./src/helper/data/mockProject.js");
var _stickers = __webpack_require__(/*! ../../helper/data/stickers */ "./src/helper/data/stickers.js");
var _textStyles = __webpack_require__(/*! ../../helper/data/textStyles */ "./src/helper/data/textStyles.js");
var _sessionAdapter = __webpack_require__(/*! ../../helper/export/sessionAdapter */ "./src/helper/export/sessionAdapter.js");
var _deviceExport = __webpack_require__(/*! ../../helper/export/deviceExport */ "./src/helper/export/deviceExport.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports.default = {
  private: {
    clips: [],
    projectDuration: _mockProject.PROJECT_DURATION,
    session: {},
    activeClipIndex: 0,
    currentTime: 0,
    isPlaying: false,
    activeTool: 'cut',
    panelVisible: false,
    panelTitle: '',
    tools: _editorPresets.EDITOR_TOOLS,
    filterPresets: _editorPresets.FILTER_PRESETS,
    effectPresets: _editorPresets.EFFECT_PRESETS,
    textPresets: _editorPresets.TEXT_PRESETS,
    bgmList: _audioLibrary.NETWORK_AUDIOS,
    stickerPresets: _stickers.STICKER_PRESETS,
    draftSticker: null,
    previewStickers: [],
    previewText: '',
    previewPoster: '',
    previewVideoSrc: '',
    filterOverlay: 'rgba(0,0,0,0)',
    filterOpacity: 0,
    effectOverlay: 'rgba(0,0,0,0)',
    effectVisible: false,
    exporting: false,
    exportCancelled: false,
    exportMessage: '正在导出…',
    exportProgress: 0,
    playTimer: null
  },
  onInit() {
    if (!$editorStore.hasEditorProject()) {
      _routes.default.replace('create');
      return;
    }
    const project = $editorStore.getEditorProject();
    this.clips = project.clips;
    this.projectDuration = project.duration;
    this.session = (0, _sessionAdapter.normalizeSession)($editorStore.getEditorSession());
    $editorStore.setEditorSession(this.session);
    this.syncPreview();
  },
  onShow() {
    this.syncPreview();
  },
  onDestroy() {
    this.stopPlayback();
  },
  syncPreview() {
    const info = $editorStore.getClipAtTime(this.clips, this.currentTime);
    const clip = info.clip || this.clips[0];
    this.activeClipIndex = info.index;
    this.previewPoster = clip.poster || clip.thumb;
    this.previewVideoSrc = clip.videoSrc || '';
    this.filterOverlay = (0, _editorPresets.getFilterOverlay)(this.session.filterId);
    this.filterOpacity = (this.session.filterIntensity || 100) / 100;
    const effect = (0, _editorPresets.getEffectOverlay)(this.session.effectId || 'none');
    this.effectOverlay = effect;
    this.effectVisible = effect !== 'rgba(0,0,0,0)';
    const text = this.session.textOverlay || null;
    this.previewText = text && text.content ? text.content : this.session.textContent || '';
    this.refreshPreviewStickers();
  },
  refreshPreviewStickers() {
    const list = (this.session.stickerOverlays || []).map(overlay => ({
      overlay,
      editable: false
    }));
    if (this.activeTool === 'sticker' && this.draftSticker) {
      list.push({
        overlay: this.draftSticker,
        editable: true
      });
    }
    this.previewStickers = list;
  },
  goBack() {
    _routes.default.back();
  },
  resolveAttr(evt, key) {
    let target = evt && evt.target;
    while (target) {
      if (target.attr && target.attr[key] !== undefined && target.attr[key] !== '') {
        return target.attr[key];
      }
      target = target.parentElement || target.parent;
    }
    return '';
  },
  onClipSelect(evt) {
    const index = Number(this.resolveAttr(evt, 'index'));
    let start = 0;
    for (let i = 0; i < index; i += 1) {
      start += this.clips[i].duration;
    }
    this.currentTime = start;
    this.stopPlayback();
    this.syncPreview();
  },
  togglePlay() {
    if (this.isPlaying) {
      this.stopPlayback();
      return;
    }
    this.isPlaying = true;
    this.playTimer = setInterval(() => {
      const next = this.currentTime + 0.2;
      if (next >= this.projectDuration) {
        this.currentTime = 0;
        this.stopPlayback();
      } else {
        this.currentTime = next;
      }
      this.syncPreview();
    }, 200);
  },
  stopPlayback() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }
  },
  onToolSelect(evt) {
    const id = this.resolveAttr(evt, 'id');
    const label = this.resolveAttr(evt, 'label');
    if (id === 'cut') {
      this.activeTool = 'cut';
      this.panelVisible = false;
      _utils.default.showToast('拖动时间轴或点击片段切换位置');
      return;
    }
    if (id === 'sticker') {
      this.activeTool = 'sticker';
      this.panelVisible = true;
      this.panelTitle = label;
      this.draftSticker = null;
      this.refreshPreviewStickers();
      return;
    }
    this.activeTool = id;
    this.panelVisible = true;
    this.panelTitle = label;
  },
  closePanel() {
    if (this.activeTool === 'sticker') {
      this.draftSticker = null;
    }
    this.panelVisible = false;
    this.activeTool = 'cut';
    this.refreshPreviewStickers();
  },
  confirmPanel() {
    if (this.activeTool === 'sticker' && this.draftSticker) {
      const overlays = (this.session.stickerOverlays || []).slice();
      overlays.push(Object.assign({}, this.draftSticker));
      this.session = Object.assign({}, this.session, {
        stickerOverlays: overlays
      });
      this.draftSticker = null;
    }
    this.session = (0, _sessionAdapter.normalizeSession)(this.session);
    $editorStore.setEditorSession(this.session);
    this.syncPreview();
    this.closePanel();
    _utils.default.showToast('已应用');
  },
  onStickerPick(evt) {
    const stickerId = this.resolveAttr(evt, 'id');
    const count = (this.session.stickerOverlays || []).length;
    this.draftSticker = (0, _stickers.createDefaultStickerOverlay)(stickerId, count);
    this.refreshPreviewStickers();
  },
  removeDraftSticker() {
    this.draftSticker = null;
    this.refreshPreviewStickers();
  },
  onStickerChange(evt) {
    const detail = evt && evt.detail || evt || {};
    if (!this.draftSticker || this.draftSticker.id !== detail.id) {
      return;
    }
    this.draftSticker = Object.assign({}, this.draftSticker, {
      x: detail.x,
      y: detail.y
    });
    this.refreshPreviewStickers();
  },
  onStickerActivate() {
    if (this.activeTool !== 'sticker') {
      this.activeTool = 'sticker';
      this.panelVisible = true;
      this.panelTitle = '贴纸';
    }
  },
  onFilterPick(evt) {
    const id = this.resolveAttr(evt, 'id');
    this.session = Object.assign({}, this.session, {
      filterId: id
    });
    this.syncPreview();
  },
  onEffectPick(evt) {
    const id = this.resolveAttr(evt, 'id');
    this.session = Object.assign({}, this.session, {
      effectId: id
    });
    this.syncPreview();
  },
  onTextPick(evt) {
    const id = this.resolveAttr(evt, 'id');
    const preset = this.textPresets.find(item => item.id === id);
    const content = preset && preset.content ? preset.content : '';
    const textOverlay = content ? (0, _textStyles.createDefaultTextOverlay)(content) : null;
    this.session = Object.assign({}, this.session, {
      textPresetId: id,
      textContent: content,
      textOverlay
    });
    this.syncPreview();
  },
  toggleKeepAudio() {
    this.session = Object.assign({}, this.session, {
      keepOriginalAudio: !this.session.keepOriginalAudio
    });
  },
  onBgmPick(evt) {
    const id = this.resolveAttr(evt, 'id');
    this.session = Object.assign({}, this.session, {
      bgmId: id
    });
  },
  onExport() {
    const hasLocal = this.clips.some(clip => clip.videoSrc);
    if (!hasLocal) {
      _utils.default.showToast('导出需要本地导入的视频素材');
      return;
    }
    if (this.activeTool === 'sticker' && this.draftSticker) {
      this.confirmPanel();
    }
    this.exporting = true;
    this.exportCancelled = false;
    this.exportProgress = 2;
    this.exportMessage = '准备导出…';
    this.stopPlayback();
    const snapshot = (0, _sessionAdapter.normalizeSession)(this.session);
    $editorStore.setEditorSession(snapshot);
    this.session = snapshot;
    (0, _deviceExport.exportEditedVideo)(this.clips, this.projectDuration, snapshot, {
      onProgress: progress => {
        if (this.exportCancelled) {
          return;
        }
        this.exportMessage = progress.message;
        this.exportProgress = Math.round((progress.progress || 0) * 100);
      },
      isCancelled: () => this.exportCancelled
    }).then(result => {
      if (this.exportCancelled) {
        return;
      }
      $editorStore.setExportedVideo({
        title: result.title,
        posterUrl: result.posterUrl,
        duration: result.duration,
        durationLabel: result.durationLabel,
        uri: result.uri,
        mimeType: result.mimeType,
        source: result.source
      });
      this.exporting = false;
      const tip = result.source === 'server' ? '成片已导出（滤镜/贴纸/文字已烧录）' : '已保存本机成片（连接导出服务可完整烧录特效）';
      _utils.default.showToast(tip);
      _routes.default.push('complete');
    }).catch(error => {
      this.exporting = false;
      if (error && error.message === 'cancelled') {
        _utils.default.showToast('已取消导出');
        return;
      }
      _utils.default.showToast(error && error.message || '导出失败，请重试');
    });
  },
  cancelExport() {
    this.exportCancelled = true;
    this.exporting = false;
  }
};
const moduleOwn = exports.default || module.exports;
const accessors = ['public', 'protected', 'private'];
if (moduleOwn.data && accessors.some(function (acc) {
  return moduleOwn[acc];
})) {
  throw new Error('页面VM对象中的属性data不可与"' + accessors.join(',') + '"同时存在，请使用private替换data名称');
} else if (!moduleOwn.data) {
  moduleOwn.data = {};
  moduleOwn._descriptor = {};
  accessors.forEach(function (acc) {
    const accType = typeof moduleOwn[acc];
    if (accType === 'object') {
      moduleOwn.data = Object.assign(moduleOwn.data, moduleOwn[acc]);
      for (const name in moduleOwn[acc]) {
        moduleOwn._descriptor[name] = {
          access: acc
        };
      }
    } else if (accType === 'function') {
      console.warn('页面VM对象中的属性' + acc + '的值不能是函数，请使用对象');
    }
  });
}}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/Button/index.ux?uxType=comp":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/Button/index.ux?uxType=comp ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    text: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '处理中...'
    }
  },
  handleClick() {
    if (this.disabled || this.loading) {
      return;
    }
    this.$emit('click', {});
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/EditorStickerOverlay/index.ux?uxType=comp":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/EditorStickerOverlay/index.ux?uxType=comp ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stickers = __webpack_require__(/*! ../../helper/data/stickers */ "./src/helper/data/stickers.js");
var _default = exports.default = {
  props: {
    overlay: {
      type: Object,
      default: {}
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data: {
    emoji: '✨',
    touchStart: null
  },
  onPropsChange() {
    this.emoji = (0, _stickers.getStickerEmoji)(this.overlay.stickerId);
  },
  onInit() {
    this.emoji = (0, _stickers.getStickerEmoji)(this.overlay.stickerId);
  },
  onTap() {
    this.$emit('activate', {
      id: this.overlay.id
    });
  },
  onTouchStart(evt) {
    if (!this.editable) {
      return;
    }
    const touch = evt.touches && evt.touches[0];
    if (!touch) {
      return;
    }
    this.touchStart = {
      pageX: touch.pageX || touch.clientX || 0,
      pageY: touch.pageY || touch.clientY || 0,
      ox: this.overlay.x,
      oy: this.overlay.y
    };
  },
  onTouchMove(evt) {
    if (!this.editable || !this.touchStart) {
      return;
    }
    const touch = evt.touches && evt.touches[0];
    if (!touch) {
      return;
    }
    const pageX = touch.pageX || touch.clientX || 0;
    const pageY = touch.pageY || touch.clientY || 0;
    const dx = (pageX - this.touchStart.pageX) / 6;
    const dy = (pageY - this.touchStart.pageY) / 6;
    this.$emit('change', {
      id: this.overlay.id,
      x: clamp(this.touchStart.ox + dx, 4, 96),
      y: clamp(this.touchStart.oy + dy, 4, 96)
    });
  },
  onTouchEnd() {
    this.touchStart = null;
    this.$emit('transformend', {
      id: this.overlay.id
    });
  }
};
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/Button/index.ux?uxType=comp":
/*!********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/Button/index.ux?uxType=comp ***!
  \********************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-btn-root": {
    "flexDirection": "column",
    "width": "100%"
  },
  ".c-btn": {
    "height": "72px",
    "marginBottom": "18px",
    "borderRadius": "12px",
    "fontSize": "30px"
  },
  ".c-btn-block": {
    "width": "100%"
  },
  ".c-btn-default": {
    "backgroundColor": "#e9ebee",
    "color": "#111111"
  },
  ".c-btn-primary": {
    "backgroundColor": "#5e7ce0",
    "color": "#ffffff"
  },
  ".c-btn-ghost": {
    "backgroundColor": "#ffffff",
    "color": "#5e7ce0"
  },
  ".c-btn-outline": {
    "backgroundColor": "#ffffff",
    "color": "#2c3e50",
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "#e8ecf2",
    "borderRightColor": "#e8ecf2",
    "borderBottomColor": "#e8ecf2",
    "borderLeftColor": "#e8ecf2"
  },
  ".c-btn-accent": {
    "backgroundColor": "#ffb357",
    "color": "#ffffff"
  },
  ".c-btn-soft": {
    "backgroundColor": "rgba(94,124,224,0.1)",
    "color": "#5e7ce0"
  },
  ".c-btn-danger": {
    "backgroundColor": "#c45c4a",
    "color": "#ffffff"
  },
  ".c-btn-disabled-state": {
    "opacity": 0.45
  },
  ".c-btn-loading-wrap": {
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "center",
    "height": "72px",
    "marginBottom": "18px",
    "borderRadius": "12px",
    "backgroundColor": "#e9ebee"
  },
  ".c-btn-loading-spinner": {
    "width": "32px",
    "height": "32px",
    "borderRadius": "16px",
    "borderTopWidth": "3px",
    "borderRightWidth": "3px",
    "borderBottomWidth": "3px",
    "borderLeftWidth": "3px",
    "borderTopColor": "#5e7ce0",
    "borderRightColor": "#d8dde2",
    "borderBottomColor": "#d8dde2",
    "borderLeftColor": "#d8dde2",
    "marginRight": "12px",
    "animationName": "animSpin",
    "animationDuration": "800ms",
    "animationIterationCount": -1
  },
  ".c-btn-loading-text": {
    "fontSize": "28px",
    "color": "#8b9097"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/EditorStickerOverlay/index.ux?uxType=comp":
/*!**********************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/EditorStickerOverlay/index.ux?uxType=comp ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".editor-sticker": {
    "position": "absolute",
    "alignItems": "center",
    "justifyContent": "center"
  },
  ".editor-sticker-editable": {
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "rgba(255,255,255,0.45)",
    "borderRightColor": "rgba(255,255,255,0.45)",
    "borderBottomColor": "rgba(255,255,255,0.45)",
    "borderLeftColor": "rgba(255,255,255,0.45)",
    "borderStyle": "dashed"
  },
  ".editor-sticker-emoji": {
    "fontSize": "48px",
    "textAlign": "center"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/editor/index.ux?uxType=page":
/*!***************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/editor/index.ux?uxType=page ***!
  \***************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".web-header": {
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "paddingTop": "24px",
    "paddingRight": "32px",
    "paddingBottom": "20px",
    "paddingLeft": "32px",
    "backgroundColor": "rgba(247,249,252,0.92)"
  },
  ".web-brand-row": {
    "flexDirection": "row",
    "alignItems": "center"
  },
  ".web-brand-icon": {
    "width": "64px",
    "height": "64px",
    "borderRadius": "24px",
    "backgroundColor": "rgba(94,124,224,0.1)",
    "color": "#5e7ce0",
    "fontSize": "32px",
    "textAlign": "center",
    "paddingTop": "10px",
    "marginRight": "16px"
  },
  ".web-brand-title": {
    "fontSize": "36px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".web-icon-btn": {
    "width": "72px",
    "height": "72px",
    "borderRadius": "36px",
    "textAlign": "center",
    "fontSize": "36px",
    "color": "#5b6b7f",
    "paddingTop": "12px"
  },
  ".web-scroll": {
    "flex": 1,
    "flexDirection": "column",
    "paddingTop": "0px",
    "paddingRight": "32px",
    "paddingBottom": "100px",
    "paddingLeft": "32px"
  },
  ".web-hero-stack": {
    "width": "100%",
    "height": "386px",
    "borderRadius": "20px",
    "overflow": "hidden"
  },
  ".web-hero": {
    "width": "100%",
    "height": "100%",
    "objectFit": "cover"
  },
  ".web-hero-mask": {
    "position": "absolute",
    "left": "0px",
    "right": "0px",
    "bottom": "0px",
    "height": "65%",
    "background": "{\"values\":[{\"type\":\"linearGradient\",\"directions\":[\"to\",\"top\"],\"values\":[\"rgba(94,124,224,0.82)\",\"rgba(94,124,224,0.3)\",\"rgba(0,0,0,0)\"]}]}"
  },
  ".web-hero-content": {
    "position": "absolute",
    "left": "0px",
    "right": "0px",
    "bottom": "0px",
    "paddingTop": "40px",
    "paddingRight": "40px",
    "paddingBottom": "40px",
    "paddingLeft": "40px",
    "flexDirection": "column"
  },
  ".web-hero-badge": {
    "alignSelf": "flex-start",
    "paddingTop": "8px",
    "paddingRight": "20px",
    "paddingBottom": "8px",
    "paddingLeft": "20px",
    "borderRadius": "40px",
    "backgroundColor": "rgba(255,255,255,0.2)",
    "color": "#ffffff",
    "fontSize": "20px",
    "marginBottom": "16px"
  },
  ".web-hero-title": {
    "fontSize": "40px",
    "fontWeight": "bold",
    "color": "#ffffff"
  },
  ".web-hero-sub": {
    "fontSize": "28px",
    "color": "rgba(255,255,255,0.85)",
    "marginTop": "8px"
  },
  ".web-learn-card": {
    "flexDirection": "row",
    "alignItems": "center",
    "minHeight": "152px",
    "paddingTop": "36px",
    "paddingRight": "32px",
    "paddingBottom": "36px",
    "paddingLeft": "32px",
    "borderRadius": "20px",
    "backgroundColor": "#ffffff"
  },
  ".web-learn-icon": {
    "width": "96px",
    "height": "96px",
    "borderRadius": "24px",
    "backgroundColor": "rgba(255,179,87,0.15)",
    "color": "#ffb357",
    "fontSize": "44px",
    "textAlign": "center",
    "paddingTop": "20px",
    "marginRight": "24px"
  },
  ".web-learn-main": {
    "flex": 1,
    "flexDirection": "column"
  },
  ".web-learn-title-row": {
    "flexDirection": "row",
    "alignItems": "center"
  },
  ".web-learn-title": {
    "fontSize": "28px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".web-learn-tag": {
    "marginLeft": "12px",
    "paddingTop": "4px",
    "paddingRight": "12px",
    "paddingBottom": "4px",
    "paddingLeft": "12px",
    "borderRadius": "20px",
    "backgroundColor": "rgba(94,124,224,0.1)",
    "color": "#5e7ce0",
    "fontSize": "18px"
  },
  ".web-learn-desc": {
    "fontSize": "24px",
    "color": "#8b9097",
    "marginTop": "4px"
  },
  ".web-learn-arrow": {
    "fontSize": "32px",
    "color": "#8b9097",
    "paddingLeft": "8px"
  },
  ".web-section-head": {
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "width": "100%"
  },
  ".web-section-title": {
    "fontSize": "32px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "flex": 1
  },
  ".web-section-link": {
    "fontSize": "24px",
    "color": "#8b9097",
    "textAlign": "right",
    "paddingLeft": "16px"
  },
  ".web-memory-grid": {
    "flexDirection": "row",
    "flexWrap": "wrap",
    "justifyContent": "space-between",
    "alignContent": "flex-start",
    "width": "100%"
  },
  ".web-flow-card": {
    "paddingTop": "24px",
    "paddingRight": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "borderRadius": "16px",
    "backgroundColor": "#ffffff",
    "marginTop": "20px",
    "marginBottom": "24px",
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "#e8ecf2",
    "borderRightColor": "#e8ecf2",
    "borderBottomColor": "#e8ecf2",
    "borderLeftColor": "#e8ecf2"
  },
  ".web-flow-title": {
    "fontSize": "28px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "marginBottom": "8px"
  },
  ".web-flow-desc": {
    "fontSize": "22px",
    "color": "#8b9097",
    "marginBottom": "16px"
  },
  ".web-flow-actions": {
    "flexDirection": "row",
    "flexWrap": "wrap"
  },
  ".web-flow-chip": {
    "paddingTop": "10px",
    "paddingRight": "18px",
    "paddingBottom": "10px",
    "paddingLeft": "18px",
    "marginRight": "12px",
    "marginBottom": "10px",
    "borderRadius": "20px",
    "backgroundColor": "rgba(94,124,224,0.1)",
    "color": "#5e7ce0",
    "fontSize": "22px"
  },
  ".web-page-with-nav": {
    "flexDirection": "column",
    "flex": 1,
    "backgroundColor": "#f7f9fc"
  },
  ".web-page-body": {
    "flex": 1,
    "flexDirection": "column",
    "paddingTop": "0px",
    "paddingRight": "32px",
    "paddingBottom": "24px",
    "paddingLeft": "32px"
  },
  ".web-sticky-header": {
    "flexDirection": "row",
    "alignItems": "center",
    "paddingTop": "20px",
    "paddingRight": "32px",
    "paddingBottom": "16px",
    "paddingLeft": "32px",
    "backgroundColor": "rgba(247,249,252,0.92)"
  },
  ".web-sticky-header-center": {
    "flex": 1,
    "textAlign": "center"
  },
  ".web-back-btn": {
    "width": "64px",
    "height": "64px",
    "borderRadius": "32px",
    "textAlign": "center",
    "fontSize": "36px",
    "color": "#5b6b7f",
    "paddingTop": "8px"
  },
  ".web-header-title": {
    "fontSize": "34px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".web-header-sub": {
    "fontSize": "22px",
    "color": "#8b9097",
    "marginTop": "4px"
  },
  ".web-upload-zone": {
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "paddingTop": "48px",
    "paddingRight": "32px",
    "paddingBottom": "48px",
    "paddingLeft": "32px",
    "marginBottom": "24px",
    "borderRadius": "20px",
    "borderTopWidth": "2px",
    "borderRightWidth": "2px",
    "borderBottomWidth": "2px",
    "borderLeftWidth": "2px",
    "borderStyle": "dashed",
    "borderTopColor": "rgba(94,124,224,0.35)",
    "borderRightColor": "rgba(94,124,224,0.35)",
    "borderBottomColor": "rgba(94,124,224,0.35)",
    "borderLeftColor": "rgba(94,124,224,0.35)",
    "backgroundColor": "#ffffff"
  },
  ".web-upload-icon": {
    "width": "96px",
    "height": "96px",
    "borderRadius": "20px",
    "backgroundColor": "rgba(94,124,224,0.1)",
    "color": "#5e7ce0",
    "fontSize": "44px",
    "textAlign": "center",
    "paddingTop": "18px",
    "marginBottom": "16px"
  },
  ".web-upload-title": {
    "fontSize": "30px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".web-upload-hint": {
    "fontSize": "24px",
    "color": "#8b9097",
    "marginTop": "8px",
    "textAlign": "center"
  },
  ".web-import-row": {
    "flexDirection": "row",
    "alignItems": "center",
    "paddingTop": "20px",
    "paddingRight": "20px",
    "paddingBottom": "20px",
    "paddingLeft": "20px",
    "marginBottom": "16px",
    "borderRadius": "16px",
    "backgroundColor": "#ffffff"
  },
  ".web-import-thumb": {
    "width": "160px",
    "height": "108px",
    "borderRadius": "12px",
    "marginRight": "20px",
    "objectFit": "cover"
  },
  ".web-import-main": {
    "flex": 1,
    "flexDirection": "column"
  },
  ".web-import-name": {
    "fontSize": "26px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "lines": 1,
    "textOverflow": "ellipsis"
  },
  ".web-import-meta": {
    "fontSize": "22px",
    "color": "#8b9097",
    "marginTop": "6px"
  },
  ".web-import-remove": {
    "width": "56px",
    "height": "56px",
    "textAlign": "center",
    "fontSize": "28px",
    "color": "#8b9097",
    "paddingTop": "8px"
  },
  ".web-vlog-tip-card": {
    "flexDirection": "row",
    "paddingTop": "24px",
    "paddingRight": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "borderRadius": "20px",
    "background": "{\"values\":[{\"type\":\"linearGradient\",\"directions\":[\"135deg\"],\"values\":[\"rgba(94,124,224,0.1)\",\"#ffffff\",\"rgba(255,179,87,0.1)\"]}]}",
    "marginBottom": "24px"
  },
  ".web-scene-row": {
    "flexDirection": "row",
    "paddingTop": "0px",
    "paddingRight": "32px",
    "paddingBottom": "12px",
    "paddingLeft": "32px"
  },
  ".web-scene-chip": {
    "width": "296px",
    "height": "160px",
    "paddingTop": "20px",
    "paddingRight": "20px",
    "paddingBottom": "20px",
    "paddingLeft": "20px",
    "marginRight": "16px",
    "borderRadius": "16px",
    "backgroundColor": "#ffffff",
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "#e8ecf2",
    "borderRightColor": "#e8ecf2",
    "borderBottomColor": "#e8ecf2",
    "borderLeftColor": "#e8ecf2",
    "flexDirection": "column",
    "flexShrink": 0
  },
  ".web-scene-chip-active": {
    "backgroundColor": "#5e7ce0",
    "borderTopColor": "#5e7ce0",
    "borderRightColor": "#5e7ce0",
    "borderBottomColor": "#5e7ce0",
    "borderLeftColor": "#5e7ce0"
  },
  ".web-scene-chip-title": {
    "fontSize": "26px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".web-scene-chip-active .web-scene-chip-title": {
    "color": "#ffffff",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-scene-chip-active"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-scene-chip-title"
        }
      ]
    }
  },
  ".web-scene-chip-sub": {
    "fontSize": "20px",
    "color": "#8b9097",
    "marginTop": "8px",
    "lines": 2,
    "textOverflow": "ellipsis"
  },
  ".web-scene-chip-active .web-scene-chip-sub": {
    "color": "rgba(255,255,255,0.85)",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-scene-chip-active"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-scene-chip-sub"
        }
      ]
    }
  },
  ".web-detail-card": {
    "paddingTop": "24px",
    "paddingRight": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "marginTop": "0px",
    "marginRight": "32px",
    "marginBottom": "24px",
    "marginLeft": "32px",
    "borderRadius": "20px",
    "backgroundColor": "#ffffff"
  },
  ".web-editor-preview": {
    "width": "100%",
    "height": "420px",
    "backgroundColor": "#111111"
  },
  ".web-editor-overlay": {
    "position": "absolute",
    "left": "0px",
    "right": "0px",
    "top": "0px",
    "bottom": "0px"
  },
  ".web-editor-text": {
    "position": "absolute",
    "left": "0px",
    "right": "0px",
    "bottom": "80px",
    "textAlign": "center",
    "fontSize": "36px",
    "fontWeight": "bold",
    "color": "#ffffff"
  },
  ".web-editor-toolbar": {
    "flexDirection": "row",
    "justifyContent": "space-around",
    "paddingTop": "16px",
    "paddingRight": "8px",
    "paddingBottom": "16px",
    "paddingLeft": "8px",
    "backgroundColor": "rgba(255,255,255,0.96)",
    "borderTopWidth": "1px",
    "borderTopColor": "#e8ecf2"
  },
  ".web-editor-tool": {
    "flexDirection": "column",
    "alignItems": "center",
    "width": "100px"
  },
  ".web-editor-tool-icon": {
    "fontSize": "32px",
    "color": "#5b6b7f",
    "marginBottom": "4px"
  },
  ".web-editor-tool-active .web-editor-tool-icon": {
    "color": "#5e7ce0",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-editor-tool-active"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-editor-tool-icon"
        }
      ]
    }
  },
  ".web-editor-tool-label": {
    "fontSize": "20px",
    "color": "#8b9097"
  },
  ".web-editor-tool-active .web-editor-tool-label": {
    "color": "#5e7ce0",
    "fontWeight": "bold",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-editor-tool-active"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-editor-tool-label"
        }
      ]
    }
  },
  ".web-panel": {
    "paddingTop": "20px",
    "paddingRight": "32px",
    "paddingBottom": "28px",
    "paddingLeft": "32px",
    "backgroundColor": "#ffffff",
    "borderTopWidth": "1px",
    "borderTopColor": "#e8ecf2"
  },
  ".web-panel-actions": {
    "flexDirection": "row",
    "justifyContent": "flex-end",
    "marginTop": "16px"
  },
  ".web-panel-btn": {
    "paddingTop": "12px",
    "paddingRight": "24px",
    "paddingBottom": "12px",
    "paddingLeft": "24px",
    "marginLeft": "16px",
    "borderRadius": "24px",
    "fontSize": "24px",
    "color": "#8b9097"
  },
  ".web-panel-btn-primary": {
    "backgroundColor": "#5e7ce0",
    "color": "#ffffff"
  },
  ".web-timeline": {
    "flexDirection": "row",
    "paddingTop": "12px",
    "paddingRight": "32px",
    "paddingBottom": "12px",
    "paddingLeft": "32px",
    "backgroundColor": "#ffffff"
  },
  ".web-timeline-clip": {
    "width": "120px",
    "height": "72px",
    "marginRight": "12px",
    "borderRadius": "8px",
    "borderTopWidth": "2px",
    "borderRightWidth": "2px",
    "borderBottomWidth": "2px",
    "borderLeftWidth": "2px",
    "borderTopColor": "rgba(0,0,0,0)",
    "borderRightColor": "rgba(0,0,0,0)",
    "borderBottomColor": "rgba(0,0,0,0)",
    "borderLeftColor": "rgba(0,0,0,0)"
  },
  ".web-timeline-clip-active": {
    "borderTopColor": "#5e7ce0",
    "borderRightColor": "#5e7ce0",
    "borderBottomColor": "#5e7ce0",
    "borderLeftColor": "#5e7ce0"
  },
  ".web-complete-player": {
    "width": "100%",
    "height": "400px",
    "borderRadius": "20px",
    "overflow": "hidden"
  },
  ".web-complete-actions": {
    "flexDirection": "row",
    "flexWrap": "wrap",
    "justifyContent": "space-between",
    "marginBottom": "24px"
  },
  ".web-complete-actions .c-btn-root": {
    "width": "48%",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-complete-actions"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "c-btn-root"
        }
      ]
    }
  },
  ".web-recommend-scroll": {
    "flexDirection": "row",
    "paddingTop": "0px",
    "paddingRight": "32px",
    "paddingBottom": "24px",
    "paddingLeft": "32px"
  },
  ".page-shell": {
    "flexDirection": "column",
    "width": "100%",
    "flex": 1,
    "backgroundColor": "#f7f9fc"
  },
  ".page-body": {
    "flexDirection": "column",
    "flex": 1,
    "paddingTop": "32px",
    "paddingRight": "32px",
    "paddingBottom": "32px",
    "paddingLeft": "32px"
  },
  ".page-section-title": {
    "fontSize": "32px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "marginBottom": "12px"
  },
  ".page-hint": {
    "fontSize": "24px",
    "color": "#8b9097",
    "marginBottom": "20px"
  },
  ".page-actions": {
    "flexDirection": "column",
    "marginTop": "8px"
  },
  ".app-btn": {
    "height": "72px",
    "marginBottom": "18px",
    "borderRadius": "12px",
    "backgroundColor": "#e9ebee",
    "color": "#111111",
    "fontSize": "30px"
  },
  ".app-btn-primary": {
    "backgroundColor": "#5e7ce0",
    "color": "#ffffff"
  },
  ".app-btn-ghost": {
    "backgroundColor": "#ffffff",
    "color": "#5e7ce0"
  },
  "@KEYFRAMES": {
    "animPageEnter": [
      {
        "opacity": 0,
        "transform": "{\"translateY\":\"24px\"}",
        "time": 0
      },
      {
        "opacity": 1,
        "transform": "{\"translateY\":\"0px\"}",
        "time": 100
      }
    ],
    "animPageExit": [
      {
        "opacity": 1,
        "time": 0
      },
      {
        "opacity": 0,
        "time": 100
      }
    ],
    "animFadeIn": [
      {
        "opacity": 0,
        "time": 0
      },
      {
        "opacity": 1,
        "time": 100
      }
    ],
    "animFadeOut": [
      {
        "opacity": 1,
        "time": 0
      },
      {
        "opacity": 0,
        "time": 100
      }
    ],
    "animSlideUp": [
      {
        "opacity": 0,
        "transform": "{\"translateY\":\"16px\"}",
        "time": 0
      },
      {
        "opacity": 1,
        "transform": "{\"translateY\":\"0px\"}",
        "time": 100
      }
    ],
    "animSpin": [
      {
        "transform": "{\"rotate\":\"0deg\"}",
        "time": 0
      },
      {
        "transform": "{\"rotate\":\"360deg\"}",
        "time": 100
      }
    ],
    "animCardLift": [
      {
        "transform": "{\"translateY\":\"0px\"}",
        "time": 0
      },
      {
        "transform": "{\"translateY\":\"-6px\"}",
        "time": 100
      }
    ],
    "animCardExit": [
      {
        "opacity": 1,
        "transform": "{\"scaleX\":1,\"scaleY\":1,\"scaleZ\":1}",
        "time": 0
      },
      {
        "opacity": 0,
        "transform": "{\"scaleX\":0.92,\"scaleY\":0.92,\"scaleZ\":0.92}",
        "time": 100
      }
    ]
  },
  ".anim-page-enter": {
    "animationName": "animPageEnter",
    "animationDuration": "400ms",
    "animationFillMode": "forwards",
    "animationTimingFunction": "ease-out"
  },
  ".anim-page-exit": {
    "animationName": "animPageExit",
    "animationDuration": "300ms",
    "animationFillMode": "forwards"
  },
  ".anim-fade-in": {
    "animationName": "animFadeIn",
    "animationDuration": "400ms",
    "animationFillMode": "forwards"
  },
  ".anim-fade-out": {
    "animationName": "animFadeOut",
    "animationDuration": "300ms",
    "animationFillMode": "forwards"
  },
  ".anim-slide-up": {
    "animationName": "animSlideUp",
    "animationDuration": "400ms",
    "animationFillMode": "forwards"
  },
  ".anim-card-exit": {
    "animationName": "animCardExit",
    "animationDuration": "320ms",
    "animationFillMode": "forwards"
  },
  ".editor-page": {
    "flexDirection": "column",
    "flex": 1,
    "backgroundColor": "#111111"
  },
  ".editor-timeline-list": {
    "width": "100%",
    "height": "96px",
    "flexDirection": "row",
    "paddingTop": "12px",
    "paddingRight": "32px",
    "paddingBottom": "12px",
    "paddingLeft": "32px",
    "backgroundColor": "#ffffff"
  },
  ".editor-timeline-item": {
    "width": "128px",
    "height": "72px",
    "marginRight": "12px"
  },
  ".editor-top": {
    "backgroundColor": "rgba(17,17,17,0.92)"
  },
  ".editor-top .web-header-title": {
    "color": "#ffffff",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "editor-top"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-header-title"
        }
      ]
    }
  },
  ".editor-top .web-section-link": {
    "color": "#ffffff",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "editor-top"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-section-link"
        }
      ]
    }
  },
  ".editor-video": {
    "width": "100%",
    "height": "420px",
    "objectFit": "cover"
  },
  ".editor-play-btn": {
    "position": "absolute",
    "left": "50%",
    "top": "50%",
    "width": "96px",
    "height": "96px",
    "marginLeft": "-48px",
    "marginTop": "-48px",
    "borderRadius": "48px",
    "backgroundColor": "rgba(255,255,255,0.25)",
    "alignItems": "center",
    "justifyContent": "center"
  },
  ".editor-play-icon": {
    "fontSize": "36px",
    "color": "#ffffff",
    "textAlign": "center",
    "paddingTop": "24px"
  },
  ".editor-chip-row": {
    "flexDirection": "row",
    "flexWrap": "wrap"
  },
  ".editor-chip": {
    "paddingTop": "10px",
    "paddingRight": "18px",
    "paddingBottom": "10px",
    "paddingLeft": "18px",
    "marginRight": "12px",
    "marginBottom": "10px",
    "borderRadius": "20px",
    "backgroundColor": "#f7f9fc",
    "color": "#2c3e50",
    "fontSize": "22px"
  },
  ".editor-chip-active": {
    "backgroundColor": "rgba(94,124,224,0.12)",
    "color": "#5e7ce0"
  },
  ".editor-export-mask": {
    "position": "fixed",
    "left": "0px",
    "right": "0px",
    "top": "0px",
    "bottom": "0px",
    "backgroundColor": "rgba(0,0,0,0.72)",
    "alignItems": "center",
    "justifyContent": "center",
    "flexDirection": "column"
  },
  ".editor-export-text": {
    "fontSize": "30px",
    "color": "#ffffff",
    "fontWeight": "bold"
  },
  ".editor-export-cancel": {
    "marginTop": "16px",
    "fontSize": "26px",
    "color": "#ffffff"
  },
  ".editor-bgm-row": {
    "marginTop": "12px"
  },
  ".web-panel-title": {
    "fontSize": "28px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "marginBottom": "12px"
  },
  ".editor-sticker-grid": {
    "flexDirection": "row",
    "flexWrap": "wrap"
  },
  ".editor-sticker-pick": {
    "width": "88px",
    "height": "88px",
    "marginRight": "12px",
    "marginBottom": "12px",
    "borderRadius": "12px",
    "backgroundColor": "#f7f9fc",
    "fontSize": "40px",
    "textAlign": "center",
    "paddingTop": "16px"
  },
  ".sticker-hint": {
    "marginBottom": "12px"
  },
  ".sticker-remove": {
    "marginTop": "12px"
  },
  ".editor-export-progress-track": {
    "width": "480px",
    "height": "8px",
    "borderRadius": "4px",
    "backgroundColor": "rgba(255,255,255,0.25)",
    "marginTop": "20px"
  },
  ".editor-export-progress-bar": {
    "height": "8px",
    "borderRadius": "4px",
    "backgroundColor": "#ffffff"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/Button/index.ux?uxType=comp&":
/*!*****************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/Button/index.ux?uxType=comp& ***!
  \*****************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "c-btn-root"
  ],
  "children": [
    {
      "type": "input",
      "attr": {
        "type": "button",
        "value": function () {return this.text},
        "disabled": function () {return this.disabled},
        "show": function () {return !this.loading}
      },
      "classList": function () {return ['c-btn', '' + 'c-btn-' + (this.variant), 'c-btn-block', this.disabled?'c-btn-disabled-state':'']},
      "events": {
        "click": "handleClick"
      }
    },
    {
      "type": "div",
      "attr": {
        "show": function () {return this.loading}
      },
      "classList": [
        "c-btn-loading-wrap"
      ],
      "children": [
        {
          "type": "div",
          "attr": {},
          "classList": [
            "c-btn-loading-spinner"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.loadingText}
          },
          "classList": [
            "c-btn-loading-text"
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/EditorStickerOverlay/index.ux?uxType=comp&":
/*!*******************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/EditorStickerOverlay/index.ux?uxType=comp& ***!
  \*******************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": function () {return ['editor-sticker', this.editable?'editor-sticker-editable':'']},
  "style": {
    "left": function () {return '' + (this.overlay.x) + '%'},
    "top": function () {return '' + (this.overlay.y) + '%'},
    "width": function () {return '' + (this.overlay.width) + '%'},
    "height": function () {return '' + (this.overlay.height) + '%'}
  },
  "events": {
    "touchstart": "onTouchStart",
    "touchmove": "onTouchMove",
    "touchend": "onTouchEnd",
    "click": "onTap"
  },
  "children": [
    {
      "type": "text",
      "attr": {
        "value": function () {return this.emoji}
      },
      "classList": [
        "editor-sticker-emoji"
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/editor/index.ux?uxType=page&importNames[]=c-button,importNames[]=c-sticker-overlay":
/*!******************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/editor/index.ux?uxType=page&importNames[]=c-button,importNames[]=c-sticker-overlay ***!
  \******************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "web-page-with-nav",
    "editor-page"
  ],
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "web-sticky-header",
        "editor-top"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "‹"
          },
          "classList": [
            "web-back-btn"
          ],
          "events": {
            "click": "goBack"
          }
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.session.title}
          },
          "classList": [
            "web-header-title",
            "web-sticky-header-center"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "导出"
          },
          "classList": [
            "web-section-link"
          ],
          "events": {
            "click": "onExport"
          }
        }
      ]
    },
    {
      "type": "stack",
      "attr": {},
      "classList": [
        "web-editor-preview"
      ],
      "children": [
        {
          "type": "video",
          "attr": {
            "src": function () {return this.previewVideoSrc},
            "poster": function () {return this.previewPoster},
            "autoplay": function () {return false},
            "controls": function () {return false}
          },
          "shown": function () {return this.previewVideoSrc},
          "classList": [
            "editor-video"
          ]
        },
        {
          "type": "image",
          "attr": {
            "src": function () {return this.previewPoster}
          },
          "shown": function () {return !this.previewVideoSrc},
          "classList": [
            "editor-video"
          ]
        },
        {
          "type": "div",
          "attr": {},
          "classList": [
            "web-editor-overlay",
            "editor-filter-layer"
          ],
          "style": {
            "backgroundColor": function () {return this.filterOverlay},
            "opacity": function () {return this.filterOpacity}
          }
        },
        {
          "type": "div",
          "attr": {
            "show": function () {return this.effectVisible}
          },
          "classList": [
            "web-editor-overlay"
          ],
          "style": {
            "backgroundColor": function () {return this.effectOverlay}
          }
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.previewText}
          },
          "classList": [
            "web-editor-text"
          ],
          "shown": function () {return this.previewText}
        },
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.previewStickers},
            "key": "index",
            "value": "item"
          },
          "children": [
            {
              "type": "c-sticker-overlay",
              "attr": {
                "overlay": function () {return this.item.overlay},
                "editable": function () {return this.item.editable}
              },
              "events": {
                "change": "onStickerChange",
                "activate": "onStickerActivate"
              }
            }
          ]
        },
        {
          "type": "div",
          "attr": {},
          "classList": [
            "editor-play-btn"
          ],
          "events": {
            "click": "togglePlay"
          },
          "children": [
            {
              "type": "text",
              "attr": {
                "value": function () {return this.isPlaying?'❚❚':'▶'}
              },
              "classList": [
                "editor-play-icon"
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "list",
      "attr": {
        "scrollpage": function () {return true}
      },
      "classList": [
        "editor-timeline-list"
      ],
      "children": [
        {
          "type": "list-item",
          "attr": {
            "type": "clip"
          },
          "classList": [
            "editor-timeline-item"
          ],
          "repeat": {
            "exp": function () {return this.clips},
            "key": "index",
            "value": "clip"
          },
          "children": [
            {
              "type": "image",
              "attr": {
                "src": function () {return this.clip.thumb||this.clip.poster},
                "dataIndex": function () {return this.index}
              },
              "classList": function () {return ['web-timeline-clip', this.activeClipIndex===this.index?'web-timeline-clip-active':'']},
              "events": {
                "click": "onClipSelect"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {
        "show": function () {return this.panelVisible}
      },
      "classList": [
        "web-panel"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": function () {return this.panelTitle}
          },
          "classList": [
            "web-panel-title"
          ]
        },
        {
          "type": "block",
          "attr": {},
          "shown": function () {return this.activeTool==='filter'},
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "editor-chip-row"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.filterPresets},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "dataId": function () {return this.item.id},
                        "value": function () {return this.item.name}
                      },
                      "classList": function () {return ['editor-chip', this.session.filterId===this.item.id?'editor-chip-active':'']},
                      "events": {
                        "click": "onFilterPick"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "block",
          "attr": {},
          "shown": function () {return this.activeTool==='effect'},
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "editor-chip-row"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.effectPresets},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "dataId": function () {return this.item.id},
                        "value": function () {return this.item.name}
                      },
                      "classList": function () {return ['editor-chip', this.session.effectId===this.item.id?'editor-chip-active':'']},
                      "events": {
                        "click": "onEffectPick"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "block",
          "attr": {},
          "shown": function () {return this.activeTool==='text'},
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "editor-chip-row"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.textPresets},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "dataId": function () {return this.item.id},
                        "value": function () {return this.item.label}
                      },
                      "classList": function () {return ['editor-chip', this.session.textPresetId===this.item.id?'editor-chip-active':'']},
                      "events": {
                        "click": "onTextPick"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "block",
          "attr": {},
          "shown": function () {return this.activeTool==='audio'},
          "children": [
            {
              "type": "text",
              "attr": {
                "value": function () {return '' + '原声：' + (this.session.keepOriginalAudio?'保留':'关闭')}
              },
              "classList": [
                "web-header-sub"
              ],
              "events": {
                "click": "toggleKeepAudio"
              }
            },
            {
              "type": "div",
              "attr": {},
              "classList": [
                "editor-chip-row",
                "editor-bgm-row"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.bgmList},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "dataId": function () {return this.item.id},
                        "value": function () {return this.item.name}
                      },
                      "classList": function () {return ['editor-chip', this.session.bgmId===this.item.id?'editor-chip-active':'']},
                      "events": {
                        "click": "onBgmPick"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "block",
          "attr": {},
          "shown": function () {return this.activeTool==='sticker'},
          "children": [
            {
              "type": "text",
              "attr": {
                "value": "选择贴纸后可在画面上拖动位置"
              },
              "classList": [
                "web-header-sub",
                "sticker-hint"
              ]
            },
            {
              "type": "div",
              "attr": {},
              "classList": [
                "editor-sticker-grid"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.stickerPresets},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "dataId": function () {return this.item.id},
                        "value": function () {return this.item.emoji}
                      },
                      "classList": function () {return ['editor-sticker-pick', this.draftSticker&&this.draftSticker.stickerId===this.item.id?'editor-chip-active':'']},
                      "events": {
                        "click": "onStickerPick"
                      }
                    }
                  ]
                }
              ]
            },
            {
              "type": "text",
              "attr": {
                "value": "移除当前贴纸"
              },
              "classList": [
                "web-section-link",
                "sticker-remove"
              ],
              "events": {
                "click": "removeDraftSticker"
              },
              "shown": function () {return this.draftSticker}
            }
          ]
        },
        {
          "type": "div",
          "attr": {
            "show": function () {return this.activeTool!=='cut'}
          },
          "classList": [
            "web-panel-actions"
          ],
          "children": [
            {
              "type": "text",
              "attr": {
                "value": "取消"
              },
              "classList": [
                "web-panel-btn"
              ],
              "events": {
                "click": "closePanel"
              }
            },
            {
              "type": "text",
              "attr": {
                "value": "应用"
              },
              "classList": [
                "web-panel-btn",
                "web-panel-btn-primary"
              ],
              "events": {
                "click": "confirmPanel"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "web-editor-toolbar"
      ],
      "children": [
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.tools},
            "key": "index",
            "value": "tool"
          },
          "children": [
            {
              "type": "div",
              "attr": {
                "dataId": function () {return this.tool.id},
                "dataLabel": function () {return this.tool.label}
              },
              "classList": function () {return ['web-editor-tool', this.activeTool===this.tool.id?'web-editor-tool-active':'']},
              "events": {
                "click": "onToolSelect"
              },
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.tool.icon}
                  },
                  "classList": [
                    "web-editor-tool-icon"
                  ]
                },
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.tool.label}
                  },
                  "classList": [
                    "web-editor-tool-label"
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {
        "show": function () {return this.exporting}
      },
      "classList": [
        "editor-export-mask"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": function () {return this.exportMessage}
          },
          "classList": [
            "editor-export-text"
          ]
        },
        {
          "type": "div",
          "attr": {},
          "classList": [
            "editor-export-progress-track"
          ],
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "editor-export-progress-bar"
              ],
              "style": {
                "width": function () {return '' + (this.exportProgress) + '%'}
              }
            }
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "取消"
          },
          "classList": [
            "editor-export-cancel"
          ],
          "events": {
            "click": "cancelExport"
          }
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/Button/index.ux?uxType=comp&name=c-button":
/*!***************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/Button/index.ux?uxType=comp&name=c-button ***!
  \***************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/Button/index.ux?uxType=comp")
$app_define$('@app-component/c-button', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/Button/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/Button/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/EditorStickerOverlay/index.ux?uxType=comp&name=c-sticker-overlay":
/*!**************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/EditorStickerOverlay/index.ux?uxType=comp&name=c-sticker-overlay ***!
  \**************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/EditorStickerOverlay/index.ux?uxType=comp")
$app_define$('@app-component/c-sticker-overlay', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/EditorStickerOverlay/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/EditorStickerOverlay/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./src/helper/ai/index.js":
/*!********************************!*\
  !*** ./src/helper/ai/index.js ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _utils = _interopRequireDefault(__webpack_require__(/*! ../utils */ "./src/helper/utils.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SHOT_TEMPLATES = {
  campus: [{
    title: '校园远景',
    scene: '校门、教学楼或操场',
    view: '远景',
    cameraMove: '慢速横移',
    duration: 5,
    tips: '先交代地点，让观众知道今天的故事发生在哪里'
  }, {
    title: '走路特写',
    scene: '鞋子、书包、手持书本',
    view: '特写',
    cameraMove: '跟拍',
    duration: 4,
    tips: '用动作镜头把远景和人物状态接起来'
  }, {
    title: '学习或活动片段',
    scene: '教室、图书馆、操场活动',
    view: '中景',
    cameraMove: '固定机位',
    duration: 6,
    tips: '保留真实声音，后期可压低做环境音'
  }, {
    title: '夕阳镜头',
    scene: '操场、走廊、天空',
    view: '空镜',
    cameraMove: '轻微上摇',
    duration: 5,
    tips: '适合作为结尾，承接 BGM 情绪'
  }],
  study: [{
    title: '桌面全景',
    scene: '书桌、电脑、笔记本',
    view: '全景',
    cameraMove: '固定机位',
    duration: 5,
    tips: '保持桌面整洁，画面里只留下必要学习物品'
  }, {
    title: '敲键盘动作',
    scene: '手部、键盘、屏幕边缘',
    view: '特写',
    cameraMove: '固定机位',
    duration: 4,
    tips: '可以拍 2-3 段短动作，后期按节奏切'
  }, {
    title: '翻书或写字特写',
    scene: '书页、笔尖、便签',
    view: '近景',
    cameraMove: '轻推',
    duration: 4,
    tips: '让动作从画面一侧进入，剪辑时更顺'
  }, {
    title: '成果收尾',
    scene: '完成的笔记、待办清单',
    view: '俯拍',
    cameraMove: '固定机位',
    duration: 5,
    tips: '给观众一个完成感'
  }],
  daily: [{
    title: '房间环境',
    scene: '床边、窗台、桌面',
    view: '全景',
    cameraMove: '慢推',
    duration: 5,
    tips: '用自然光建立生活感'
  }, {
    title: '整理物品',
    scene: '包、钥匙、衣服',
    view: '特写',
    cameraMove: '固定机位',
    duration: 4,
    tips: '动作要完整，方便后期做节奏点'
  }, {
    title: '出门转场',
    scene: '门把手、电梯、路口',
    view: '中景',
    cameraMove: '跟拍',
    duration: 4,
    tips: '用推门、抬手遮镜等动作做自然转场'
  }],
  travel: [{
    title: '出发镜头',
    scene: '车站、机票、行李',
    view: '中景',
    cameraMove: '跟拍',
    duration: 5,
    tips: '让路线信息清楚出现一次'
  }, {
    title: '目的地远景',
    scene: '街道、景点、自然风景',
    view: '远景',
    cameraMove: '横移',
    duration: 6,
    tips: '稳定拍摄，给画面留呼吸感'
  }, {
    title: '当地细节',
    scene: '招牌、食物、手作、路牌',
    view: '特写',
    cameraMove: '固定机位',
    duration: 4,
    tips: '多拍可被记住的小元素'
  }],
  food: [{
    title: '餐桌全景',
    scene: '餐厅、餐桌、菜单',
    view: '全景',
    cameraMove: '固定机位',
    duration: 4,
    tips: '先交代环境和食物数量'
  }, {
    title: '制作过程',
    scene: '翻炒、倒入、摆盘',
    view: '近景',
    cameraMove: '跟拍',
    duration: 5,
    tips: '抓住声音和热气，会更有食欲'
  }, {
    title: '成品特写',
    scene: '主菜、饮品、甜点',
    view: '特写',
    cameraMove: '慢推',
    duration: 4,
    tips: '让主体在画面中心，背景保持干净'
  }]
};
function createShotPlan(options = {}) {
  const type = typeof options === 'string' ? options : options.type;
  const normalizedType = _utils.default.normalizeVlogType(type);
  const guide = _utils.default.getShootGuide(normalizedType);
  const template = SHOT_TEMPLATES[normalizedType] || SHOT_TEMPLATES.study;
  const shots = template.map((shot, index) => ({
    id: `${normalizedType}-shot-${index + 1}`,
    order: index + 1,
    title: `镜头${index + 1}：${shot.title}`,
    scene: shot.scene,
    view: shot.view,
    cameraMove: shot.cameraMove,
    duration: shot.duration,
    tips: shot.tips
  }));
  return {
    type: normalizedType,
    name: guide.name,
    description: guide.description,
    guide: guide.guide,
    shots,
    scriptText: shots.map(shot => shot.title).join('\n'),
    estimatedDuration: shots.reduce((total, shot) => total + shot.duration, 0)
  };
}
function normalizeInputMaterials(materials = [], type) {
  if (!materials.length) {
    return _utils.default.getMaterials({
      type
    });
  }
  return materials.map((item, index) => ({
    id: item.id || `upload-${index + 1}`,
    type: item.type || type,
    category: item.category || 'custom',
    name: item.name || `素材${index + 1}`,
    duration: item.duration || 4,
    tags: item.tags || [],
    sortWeight: item.sortWeight || (index + 1) * 10,
    uri: item.uri || item.path || ''
  }));
}
function buildTimeline(materials, shotPlan, styleTemplate) {
  const transitions = styleTemplate.transitions || ['cut'];
  return materials.map((material, index) => {
    const shot = shotPlan.shots[index % shotPlan.shots.length];
    return {
      order: index + 1,
      shotId: shot.id,
      shotTitle: shot.title,
      materialId: material.id,
      materialName: material.name,
      uri: material.uri,
      duration: material.duration,
      filter: styleTemplate.filter,
      transition: index === 0 ? 'none' : transitions[index % transitions.length],
      caption: shot.title.replace(/^镜头\d+：/, '')
    };
  });
}
function generateVlog(options = {}) {
  const type = _utils.default.normalizeVlogType(options.type);
  const guide = _utils.default.getShootGuide(type);
  const styleId = _utils.default.normalizeStyle(options.style || guide.defaultStyle);
  const styleTemplate = _utils.default.getStyleTemplate(styleId);
  const shotPlan = createShotPlan({
    type
  });
  const materials = _utils.default.sortMaterials(normalizeInputMaterials(options.materials || [], type));
  const timeline = buildTimeline(materials, shotPlan, styleTemplate);
  return {
    id: `mock-vlog-${type}-${styleTemplate.id}`,
    type,
    title: `${guide.name} - ${styleTemplate.name}`,
    shotPlan,
    materials,
    timeline,
    style: styleTemplate,
    bgm: {
      id: styleTemplate.bgm,
      name: styleTemplate.bgmName
    },
    steps: [{
      name: '素材排序',
      status: 'done',
      count: materials.length
    }, {
      name: '模板拼接',
      status: 'done',
      template: styleTemplate.name
    }, {
      name: '自动配乐',
      status: 'done',
      bgm: styleTemplate.bgmName
    }],
    exportConfig: {
      ratio: options.ratio || '9:16',
      resolution: options.resolution || '1080x1920',
      duration: timeline.reduce((total, item) => total + item.duration, 0)
    }
  };
}
function generateVlogAsync(options = {}, delay) {
  return _utils.default.mockRequest(generateVlog(options), delay);
}
var _default = exports["default"] = {
  createShotPlan,
  getStyleTemplate: _utils.default.getStyleTemplate,
  getStyleTemplates: _utils.default.getStyleTemplates,
  generateVlog,
  generateVlogAsync
};

/***/ }),

/***/ "./src/helper/ajax.js":
/*!****************************!*\
  !*** ./src/helper/ajax.js ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _system = _interopRequireDefault($app_require$("@app-module/system.fetch"));
var _utils = _interopRequireDefault(__webpack_require__(/*! ./utils */ "./src/helper/utils.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const TIMEOUT = 20000;
const DEFAULT_HEADER = {
  'Content-Type': 'application/json'
};
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback) {
    const P = this.constructor;
    return this.then(value => P.resolve(callback()).then(() => value), reason => P.resolve(callback()).then(() => {
      throw reason;
    }));
  };
}
function parseJson(data) {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    return data;
  }
}
function normalizeResponse(response) {
  if (!response) {
    return null;
  }
  const payload = parseJson(response.data);
  if (payload && typeof payload === 'object' && !Object.prototype.hasOwnProperty.call(payload, 'success') && !Object.prototype.hasOwnProperty.call(payload, 'code') && typeof payload.data === 'string') {
    return parseJson(payload.data);
  }
  return payload;
}
function resolveBusinessData(result) {
  if (!result || typeof result !== 'object') {
    return result;
  }
  if (result.success === false) {
    throw new Error(result.message || 'request failed');
  }
  if (result.success === true) {
    if (Object.prototype.hasOwnProperty.call(result, 'value')) {
      return result.value;
    }
    if (Object.prototype.hasOwnProperty.call(result, 'data')) {
      return result.data;
    }
  }
  if (Object.prototype.hasOwnProperty.call(result, 'code')) {
    if (result.code !== 0 && result.code !== '0') {
      throw new Error(result.message || 'request failed');
    }
    if (Object.prototype.hasOwnProperty.call(result, 'data')) {
      return result.data;
    }
  }
  return result;
}
function fetchPromise(params) {
  return _system.default.fetch({
    url: params.url,
    method: params.method,
    data: params.data || {},
    header: params.header || DEFAULT_HEADER
  }).then(response => resolveBusinessData(normalizeResponse(response)));
}
function requestHandle(params, timeout = TIMEOUT) {
  return Promise.race([fetchPromise(params), new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`request timeout: ${params.url}`));
    }, timeout);
  })]).catch(error => {
    console.log(`request fail @${params.url}`, error);
    throw error;
  });
}
var _default = exports["default"] = {
  get(url, params = {}, options = {}) {
    return requestHandle({
      method: 'get',
      url: _utils.default.queryString(url, params),
      header: options.header
    }, options.timeout);
  },
  post(url, params = {}, options = {}) {
    return requestHandle({
      method: 'post',
      url,
      data: params,
      header: options.header
    }, options.timeout);
  },
  put(url, params = {}, options = {}) {
    return requestHandle({
      method: 'put',
      url,
      data: params,
      header: options.header
    }, options.timeout);
  }
};

/***/ }),

/***/ "./src/helper/apis/vlog.js":
/*!*********************************!*\
  !*** ./src/helper/apis/vlog.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _system = _interopRequireDefault($app_require$("@app-module/system.request"));
var _manifest = _interopRequireDefault(__webpack_require__(/*! ../../manifest.json */ "./src/manifest.json"));
var _ajax = _interopRequireDefault(__webpack_require__(/*! ../ajax */ "./src/helper/ajax.js"));
var _ai = _interopRequireDefault(__webpack_require__(/*! ../ai */ "./src/helper/ai/index.js"));
var _utils = _interopRequireDefault(__webpack_require__(/*! ../utils */ "./src/helper/utils.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DEFAULT_API_BASE = 'http://127.0.0.1:3000';
const UPLOAD_TIMEOUT = 30000;
function trimSlash(value = '') {
  return String(value).replace(/\/+$/, '');
}
function getApiBase() {
  const configured = _manifest.default && _manifest.default.config ? _manifest.default.config.MEMENTO_API_BASE : '';
  return trimSlash(configured || DEFAULT_API_BASE);
}
function apiUrl(path) {
  return `${getApiBase()}${path}`;
}
function parseJson(data) {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    return data;
  }
}
function unwrapResponse(payload) {
  const result = parseJson(payload);
  if (!result || typeof result !== 'object') {
    return result;
  }
  if (result.code !== undefined) {
    if (result.code !== 0 && result.code !== '0') {
      throw new Error(result.message || 'request failed');
    }
    return result.data;
  }
  if (result.success === true) {
    return result.data || result.value;
  }
  if (result.success === false) {
    throw new Error(result.message || 'request failed');
  }
  return result;
}
function fallbackRequest(requestTask, fallbackTask) {
  return requestTask().catch(error => {
    console.log('api fallback to mock', error && error.message ? error.message : error);
    return fallbackTask();
  });
}
function pickValue(data, key, fallback) {
  if (!data || data[key] === undefined || data[key] === null || data[key] === '') {
    return fallback;
  }
  return data[key];
}
function normalizeUploadFile(file = {}, index = 0, type = 'study') {
  const uri = file.uri || file.path || '';
  const filename = file.filename || file.name || uri.split('/').reverse()[0];
  return {
    id: file.id || `local-${Date.now()}-${index}`,
    type,
    category: file.category || 'custom',
    name: filename || `素材${index + 1}`,
    duration: file.duration || 4,
    tags: file.tags || ['upload', type],
    sortWeight: file.sortWeight || 50 + index,
    uri,
    status: file.status || 'local'
  };
}
function registerLocalMaterial(file = {}, data = {}) {
  const type = _utils.default.normalizeVlogType(data.type);
  return _utils.default.mockRequest(normalizeUploadFile(file, data.index || 0, type), 120);
}
function uploadWithRequest(file = {}, data = {}) {
  const type = _utils.default.normalizeVlogType(data.type);
  const query = {
    type,
    category: data.category || 'custom',
    name: file.filename || file.name || ''
  };
  const url = _utils.default.queryString(apiUrl('/api/materials/upload'), query);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('upload timeout'));
    }, data.timeout || UPLOAD_TIMEOUT);
    _system.default.upload({
      url,
      files: [{
        uri: file.uri,
        name: 'file',
        filename: file.filename || file.name || 'material.mp4'
      }],
      data: [{
        name: 'type',
        value: type
      }],
      success: res => {
        clearTimeout(timer);
        try {
          resolve(unwrapResponse(res && res.data));
        } catch (error) {
          reject(error);
        }
      },
      fail: res => {
        clearTimeout(timer);
        reject(new Error(res && res.errMsg || 'upload failed'));
      }
    });
  });
}
var _default = exports["default"] = {
  getApiBase,
  health() {
    return _ajax.default.get(apiUrl('/api/health'));
  },
  getVlogTypes() {
    return fallbackRequest(() => _ajax.default.get(apiUrl('/api/vlog-types')), () => _utils.default.mockRequest(_utils.default.getVlogTypes()));
  },
  getShootGuide(data = {}) {
    const type = pickValue(data, 'type', 'study');
    return fallbackRequest(() => _ajax.default.get(apiUrl(`/api/guide/${type}`)).then(result => result.guide || result), () => _utils.default.mockRequest(_utils.default.getShootGuide(type)));
  },
  getMaterials(data = {}) {
    return fallbackRequest(() => _ajax.default.get(apiUrl('/api/materials'), data), () => _utils.default.mockRequest(_utils.default.getMaterials(data)));
  },
  getMaterialCategories(data = {}) {
    return fallbackRequest(() => _ajax.default.get(apiUrl('/api/materials'), data).then(materials => {
      const categories = materials.map(item => item.category);
      return Array.from(new Set(categories));
    }), () => _utils.default.mockRequest(_utils.default.getMaterialCategories(data.type)));
  },
  getStyleTemplates() {
    return fallbackRequest(() => _ajax.default.get(apiUrl('/api/style-templates')), () => _utils.default.mockRequest(_utils.default.getStyleTemplates()));
  },
  getStyleTemplate(data = {}) {
    const style = pickValue(data, 'style', 'study');
    return fallbackRequest(() => _ajax.default.get(apiUrl('/api/style-templates')).then(templates => {
      return templates.find(item => item.id === style) || templates[0];
    }), () => _utils.default.mockRequest(_utils.default.getStyleTemplate(style)));
  },
  getAiShotPlan(data = {}) {
    return fallbackRequest(() => _ajax.default.post(apiUrl('/api/shot-plan'), data), () => _utils.default.mockRequest(_ai.default.createShotPlan(data)));
  },
  uploadMaterial(file = {}, data = {}) {
    if (!file.uri) {
      return registerLocalMaterial(file, data);
    }
    return fallbackRequest(() => uploadWithRequest(file, data), () => registerLocalMaterial(file, data));
  },
  registerMaterial(file = {}, data = {}) {
    return fallbackRequest(() => _ajax.default.post(apiUrl('/api/materials'), normalizeUploadFile(file, data.index || 0, data.type)), () => registerLocalMaterial(file, data));
  },
  generateVlog(data = {}) {
    return fallbackRequest(() => _ajax.default.post(apiUrl('/api/generate/mock'), data, {
      timeout: 30000
    }), () => _ai.default.generateVlogAsync(data, 300));
  },
  /** 导出用片段上传（与 export 路由配合，失败时仅登记本地 uri） */
  uploadExportClip(file = {}) {
    if (!file.uri) {
      return Promise.resolve({
        uri: '',
        local: true
      });
    }
    return uploadWithRequest({
      uri: file.uri,
      filename: file.filename || 'clip.mp4',
      name: file.filename || 'clip.mp4',
      category: 'video'
    }, {
      type: 'export',
      category: 'video',
      index: file.index || 0,
      timeout: 60000
    }).catch(() => ({
      uri: file.uri,
      local: true
    }));
  }
};

/***/ }),

/***/ "./src/helper/data/audioLibrary.js":
/*!*****************************************!*\
  !*** ./src/helper/data/audioLibrary.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.NETWORK_AUDIOS = void 0;
exports.getNetworkAudio = getNetworkAudio;
const NETWORK_AUDIOS = exports.NETWORK_AUDIOS = [{
  id: 'sunny-day',
  name: 'Sunny Day',
  artist: '轻松治愈',
  duration: '02:18'
}, {
  id: 'coastal-walk',
  name: 'Coastal Walk',
  artist: '旅行氛围',
  duration: '02:45'
}, {
  id: 'city-lights',
  name: 'City Lights',
  artist: '都市节奏',
  duration: '02:02'
}, {
  id: 'morning-coffee',
  name: 'Morning Coffee',
  artist: '慵懒日常',
  duration: '01:58'
}];
function getNetworkAudio(id) {
  return NETWORK_AUDIOS.find(item => item.id === id);
}
var _default = exports["default"] = {
  NETWORK_AUDIOS,
  getNetworkAudio
};

/***/ }),

/***/ "./src/helper/data/editorPresets.js":
/*!******************************************!*\
  !*** ./src/helper/data/editorPresets.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.TOOL_ITEMS = exports.TEXT_PRESETS = exports.FILTER_PRESETS = exports.EFFECT_PRESETS = exports.EDITOR_TOOLS = void 0;
exports.getEffectOverlay = getEffectOverlay;
exports.getFilterOverlay = getFilterOverlay;
const FILTER_PRESETS = exports.FILTER_PRESETS = [{
  id: 'none',
  name: '原图',
  overlay: 'rgba(0,0,0,0)'
}, {
  id: 'warm',
  name: '暖阳',
  overlay: 'rgba(255, 200, 120, 0.18)'
}, {
  id: 'cool',
  name: '冷调',
  overlay: 'rgba(120, 180, 255, 0.16)'
}, {
  id: 'fresh',
  name: '清新',
  overlay: 'rgba(180, 255, 200, 0.12)'
}, {
  id: 'vintage',
  name: '复古',
  overlay: 'rgba(160, 120, 80, 0.22)'
}, {
  id: 'cinematic',
  name: '电影',
  overlay: 'rgba(40, 60, 90, 0.2)'
}, {
  id: 'vivid',
  name: '鲜艳',
  overlay: 'rgba(255, 100, 150, 0.1)'
}, {
  id: 'soft',
  name: '柔光',
  overlay: 'rgba(255, 255, 255, 0.15)'
}, {
  id: 'bw',
  name: '黑白',
  overlay: 'rgba(80, 80, 80, 0.35)'
}];
const TEXT_PRESETS = exports.TEXT_PRESETS = [{
  id: 'none',
  label: '无字幕'
}, {
  id: 'travel',
  label: '旅行的意义',
  content: '旅行的意义'
}, {
  id: 'daily',
  label: '今日份快乐',
  content: '今日份快乐'
}, {
  id: 'study',
  label: '专注时刻',
  content: '专注时刻'
}];
const EFFECT_PRESETS = exports.EFFECT_PRESETS = [{
  id: 'none',
  name: '无'
}, {
  id: 'vignette',
  name: '暗角',
  overlay: 'rgba(0,0,0,0.35)'
}, {
  id: 'film',
  name: '胶片',
  overlay: 'rgba(80,60,40,0.2)'
}, {
  id: 'dream',
  name: '梦幻',
  overlay: 'rgba(200,180,255,0.18)'
}];
const EDITOR_TOOLS = exports.EDITOR_TOOLS = [{
  id: 'cut',
  label: '剪辑',
  icon: '✂'
}, {
  id: 'filter',
  label: '滤镜',
  icon: '◐'
}, {
  id: 'effect',
  label: '特效',
  icon: '✦'
}, {
  id: 'text',
  label: '文字',
  icon: 'T'
}, {
  id: 'sticker',
  label: '贴纸',
  icon: '☺'
}, {
  id: 'audio',
  label: '音频',
  icon: '♪'
}];
const TOOL_ITEMS = exports.TOOL_ITEMS = [{
  id: 'filter',
  label: '滤镜'
}, {
  id: 'text',
  label: '文字'
}, {
  id: 'audio',
  label: '音效'
}];
function getFilterOverlay(id) {
  const preset = FILTER_PRESETS.find(item => item.id === id);
  return preset ? preset.overlay : 'rgba(0,0,0,0)';
}
function getEffectOverlay(id) {
  const preset = EFFECT_PRESETS.find(item => item.id === id);
  return preset && preset.overlay ? preset.overlay : 'rgba(0,0,0,0)';
}
var _default = exports["default"] = {
  FILTER_PRESETS,
  TEXT_PRESETS,
  EFFECT_PRESETS,
  EDITOR_TOOLS,
  TOOL_ITEMS,
  getFilterOverlay,
  getEffectOverlay
};

/***/ }),

/***/ "./src/helper/data/mockProject.js":
/*!****************************************!*\
  !*** ./src/helper/data/mockProject.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.VIDEO_CLIPS = exports.PROJECT_DURATION = exports.PREVIEW_POSTER = void 0;
const PROJECT_DURATION = exports.PROJECT_DURATION = 96;
const VIDEO_CLIPS = exports.VIDEO_CLIPS = [{
  id: '1',
  start: 0,
  duration: 18,
  thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop',
  poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop',
  name: '片段 1'
}, {
  id: '2',
  start: 18,
  duration: 22,
  thumb: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=120&fit=crop',
  poster: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop',
  name: '片段 2'
}, {
  id: '3',
  start: 40,
  duration: 20,
  thumb: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&h=120&fit=crop',
  poster: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=450&fit=crop',
  name: '片段 3'
}, {
  id: '4',
  start: 60,
  duration: 18,
  thumb: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=120&fit=crop',
  poster: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=450&fit=crop',
  name: '片段 4'
}, {
  id: '5',
  start: 78,
  duration: 18,
  thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop',
  poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop',
  name: '片段 5'
}];
const PREVIEW_POSTER = exports.PREVIEW_POSTER = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=450&fit=crop';
var _default = exports["default"] = {
  PROJECT_DURATION,
  VIDEO_CLIPS,
  PREVIEW_POSTER
};

/***/ }),

/***/ "./src/helper/data/stickers.js":
/*!*************************************!*\
  !*** ./src/helper/data/stickers.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.STICKER_PRESETS = void 0;
exports.createDefaultStickerOverlay = createDefaultStickerOverlay;
exports.createStickerId = createStickerId;
exports["default"] = void 0;
exports.getStickerEmoji = getStickerEmoji;
exports.getStickerPreset = getStickerPreset;
const STICKER_PRESETS = exports.STICKER_PRESETS = [{
  id: 'heart',
  name: '爱心',
  emoji: '❤️'
}, {
  id: 'star',
  name: '星星',
  emoji: '⭐'
}, {
  id: 'sparkle',
  name: '闪亮',
  emoji: '✨'
}, {
  id: 'fire',
  name: '火焰',
  emoji: '🔥'
}, {
  id: 'sun',
  name: '太阳',
  emoji: '☀️'
}, {
  id: 'rainbow',
  name: '彩虹',
  emoji: '🌈'
}, {
  id: 'camera',
  name: '相机',
  emoji: '📷'
}, {
  id: 'plane',
  name: '飞机',
  emoji: '✈️'
}, {
  id: 'palm',
  name: '棕榈',
  emoji: '🌴'
}, {
  id: 'wave',
  name: '海浪',
  emoji: '🌊'
}, {
  id: 'party',
  name: '庆祝',
  emoji: '🎉'
}, {
  id: 'music',
  name: '音乐',
  emoji: '🎵'
}];
function getStickerPreset(id) {
  return STICKER_PRESETS.find(item => item.id === id);
}
function getStickerEmoji(id) {
  const preset = getStickerPreset(id);
  return preset ? preset.emoji : '✨';
}
function createStickerId() {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function createDefaultStickerOverlay(stickerId, index = 0) {
  const offset = index % 5;
  return {
    id: createStickerId(),
    stickerId,
    x: 50 + offset % 3 * 10,
    y: 40 + Math.floor(offset / 3) * 12,
    width: 18,
    height: 18,
    rotation: 0
  };
}
var _default = exports["default"] = {
  STICKER_PRESETS,
  getStickerPreset,
  getStickerEmoji,
  createStickerId,
  createDefaultStickerOverlay
};

/***/ }),

/***/ "./src/helper/data/textStyles.js":
/*!***************************************!*\
  !*** ./src/helper/data/textStyles.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.createDefaultTextOverlay = createDefaultTextOverlay;
exports["default"] = void 0;
function createDefaultTextOverlay(content = '输入文字') {
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
  };
}
var _default = exports["default"] = {
  createDefaultTextOverlay
};

/***/ }),

/***/ "./src/helper/export/deviceExport.js":
/*!*******************************************!*\
  !*** ./src/helper/export/deviceExport.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.exportEditedVideo = exportEditedVideo;
var _system = _interopRequireDefault($app_require$("@app-module/system.request"));
var _system2 = _interopRequireDefault($app_require$("@app-module/system.file"));
var _vlog = _interopRequireDefault(__webpack_require__(/*! ../apis/vlog */ "./src/helper/apis/vlog.js"));
var _sessionAdapter = __webpack_require__(/*! ./sessionAdapter */ "./src/helper/export/sessionAdapter.js");
var _formatTime = __webpack_require__(/*! ../formatTime */ "./src/helper/formatTime.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function parseJson(data) {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch (_unused) {
    return data;
  }
}
function unwrapResponse(payload) {
  const result = parseJson(payload);
  if (!result || typeof result !== 'object') {
    return result;
  }
  if (result.code !== undefined && result.code !== 0 && result.code !== '0') {
    throw new Error(result.message || '导出失败');
  }
  if (result.success === false) {
    throw new Error(result.message || '导出失败');
  }
  return result.data || result;
}
function downloadToLocal(url, targetUri) {
  return new Promise((resolve, reject) => {
    _system.default.download({
      url,
      filename: targetUri,
      success: res => resolve(res.filePath || res.uri || targetUri),
      fail: err => reject(new Error(err && err.errMsg || '下载成片失败'))
    });
  });
}
function copyLocalVideo(uri, targetUri) {
  return new Promise((resolve, reject) => {
    _system2.default.copy({
      srcUri: uri,
      destUri: targetUri,
      success: () => resolve(targetUri),
      fail: err => reject(new Error(err && err.errMsg || '复制视频失败'))
    });
  });
}
function uploadExportClips(clips = [], onProgress) {
  const uploads = clips.map((clip, index) => {
    onProgress && onProgress({
      phase: 'prepare',
      progress: 0.05 + index / clips.length * 0.25,
      message: `上传片段 ${index + 1}/${clips.length}…`
    });
    return _vlog.default.uploadExportClip({
      uri: clip.videoSrc,
      filename: `${clip.name || `clip-${index + 1}`}.mp4`,
      duration: clip.duration,
      index
    });
  });
  return Promise.all(uploads);
}
function requestServerExport(clips, duration, session, onProgress) {
  const apiBase = _vlog.default.getApiBase();
  const url = `${apiBase}/api/vlog/export`;
  return new Promise((resolve, reject) => {
    onProgress && onProgress({
      phase: 'encode',
      progress: 0.35,
      message: '服务端合成中（滤镜 / 文字 / 贴纸 / 配乐）…'
    });
    _system.default.upload({
      url,
      files: clips.map((clip, index) => ({
        uri: clip.videoSrc,
        name: 'clips',
        filename: `${clip.id || index}.mp4`
      })),
      data: [{
        name: 'session',
        value: JSON.stringify(session)
      }, {
        name: 'duration',
        value: String(duration)
      }, {
        name: 'clipsMeta',
        value: JSON.stringify(clips.map(clip => ({
          duration: clip.duration
        })))
      }],
      success: res => {
        try {
          const data = unwrapResponse(res && res.data);
          if (!data || !data.url) {
            reject(new Error('导出服务未返回成片地址'));
            return;
          }
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
      fail: err => {
        reject(new Error(err && err.errMsg || '导出请求失败'));
      }
    });
  });
}
async function exportViaServer(clips, duration, session, hooks = {}) {
  const {
    onProgress,
    isCancelled
  } = hooks;
  const snapshot = (0, _sessionAdapter.normalizeSession)(session);
  if (isCancelled && isCancelled()) {
    throw new Error('cancelled');
  }
  onProgress && onProgress({
    phase: 'prepare',
    progress: 0.02,
    message: '连接导出服务…'
  });
  const serverResult = await requestServerExport(clips, duration, snapshot, onProgress);
  if (isCancelled && isCancelled()) {
    throw new Error('cancelled');
  }
  const downloadUrl = serverResult.url.startsWith('http') ? serverResult.url : `${_vlog.default.getApiBase()}${serverResult.url}`;
  const localUri = `internal://cache/export_${Date.now()}.mp4`;
  onProgress && onProgress({
    phase: 'finalize',
    progress: 0.9,
    message: '下载成片到本机…'
  });
  const savedUri = await downloadToLocal(downloadUrl, localUri);
  const first = clips[0];
  return {
    uri: savedUri,
    posterUrl: first.poster || first.thumb,
    duration: serverResult.duration || duration,
    durationLabel: (0, _formatTime.formatTime)(serverResult.duration || duration),
    title: serverResult.title || snapshot.title,
    mimeType: serverResult.mimeType || 'video/mp4',
    source: 'server'
  };
}
async function exportViaDevice(clips, duration, session, hooks = {}) {
  const {
    onProgress
  } = hooks;
  const snapshot = (0, _sessionAdapter.normalizeSession)(session);
  const first = clips.find(clip => clip.videoSrc);
  if (!first) {
    throw new Error('没有可导出的本地视频');
  }
  onProgress && onProgress({
    phase: 'render',
    progress: 0.4,
    message: '本机导出：拼接并保留剪辑设置…'
  });
  const targetUri = `internal://cache/export_${Date.now()}.mp4`;
  const savedUri = await copyLocalVideo(first.videoSrc, targetUri);
  onProgress && onProgress({
    phase: 'finalize',
    progress: 0.95,
    message: '本机导出完成（完整烧录需导出服务）'
  });
  return {
    uri: savedUri,
    posterUrl: first.poster || first.thumb,
    duration,
    durationLabel: (0, _formatTime.formatTime)(duration),
    title: snapshot.title,
    mimeType: 'video/mp4',
    source: 'device',
    session: snapshot
  };
}

/**
 * 真机导出：优先服务端 FFmpeg 完整合成，失败时回退本机复制成片。
 */
async function exportEditedVideo(clips, duration, session, hooks = {}) {
  const list = clips || [];
  const total = duration || list.reduce((sum, clip) => sum + (clip.duration || 0), 0);
  if (!list.length || total <= 0) {
    throw new Error('没有可导出的视频素材');
  }
  if (!list.some(clip => clip.videoSrc)) {
    throw new Error('请先导入本地视频后再导出');
  }
  try {
    return await exportViaServer(list, total, session, hooks);
  } catch (serverError) {
    console.log('server export failed, fallback device', serverError.message);
    return exportViaDevice(list, total, session, hooks);
  }
}
var _default = exports["default"] = {
  exportEditedVideo
};

/***/ }),

/***/ "./src/helper/export/sessionAdapter.js":
/*!*********************************************!*\
  !*** ./src/helper/export/sessionAdapter.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.normalizeSession = normalizeSession;
var _textStyles = __webpack_require__(/*! ../data/textStyles */ "./src/helper/data/textStyles.js");
/** 将快应用 session 规范为与 Web EditorSnapshot 一致的结构 */
function normalizeSession(session = {}) {
  const stickerOverlays = Array.isArray(session.stickerOverlays) ? session.stickerOverlays.map(item => Object.assign({}, item)) : [];
  let textOverlay = session.textOverlay ? Object.assign({}, session.textOverlay) : null;
  if (!textOverlay && session.textContent) {
    textOverlay = (0, _textStyles.createDefaultTextOverlay)(session.textContent);
  }
  return {
    title: session.title || '旅行的意义',
    filterId: session.filterId || 'none',
    filterIntensity: session.filterIntensity == null ? 100 : session.filterIntensity,
    effectId: session.effectId || 'none',
    textOverlay,
    stickerOverlays,
    keepOriginalAudio: session.keepOriginalAudio !== false,
    bgmId: session.bgmId == null ? 'sunny-day' : session.bgmId
  };
}
var _default = exports["default"] = {
  normalizeSession
};

/***/ }),

/***/ "./src/helper/formatTime.js":
/*!**********************************!*\
  !*** ./src/helper/formatTime.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
exports.formatTime = formatTime;
function formatTime(seconds = 0) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
var _default = exports["default"] = {
  formatTime
};

/***/ }),

/***/ "./src/helper/routes.js":
/*!******************************!*\
  !*** ./src/helper/routes.js ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _system = _interopRequireDefault($app_require$("@app-module/system.router"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * 应用内路由：页面路径集中在 manifest.router.pages 注册；
 * 此处提供命名跳转，避免页面里散落硬编码 uri。
 */

const PAGES = {
  home: '/pages/home',
  create: '/pages/create',
  editor: '/pages/editor',
  complete: '/pages/complete',
  vlogLearn: '/pages/vlog-learn',
  style: '/pages/style',
  shoot: '/pages/shoot',
  upload: '/pages/upload',
  generate: '/pages/generate',
  preview: '/pages/preview',
  demo: '/pages/Demo',
  demoDetail: '/pages/DemoDetail'
};
function resolveUri(name) {
  if (typeof name === 'string' && name.indexOf('/') === 0) {
    return name;
  }
  return PAGES[name] || PAGES.home;
}
function push(name, params) {
  _system.default.push({
    uri: resolveUri(name),
    params: params || {}
  });
}
function replace(name, params) {
  _system.default.replace({
    uri: resolveUri(name),
    params: params || {}
  });
}
function back() {
  _system.default.back();
}
var _default = exports["default"] = {
  PAGES,
  push,
  replace,
  back,
  resolveUri
};

/***/ }),

/***/ "./src/helper/utils.js":
/*!*****************************!*\
  !*** ./src/helper/utils.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
const prompt = $app_require$('@app-module/system.prompt');
const VLOG_ALIASES = {
  campus: 'campus',
  '校园': 'campus',
  '校园vlog': 'campus',
  '校园 vlog': 'campus',
  study: 'study',
  '学习': 'study',
  '学习vlog': 'study',
  '学习 vlog': 'study',
  daily: 'daily',
  '日常': 'daily',
  travel: 'travel',
  '旅行': 'travel',
  food: 'food',
  '美食': 'food'
};
const STYLE_ALIASES = {
  japanese: 'japanese',
  jp: 'japanese',
  '日系': 'japanese',
  cinematic: 'cinematic',
  movie: 'cinematic',
  '电影感': 'cinematic',
  study: 'study',
  '学习': 'study',
  '学习 vlog': 'study'
};
const VLOG_TYPES = [{
  type: 'study',
  name: '学习 vlog',
  description: '记录学习环境、专注动作和阶段性成果',
  guide: ['拍摄桌面全景', '拍摄敲键盘动作', '拍摄翻书或写字特写', '拍摄完成任务后的收尾镜头'],
  defaultStyle: 'study'
}, {
  type: 'campus',
  name: '校园 vlog',
  description: '记录校园空间、行走过程和傍晚氛围',
  guide: ['拍摄校园远景', '拍摄走路特写', '拍摄教学楼或操场空镜', '拍摄夕阳镜头'],
  defaultStyle: 'japanese'
}, {
  type: 'daily',
  name: '日常 vlog',
  description: '记录起床、出门、生活片段与情绪瞬间',
  guide: ['拍摄房间环境', '拍摄整理物品动作', '拍摄出门转场', '拍摄一天结尾'],
  defaultStyle: 'cinematic'
}, {
  type: 'travel',
  name: '旅行 vlog',
  description: '记录路线、风景、人物互动和目的地记忆点',
  guide: ['拍摄出发交通工具', '拍摄目的地远景', '拍摄行走跟拍', '拍摄当地细节特写'],
  defaultStyle: 'cinematic'
}, {
  type: 'food',
  name: '美食 vlog',
  description: '记录餐厅环境、制作过程、成品和试吃反应',
  guide: ['拍摄店面或餐桌全景', '拍摄食物制作过程', '拍摄成品特写', '拍摄试吃反应'],
  defaultStyle: 'japanese'
}];
const STYLE_TEMPLATES = [{
  id: 'japanese',
  name: '日系',
  filter: 'warm-clean',
  filterName: '暖白清透',
  bgm: 'light-acoustic',
  bgmName: '轻快木吉他',
  transitions: ['fade', 'slide-left', 'flash-white'],
  color: '#f4b8a5',
  pace: 'medium',
  caption: '手写感短字幕'
}, {
  id: 'cinematic',
  name: '电影感',
  filter: 'teal-orange',
  filterName: '青橙对比',
  bgm: 'ambient-piano',
  bgmName: '氛围钢琴',
  transitions: ['cross-dissolve', 'blur', 'match-cut'],
  color: '#1f2937',
  pace: 'slow',
  caption: '简洁居中字幕'
}, {
  id: 'study',
  name: '学习 vlog',
  filter: 'soft-light',
  filterName: '柔光低饱和',
  bgm: 'lofi-study',
  bgmName: 'Lo-fi 学习节拍',
  transitions: ['cut', 'fade', 'speed-ramp'],
  color: '#8ba17f',
  pace: 'steady',
  caption: '时间轴式字幕'
}];
const MATERIALS = [{
  id: 'mat-campus-01',
  type: 'campus',
  category: 'wide',
  name: '校园远景',
  duration: 5,
  tags: ['opening', 'outdoor', 'japanese'],
  sortWeight: 10,
  uri: 'mock://materials/campus-wide.mp4'
}, {
  id: 'mat-campus-02',
  type: 'campus',
  category: 'close',
  name: '走路特写',
  duration: 4,
  tags: ['detail', 'motion'],
  sortWeight: 20,
  uri: 'mock://materials/walking-close.mp4'
}, {
  id: 'mat-campus-03',
  type: 'campus',
  category: 'atmosphere',
  name: '夕阳空镜',
  duration: 6,
  tags: ['ending', 'sunset', 'cinematic'],
  sortWeight: 90,
  uri: 'mock://materials/sunset.mp4'
}, {
  id: 'mat-study-01',
  type: 'study',
  category: 'wide',
  name: '桌面全景',
  duration: 5,
  tags: ['opening', 'desk', 'study'],
  sortWeight: 10,
  uri: 'mock://materials/desk-wide.mp4'
}, {
  id: 'mat-study-02',
  type: 'study',
  category: 'close',
  name: '敲键盘动作',
  duration: 4,
  tags: ['detail', 'typing', 'study'],
  sortWeight: 30,
  uri: 'mock://materials/typing.mp4'
}, {
  id: 'mat-study-03',
  type: 'study',
  category: 'result',
  name: '学习成果收尾',
  duration: 5,
  tags: ['ending', 'notebook', 'study'],
  sortWeight: 80,
  uri: 'mock://materials/study-result.mp4'
}, {
  id: 'mat-daily-01',
  type: 'daily',
  category: 'wide',
  name: '房间环境',
  duration: 5,
  tags: ['opening', 'indoor'],
  sortWeight: 10,
  uri: 'mock://materials/room.mp4'
}, {
  id: 'mat-food-01',
  type: 'food',
  category: 'close',
  name: '成品特写',
  duration: 4,
  tags: ['detail', 'food', 'japanese'],
  sortWeight: 40,
  uri: 'mock://materials/food-close.mp4'
}];
function cloneData(data) {
  if (data === undefined || data === null) {
    return data;
  }
  return JSON.parse(JSON.stringify(data));
}
function normalizeKey(value, aliases, fallback) {
  const key = String(value || fallback).trim().toLowerCase();
  return aliases[key] || key || fallback;
}
function normalizeVlogType(type) {
  return normalizeKey(type, VLOG_ALIASES, 'study');
}
function normalizeStyle(style) {
  return normalizeKey(style, STYLE_ALIASES, 'study');
}
function queryString(url, query = {}) {
  const str = [];
  Object.keys(query).forEach(key => {
    const value = query[key];
    if (value === undefined || value === null || value === '') {
      return;
    }
    str.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  const paramStr = str.join('&');
  return paramStr ? `${url}${url.indexOf('?') > -1 ? '&' : '?'}${paramStr}` : url;
}
function showToast(message = '', duration = 0) {
  if (!message) return;
  prompt.showToast({
    message,
    duration
  });
}
function mockRequest(data, delay = 120) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(cloneData(data));
    }, delay);
  });
}
function getVlogTypes() {
  return cloneData(VLOG_TYPES);
}
function getShootGuide(type = 'study') {
  const normalizedType = normalizeVlogType(type);
  const guide = VLOG_TYPES.find(item => item.type === normalizedType) || VLOG_TYPES[0];
  return cloneData(guide);
}
function getStyleTemplates() {
  return cloneData(STYLE_TEMPLATES);
}
function getStyleTemplate(style = 'study') {
  const normalizedStyle = normalizeStyle(style);
  const template = STYLE_TEMPLATES.find(item => item.id === normalizedStyle) || STYLE_TEMPLATES[0];
  return cloneData(template);
}
function getMaterialCategories(type) {
  const normalizedType = type ? normalizeVlogType(type) : '';
  const categories = MATERIALS.filter(item => !normalizedType || item.type === normalizedType).map(item => item.category);
  return Array.from(new Set(categories));
}
function sortMaterials(materials = []) {
  return cloneData(materials).sort((prev, next) => {
    if (prev.sortWeight !== next.sortWeight) {
      return prev.sortWeight - next.sortWeight;
    }
    return next.duration - prev.duration;
  });
}
function getMaterials(params = {}) {
  const normalizedType = params.type ? normalizeVlogType(params.type) : '';
  const category = params.category || '';
  const style = params.style ? normalizeStyle(params.style) : '';
  let materials = MATERIALS.filter(item => {
    const matchedType = !normalizedType || item.type === normalizedType;
    const matchedCategory = !category || item.category === category;
    const matchedStyle = !style || item.tags.indexOf(style) > -1 || item.type === style;
    return matchedType && matchedCategory && matchedStyle;
  });
  materials = sortMaterials(materials);
  if (params.limit) {
    materials = materials.slice(0, Number(params.limit));
  }
  return materials;
}
var _default = exports["default"] = {
  showToast,
  queryString,
  mockRequest,
  cloneData,
  normalizeVlogType,
  normalizeStyle,
  getVlogTypes,
  getShootGuide,
  getStyleTemplates,
  getStyleTemplate,
  getMaterialCategories,
  getMaterials,
  sortMaterials
};

/***/ }),

/***/ "./src/manifest.json":
/*!***************************!*\
  !*** ./src/manifest.json ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"package":"com.example.demo","name":"忆眸","versionName":"1.0.0","versionCode":1,"minPlatformVersion":1070,"icon":"/assets/images/logo.png","features":[{"name":"system.prompt"},{"name":"system.router"},{"name":"system.shortcut"},{"name":"system.fetch"},{"name":"system.media"},{"name":"system.request"},{"name":"system.file"},{"name":"system.share"}],"permissions":[{"origin":"*"}],"template/official":"demo-template","config":{"logLevel":"debug","MEMENTO_API_BASE":"http://192.168.43.162:3000"},"router":{"entry":"pages/home","pages":{"pages/Demo":{"component":"index"},"pages/DemoDetail":{"component":"index"},"pages/home":{"component":"index"},"pages/style":{"component":"index"},"pages/shoot":{"component":"index"},"pages/upload":{"component":"index"},"pages/generate":{"component":"index"},"pages/preview":{"component":"index"},"pages/create":{"component":"index"},"pages/editor":{"component":"index"},"pages/complete":{"component":"index"},"pages/vlog-learn":{"component":"index"}},"widgets":{"CardDemo":{"name":"CardDemo","description":"快应用卡片展示","component":"index","path":"/CardDemo","minPlatformVersion":1032,"targetManufactorys":["vivo"],"features":[]}}},"display":{"titleBarBackgroundColor":"#f2f2f2","titleBarTextColor":"#414141","pages":{"pages/Demo":{"titleBarText":"快应用示例模版"},"pages/DemoDetail":{"titleBarText":"详情页"},"pages/home":{"titleBar":false,"titleBarText":"首页"},"pages/style":{"titleBar":false,"titleBarText":"风格"},"pages/shoot":{"titleBarText":"拍摄"},"pages/upload":{"titleBarText":"上传"},"pages/generate":{"titleBarText":"生成"},"pages/preview":{"titleBar":false,"titleBarText":"预览"},"pages/create":{"titleBar":false,"titleBarText":"导入素材"},"pages/editor":{"titleBar":false,"titleBarText":"智能剪辑"},"pages/complete":{"titleBar":false,"titleBarText":"创作完成"},"pages/vlog-learn":{"titleBar":false,"titleBarText":"学习 Vlog"}}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***********************************************!*\
  !*** ./src/pages/editor/index.ux?uxType=page ***!
  \***********************************************/
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/Button/index.ux?uxType=comp&name=c-button */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/Button/index.ux?uxType=comp&name=c-button")
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/EditorStickerOverlay/index.ux?uxType=comp&name=c-sticker-overlay */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/EditorStickerOverlay/index.ux?uxType=comp&name=c-sticker-overlay")
var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/editor/index.ux?uxType=page")
$app_define$('@app-component/index', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=page&importNames[]=c-button,importNames[]=c-sticker-overlay */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/editor/index.ux?uxType=page&importNames[]=c-button,importNames[]=c-sticker-overlay")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/editor/index.ux?uxType=page")
});
$app_bootstrap$('@app-component/index',{ packagerVersion: "2.0.8" });
})();

/******/ })()
;
    };
    if (typeof window === "undefined") {
      return createPageHandler();
    }
    else {
      window.createPageHandler = createPageHandler
    }
  })();