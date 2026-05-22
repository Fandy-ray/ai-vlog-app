(function(){
    
    var createPageHandler = function() {
      return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/upload/index.ux?uxType=page":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/upload/index.ux?uxType=page ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _animations = _interopRequireDefault(__webpack_require__(/*! ../../assets/js/animations */ "./src/assets/js/animations.js"));
var _system = _interopRequireDefault($app_require$("@app-module/system.media"));
var _system2 = _interopRequireDefault($app_require$("@app-module/system.prompt"));
var _routes = _interopRequireDefault(__webpack_require__(/*! ../../helper/routes */ "./src/helper/routes.js"));
var _vlog = _interopRequireDefault(__webpack_require__(/*! ../../helper/apis/vlog */ "./src/helper/apis/vlog.js"));
var _store = _interopRequireDefault(__webpack_require__(/*! ../../helper/store */ "./src/helper/store.js"));
var _utils = _interopRequireDefault(__webpack_require__(/*! ../../helper/utils */ "./src/helper/utils.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function filenameFromUri(uri = '', index = 0, ext = 'mp4') {
  const filename = uri.split('/').reverse()[0];
  return filename || `素材${index + 1}.${ext}`;
}
var _default = exports.default = {
  private: {
    pageAnimClass: '',
    statusText: '等待选择素材',
    materials: [],
    uploadLoading: false,
    uploadError: '',
    removingIndex: -1,
    previewVisible: false,
    previewUri: '',
    previewTitle: '',
    previewIsImage: true
  },
  onInit() {
    this.$page.setTitleBar({
      text: '上传素材'
    });
    this.materials = _store.default.state.materials || [];
    _animations.default.triggerPageEnter(this);
    this.updateStatus();
  },
  onShow() {
    this.materials = _store.default.state.materials || [];
    _animations.default.triggerPageEnter(this);
    this.updateStatus();
  },
  updateStatus() {
    this.statusText = this.materials.length ? `已准备 ${this.materials.length} 个素材` : '等待选择素材';
  },
  syncStore() {
    _store.default.setState({
      materials: this.materials
    });
    this.updateStatus();
  },
  pickVideo() {
    this.pickMedia('video');
  },
  pickImage() {
    this.pickMedia('image');
  },
  pickMedia(kind) {
    const success = res => {
      const uris = res.uris || (res.uri ? [res.uri] : []);
      this.handlePicked(uris, kind);
    };
    const fail = () => {
      this.uploadError = '选取素材失败，请重试或使用 Mock 素材';
      _utils.default.showToast('选取素材失败');
    };
    try {
      if (kind === 'video') {
        if (_system.default.pickVideos) {
          _system.default.pickVideos({
            success,
            fail
          });
        } else {
          _system.default.pickVideo({
            success,
            fail
          });
        }
      } else if (_system.default.pickImages) {
        _system.default.pickImages({
          success,
          fail
        });
      } else {
        _system.default.pickImage({
          success,
          fail
        });
      }
    } catch (error) {
      fail(error);
    }
  },
  handlePicked(uris = [], kind) {
    if (!uris.length) {
      return;
    }
    this.uploadError = '';
    this.statusText = '正在导入素材...';
    const baseIndex = this.materials.length;
    const picked = uris.map((uri, index) => {
      const filename = filenameFromUri(uri, index, kind === 'video' ? 'mp4' : 'jpg');
      return {
        id: `local-${Date.now()}-${index}`,
        type: _store.default.state.type,
        category: kind,
        name: filename,
        duration: kind === 'video' ? 5 : 3,
        tags: ['upload', kind, 'local'],
        sortWeight: 50 + baseIndex + index,
        uri,
        status: 'done'
      };
    });
    this.materials = this.materials.concat(picked);
    this.syncStore();
    _utils.default.showToast(`已导入 ${picked.length} 个${kind === 'video' ? '视频' : '图片'}`);
    this.statusText = `已准备 ${this.materials.length} 个素材`;
    this.uploadLoading = true;
    let queue = Promise.resolve();
    picked.forEach((item, index) => {
      const file = {
        uri: item.uri,
        filename: item.name,
        category: kind
      };
      queue = queue.then(() => {
        return _vlog.default.uploadMaterial(file, {
          type: _store.default.state.type,
          category: kind,
          index: baseIndex + index
        }).then(material => {
          const list = this.materials.slice();
          const targetIndex = baseIndex + index;
          if (list[targetIndex]) {
            list[targetIndex] = _objectSpread(_objectSpread(_objectSpread({}, list[targetIndex]), material), {}, {
              uri: material.uri || list[targetIndex].uri,
              status: material.uri && material.uri.indexOf('mock://') === 0 ? 'mocked' : 'done'
            });
            this.materials = list;
            this.syncStore();
          }
        }).catch(() => {});
      });
    });
    queue.finally(() => {
      this.uploadLoading = false;
    });
  },
  useMockMaterials() {
    this.uploadLoading = true;
    this.uploadError = '';
    this.statusText = '正在读取 Mock 素材...';
    _vlog.default.getMaterials({
      type: _store.default.state.type || 'study',
      style: _store.default.state.style || 'study',
      limit: 4
    }).then(materials => {
      this.materials = (materials || []).map(item => _objectSpread(_objectSpread({}, item), {}, {
        status: 'mocked'
      }));
      this.syncStore();
    }).catch(() => {
      this.uploadError = 'Mock 素材加载失败';
      _utils.default.showToast('Mock 素材加载失败');
    }).finally(() => {
      this.uploadLoading = false;
    });
  },
  onPreview(evt) {
    const index = evt.detail ? evt.detail.index : 0;
    const item = this.materials[index];
    if (!item) {
      return;
    }
    this.previewUri = item.uri || '';
    this.previewTitle = item.name || '素材预览';
    this.previewIsImage = item.category === 'image';
    this.previewVisible = true;
  },
  closePreview() {
    this.previewVisible = false;
  },
  onRemove(evt) {
    const index = evt.detail ? evt.detail.index : 0;
    _system2.default.showDialog({
      title: '删除素材',
      message: '确定从列表中移除该素材吗？',
      buttons: [{
        text: '取消',
        color: '#666666'
      }, {
        text: '删除',
        color: '#c45c4a'
      }],
      success: data => {
        if (data.index !== 1) {
          return;
        }
        this.removingIndex = index;
        setTimeout(() => {
          const list = this.materials.slice();
          list.splice(index, 1);
          this.materials = list;
          this.removingIndex = -1;
          this.syncStore();
        }, _animations.default.DURATION_MS);
      }
    });
  },
  goGenerate() {
    if (!this.materials.length) {
      _utils.default.showToast('请先上传或选择 Mock 素材');
      return;
    }
    this.syncStore();
    _routes.default.push('generate');
  },
  goShoot() {
    _routes.default.push('shoot');
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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/Loading/index.ux?uxType=comp":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/Loading/index.ux?uxType=comp ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    mode: {
      type: String,
      default: 'page'
    },
    visible: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: '加载中...'
    }
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MaterialCard/index.ux?uxType=comp":
/*!*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MaterialCard/index.ux?uxType=comp ***!
  \*********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    material: {
      type: Object,
      default: {}
    },
    index: {
      type: Number,
      default: 0
    },
    exiting: {
      type: Boolean,
      default: false
    }
  },
  private: {
    lifted: false,
    isImage: true,
    typeLabel: '图片'
  },
  onInit() {
    this.refreshMeta();
  },
  onPropsChange() {
    this.refreshMeta();
  },
  refreshMeta() {
    const category = this.material && this.material.category || 'image';
    this.isImage = category === 'image';
    this.typeLabel = this.isImage ? '图片' : '视频';
  },
  onPreview() {
    this.$emit('preview', {
      index: this.index
    });
  },
  onRemove(event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    this.$emit('remove', {
      index: this.index
    });
  },
  onTouchStart() {
    this.lifted = true;
  },
  onTouchEnd() {
    this.lifted = false;
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MaterialPreview/index.ux?uxType=comp":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MaterialPreview/index.ux?uxType=comp ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    uri: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '素材预览'
    },
    isImage: {
      type: Boolean,
      default: true
    }
  },
  onPanelTap() {},
  onClose() {
    this.$emit('close', {});
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/UploadZone/index.ux?uxType=comp":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/UploadZone/index.ux?uxType=comp ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    title: {
      type: String,
      default: '上传素材'
    },
    hint: {
      type: String,
      default: '点击选择图片或视频，上传后自动加入列表'
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: '上传中...'
    },
    errorText: {
      type: String,
      default: ''
    }
  },
  private: {
    pressed: false
  },
  onTap() {
    this.$emit('tapzone', {});
  },
  onPickVideo() {
    this.$emit('pickvideo', {});
  },
  onPickImage() {
    this.$emit('pickimage', {});
  },
  onTouchStart() {
    this.pressed = true;
  },
  onTouchEnd() {
    this.pressed = false;
  }
};}

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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/Loading/index.ux?uxType=comp":
/*!*********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/Loading/index.ux?uxType=comp ***!
  \*********************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-loading": {
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center"
  },
  ".c-loading-page": {
    "width": "100%",
    "minHeight": "160px",
    "paddingTop": "32px",
    "paddingRight": "0px",
    "paddingBottom": "32px",
    "paddingLeft": "0px"
  },
  ".c-loading-button": {
    "flexDirection": "row",
    "minHeight": "48px",
    "paddingTop": "8px",
    "paddingRight": "0px",
    "paddingBottom": "8px",
    "paddingLeft": "0px"
  },
  ".c-loading-spinner": {
    "width": "48px",
    "height": "48px",
    "borderRadius": "24px",
    "borderTopWidth": "4px",
    "borderRightWidth": "4px",
    "borderBottomWidth": "4px",
    "borderLeftWidth": "4px",
    "borderTopColor": "#5e7ce0",
    "borderRightColor": "#e0e4e8",
    "borderBottomColor": "#e0e4e8",
    "borderLeftColor": "#e0e4e8",
    "animationName": "animSpin",
    "animationDuration": "800ms",
    "animationIterationCount": -1,
    "animationTimingFunction": "linear"
  },
  ".c-loading-button .c-loading-spinner": {
    "width": "32px",
    "height": "32px",
    "borderRadius": "16px",
    "borderTopWidth": "3px",
    "borderRightWidth": "3px",
    "borderBottomWidth": "3px",
    "borderLeftWidth": "3px",
    "marginRight": "12px",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "c-loading-button"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "c-loading-spinner"
        }
      ]
    }
  },
  ".c-loading-text": {
    "marginTop": "16px",
    "fontSize": "26px",
    "color": "#8b9097"
  },
  ".c-loading-button .c-loading-text": {
    "marginTop": "0px",
    "fontSize": "24px",
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "c-loading-button"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "c-loading-text"
        }
      ]
    }
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MaterialCard/index.ux?uxType=comp":
/*!**************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MaterialCard/index.ux?uxType=comp ***!
  \**************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-material": {
    "flexDirection": "column",
    "width": "48%",
    "marginBottom": "20px",
    "paddingTop": "12px",
    "paddingRight": "12px",
    "paddingBottom": "12px",
    "paddingLeft": "12px",
    "borderRadius": "12px",
    "backgroundColor": "#ffffff",
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "#eef0f2",
    "borderRightColor": "#eef0f2",
    "borderBottomColor": "#eef0f2",
    "borderLeftColor": "#eef0f2"
  },
  ".c-material-lift": {
    "transform": "{\"translateY\":\"-6px\"}"
  },
  ".c-material-thumb-wrap": {
    "position": "relative",
    "width": "100%",
    "height": "200px",
    "borderRadius": "8px",
    "backgroundColor": "#eef2f4",
    "marginBottom": "12px",
    "alignItems": "center",
    "justifyContent": "center"
  },
  ".c-material-thumb": {
    "width": "100%",
    "height": "100%",
    "objectFit": "cover",
    "borderRadius": "8px"
  },
  ".c-material-video": {
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "width": "100%",
    "height": "100%"
  },
  ".c-material-play": {
    "fontSize": "40px",
    "color": "#5e7ce0",
    "marginBottom": "8px"
  },
  ".c-material-vlabel": {
    "fontSize": "22px",
    "color": "#8b9097"
  },
  ".c-material-remove": {
    "position": "absolute",
    "top": "8px",
    "right": "8px",
    "width": "44px",
    "height": "44px",
    "borderRadius": "22px",
    "backgroundColor": "rgba(0,0,0,0.55)",
    "color": "#ffffff",
    "fontSize": "32px",
    "textAlign": "center"
  },
  ".c-material-name": {
    "fontSize": "26px",
    "color": "#2c3e50",
    "marginBottom": "4px"
  },
  ".c-material-type": {
    "fontSize": "22px",
    "color": "#456b86"
  },
  ".c-material-status": {
    "marginTop": "6px",
    "fontSize": "20px",
    "color": "#d38b3f"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MaterialPreview/index.ux?uxType=comp":
/*!*****************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MaterialPreview/index.ux?uxType=comp ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-preview-mask": {
    "position": "fixed",
    "left": "0px",
    "top": "0px",
    "right": "0px",
    "bottom": "0px",
    "backgroundColor": "rgba(0,0,0,0.72)",
    "alignItems": "center",
    "justifyContent": "center",
    "paddingTop": "32px",
    "paddingRight": "32px",
    "paddingBottom": "32px",
    "paddingLeft": "32px"
  },
  ".c-preview-panel": {
    "flexDirection": "column",
    "width": "100%",
    "paddingTop": "24px",
    "paddingRight": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "borderRadius": "12px",
    "backgroundColor": "#ffffff"
  },
  ".c-preview-close": {
    "alignSelf": "flex-end",
    "fontSize": "28px",
    "color": "#5e7ce0",
    "marginBottom": "12px"
  },
  ".c-preview-title": {
    "fontSize": "30px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "marginBottom": "16px"
  },
  ".c-preview-image": {
    "width": "100%",
    "height": "480px",
    "objectFit": "contain",
    "borderRadius": "8px"
  },
  ".c-preview-video": {
    "width": "100%",
    "height": "480px",
    "borderRadius": "8px"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/UploadZone/index.ux?uxType=comp":
/*!************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/UploadZone/index.ux?uxType=comp ***!
  \************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-upload": {
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "minHeight": "280px",
    "paddingTop": "32px",
    "paddingRight": "24px",
    "paddingBottom": "32px",
    "paddingLeft": "24px",
    "borderRadius": "12px",
    "borderTopWidth": "2px",
    "borderRightWidth": "2px",
    "borderBottomWidth": "2px",
    "borderLeftWidth": "2px",
    "borderTopColor": "#d8e5df",
    "borderRightColor": "#d8e5df",
    "borderBottomColor": "#d8e5df",
    "borderLeftColor": "#d8e5df",
    "backgroundColor": "#ffffff",
    "marginBottom": "24px"
  },
  ".c-upload-pressed": {
    "backgroundColor": "#f0f6f3",
    "borderTopColor": "#5e7ce0",
    "borderRightColor": "#5e7ce0",
    "borderBottomColor": "#5e7ce0",
    "borderLeftColor": "#5e7ce0"
  },
  ".c-upload-loading": {
    "borderTopColor": "#e0e4e8",
    "borderRightColor": "#e0e4e8",
    "borderBottomColor": "#e0e4e8",
    "borderLeftColor": "#e0e4e8"
  },
  ".c-upload-icon": {
    "fontSize": "56px",
    "color": "#5e7ce0",
    "marginBottom": "12px"
  },
  ".c-upload-title": {
    "fontSize": "32px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "marginBottom": "10px"
  },
  ".c-upload-hint": {
    "fontSize": "24px",
    "color": "#8b9097",
    "textAlign": "center",
    "lineHeight": "36px",
    "marginBottom": "20px"
  },
  ".c-upload-actions": {
    "flexDirection": "row",
    "justifyContent": "center",
    "width": "100%"
  },
  ".c-upload-btn": {
    "width": "200px",
    "height": "64px",
    "marginTop": "0px",
    "marginRight": "10px",
    "marginBottom": "0px",
    "marginLeft": "10px",
    "borderRadius": "12px",
    "backgroundColor": "#e9f2ec",
    "color": "#5e7ce0",
    "fontSize": "26px"
  },
  ".c-upload-error": {
    "marginTop": "16px",
    "fontSize": "24px",
    "color": "#c45c4a"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/upload/index.ux?uxType=page":
/*!***************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/upload/index.ux?uxType=page ***!
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
  ".upload-page": {
    "flexDirection": "column",
    "paddingTop": "32px",
    "paddingRight": "32px",
    "paddingBottom": "32px",
    "paddingLeft": "32px",
    "backgroundColor": "#f7f9fc"
  },
  ".upload-heading": {
    "fontSize": "38px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "marginBottom": "10px"
  },
  ".upload-hint": {
    "fontSize": "24px",
    "lineHeight": "36px",
    "color": "#8b9097",
    "marginBottom": "12px"
  },
  ".upload-status": {
    "fontSize": "24px",
    "color": "#5e7ce0",
    "marginBottom": "20px"
  },
  ".upload-tools": {
    "flexDirection": "column",
    "marginBottom": "8px"
  },
  ".upload-empty": {
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "minHeight": "160px",
    "paddingTop": "28px",
    "paddingRight": "28px",
    "paddingBottom": "28px",
    "paddingLeft": "28px",
    "borderRadius": "12px",
    "backgroundColor": "#ffffff",
    "marginBottom": "20px"
  },
  ".upload-empty-title": {
    "fontSize": "30px",
    "color": "#2c3e50",
    "marginBottom": "8px"
  },
  ".upload-empty-text": {
    "fontSize": "24px",
    "color": "#8b9097"
  },
  ".upload-grid": {
    "flexDirection": "row",
    "flexWrap": "wrap",
    "justifyContent": "space-between",
    "marginBottom": "24px"
  },
  ".upload-actions": {
    "flexDirection": "column"
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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/Loading/index.ux?uxType=comp&":
/*!******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/Loading/index.ux?uxType=comp& ***!
  \******************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {
    "show": function () {return this.visible}
  },
  "classList": function () {return ['c-loading', '' + 'c-loading-' + (this.mode)]},
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-loading-spinner"
      ]
    },
    {
      "type": "text",
      "attr": {
        "show": function () {return this.text},
        "value": function () {return this.text}
      },
      "classList": [
        "c-loading-text"
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MaterialCard/index.ux?uxType=comp&":
/*!***********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MaterialCard/index.ux?uxType=comp& ***!
  \***********************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {
    "dataIndex": function () {return this.index}
  },
  "classList": function () {return ['c-material', this.exiting?'anim-card-exit':'', this.lifted?'c-material-lift':'']},
  "events": {
    "click": "onPreview",
    "touchstart": "onTouchStart",
    "touchend": "onTouchEnd"
  },
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-material-thumb-wrap"
      ],
      "children": [
        {
          "type": "image",
          "attr": {
            "src": function () {return this.material.uri},
            "alt": function () {return this.material.name}
          },
          "classList": [
            "c-material-thumb"
          ],
          "shown": function () {return this.isImage}
        },
        {
          "type": "div",
          "attr": {},
          "classList": [
            "c-material-video"
          ],
          "shown": function () {return !this.isImage},
          "children": [
            {
              "type": "text",
              "attr": {
                "value": "▶"
              },
              "classList": [
                "c-material-play"
              ]
            },
            {
              "type": "text",
              "attr": {
                "value": "视频"
              },
              "classList": [
                "c-material-vlabel"
              ]
            }
          ]
        },
        {
          "type": "text",
          "attr": {
            "dataIndex": function () {return this.index},
            "value": "×"
          },
          "classList": [
            "c-material-remove"
          ],
          "events": {
            "click": "onRemove"
          }
        }
      ]
    },
    {
      "type": "text",
      "attr": {
        "value": function () {return this.material.name}
      },
      "classList": [
        "c-material-name"
      ]
    },
    {
      "type": "text",
      "attr": {
        "value": function () {return this.typeLabel}
      },
      "classList": [
        "c-material-type"
      ]
    },
    {
      "type": "text",
      "attr": {
        "value": "上传中"
      },
      "classList": [
        "c-material-status"
      ],
      "shown": function () {return this.material.status==='uploading'}
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MaterialPreview/index.ux?uxType=comp&":
/*!**************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MaterialPreview/index.ux?uxType=comp& ***!
  \**************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {
    "show": function () {return this.visible}
  },
  "classList": [
    "c-preview-mask"
  ],
  "events": {
    "click": "onClose"
  },
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-preview-panel",
        "anim-fade-in"
      ],
      "events": {
        "click": "onPanelTap"
      },
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "关闭"
          },
          "classList": [
            "c-preview-close"
          ],
          "events": {
            "click": "onClose"
          }
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.title}
          },
          "classList": [
            "c-preview-title"
          ]
        },
        {
          "type": "image",
          "attr": {
            "show": function () {return this.isImage},
            "src": function () {return this.uri}
          },
          "classList": [
            "c-preview-image"
          ]
        },
        {
          "type": "video",
          "attr": {
            "show": function () {return !this.isImage},
            "src": function () {return this.uri},
            "controls": "true"
          },
          "classList": [
            "c-preview-video"
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/UploadZone/index.ux?uxType=comp&importNames[]=c-loading":
/*!********************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/UploadZone/index.ux?uxType=comp&importNames[]=c-loading ***!
  \********************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": function () {return ['c-upload', this.loading?'c-upload-loading':'', this.pressed?'c-upload-pressed':'']},
  "events": {
    "click": "onTap",
    "touchstart": "onTouchStart",
    "touchend": "onTouchEnd"
  },
  "children": [
    {
      "type": "c-loading",
      "attr": {
        "mode": "button",
        "text": function () {return this.loadingText},
        "visible": function () {return true}
      },
      "shown": function () {return this.loading}
    },
    {
      "type": "block",
      "attr": {},
      "shown": function () {return !this.loading},
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "＋"
          },
          "classList": [
            "c-upload-icon"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.title}
          },
          "classList": [
            "c-upload-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.hint}
          },
          "classList": [
            "c-upload-hint"
          ]
        },
        {
          "type": "div",
          "attr": {},
          "classList": [
            "c-upload-actions"
          ],
          "children": [
            {
              "type": "input",
              "attr": {
                "type": "button",
                "value": "选择视频"
              },
              "classList": [
                "c-upload-btn"
              ],
              "events": {
                "click": "onPickVideo"
              }
            },
            {
              "type": "input",
              "attr": {
                "type": "button",
                "value": "选择图片"
              },
              "classList": [
                "c-upload-btn"
              ],
              "events": {
                "click": "onPickImage"
              }
            }
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.errorText}
          },
          "classList": [
            "c-upload-error"
          ],
          "shown": function () {return this.errorText}
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/upload/index.ux?uxType=page&importNames[]=c-upload-zone,importNames[]=c-material-card,importNames[]=c-material-preview,importNames[]=c-button":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/upload/index.ux?uxType=page&importNames[]=c-upload-zone,importNames[]=c-material-card,importNames[]=c-material-preview,importNames[]=c-button ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": function () {return ['page-shell', 'upload-page', this.pageAnimClass]},
  "children": [
    {
      "type": "text",
      "attr": {
        "value": "素材上传与预览"
      },
      "classList": [
        "upload-heading"
      ]
    },
    {
      "type": "text",
      "attr": {
        "value": "支持从相册选择视频/图片，选中后立即加入列表；真机调试请授予相册权限。"
      },
      "classList": [
        "upload-hint"
      ]
    },
    {
      "type": "text",
      "attr": {
        "value": function () {return this.statusText}
      },
      "classList": [
        "upload-status"
      ]
    },
    {
      "type": "c-upload-zone",
      "attr": {
        "loading": function () {return this.uploadLoading},
        "loadingText": "素材上传中...",
        "errorText": function () {return this.uploadError}
      },
      "events": {
        "pickvideo": "pickVideo",
        "pickimage": "pickImage"
      }
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "upload-tools"
      ],
      "children": [
        {
          "type": "c-button",
          "attr": {
            "text": "使用 Mock 素材",
            "variant": "ghost"
          },
          "events": {
            "click": "useMockMaterials"
          }
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "upload-empty",
        "anim-fade-in"
      ],
      "shown": function () {return !this.materials.length&&!this.uploadLoading},
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "还没有素材"
          },
          "classList": [
            "upload-empty-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "上传后将在此以卡片网格展示"
          },
          "classList": [
            "upload-empty-text"
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "upload-grid",
        "anim-slide-up"
      ],
      "shown": function () {return this.materials.length},
      "children": [
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.materials},
            "key": "index",
            "value": "item"
          },
          "children": [
            {
              "type": "c-material-card",
              "attr": {
                "material": function () {return this.item},
                "index": function () {return this.index},
                "exiting": function () {return this.removingIndex===this.index}
              },
              "events": {
                "preview": "onPreview",
                "remove": "onRemove"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "c-material-preview",
      "attr": {
        "visible": function () {return this.previewVisible},
        "uri": function () {return this.previewUri},
        "title": function () {return this.previewTitle},
        "isImage": function () {return this.previewIsImage}
      },
      "events": {
        "close": "closePreview"
      }
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "upload-actions"
      ],
      "children": [
        {
          "type": "c-button",
          "attr": {
            "text": "生成 Vlog",
            "variant": "primary"
          },
          "events": {
            "click": "goGenerate"
          }
        },
        {
          "type": "c-button",
          "attr": {
            "text": "返回拍摄指引",
            "variant": "default"
          },
          "events": {
            "click": "goShoot"
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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/Loading/index.ux?uxType=comp&name=c-loading":
/*!*****************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/Loading/index.ux?uxType=comp&name=c-loading ***!
  \*****************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/Loading/index.ux?uxType=comp")
$app_define$('@app-component/c-loading', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/Loading/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/Loading/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/MaterialCard/index.ux?uxType=comp&name=c-material-card":
/*!****************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/MaterialCard/index.ux?uxType=comp&name=c-material-card ***!
  \****************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MaterialCard/index.ux?uxType=comp")
$app_define$('@app-component/c-material-card', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MaterialCard/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MaterialCard/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/MaterialPreview/index.ux?uxType=comp&name=c-material-preview":
/*!**********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/MaterialPreview/index.ux?uxType=comp&name=c-material-preview ***!
  \**********************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MaterialPreview/index.ux?uxType=comp")
$app_define$('@app-component/c-material-preview', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MaterialPreview/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MaterialPreview/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/UploadZone/index.ux?uxType=comp&name=c-upload-zone":
/*!************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/UploadZone/index.ux?uxType=comp&name=c-upload-zone ***!
  \************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../Loading/index.ux?uxType=comp&name=c-loading */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/Loading/index.ux?uxType=comp&name=c-loading")
var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/UploadZone/index.ux?uxType=comp")
$app_define$('@app-component/c-upload-zone', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp&importNames[]=c-loading */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/UploadZone/index.ux?uxType=comp&importNames[]=c-loading")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/UploadZone/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./src/assets/js/animations.js":
/*!*************************************!*\
  !*** ./src/assets/js/animations.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
/**
 * 交互动效工具：时长常量、列表轮换、导拍/分镜数据构造、页面动效类名。
 * 供 pages 与 components 复用，避免动画逻辑散落在各页。
 */

const DURATION_MS = 400;
const DURATION_SLOW_MS = 500;
const PAGE_ENTER_CLASS = 'anim-page-enter';
const PAGE_EXIT_CLASS = 'anim-page-exit';
const FADE_IN_CLASS = 'anim-fade-in';
const FADE_OUT_CLASS = 'anim-fade-out';
const SLIDE_UP_CLASS = 'anim-slide-up';
const CARD_LIFT_CLASS = 'anim-card-lift';
const CARD_EXIT_CLASS = 'anim-card-exit';
function nextIndex(current, length) {
  if (!length) {
    return 0;
  }
  return (current + 1) % length;
}

/** 由镜头计划生成导拍提示轮播数据 */
function buildPromptList(shots = []) {
  if (!shots.length) {
    return [{
      title: '准备开拍',
      shooting: '保持画面稳定，先拍环境再拍细节',
      camera: '慢速横移或固定机位',
      environment: '选择光线均匀、背景简洁的场景'
    }];
  }
  return shots.map((shot, index) => ({
    id: shot.id || `prompt-${index}`,
    title: shot.title || `镜头 ${index + 1}`,
    shooting: shot.tips || '注意主体清晰、构图留白',
    camera: shot.cameraMove || '固定机位',
    environment: shot.scene || '根据场景调整取景'
  }));
}

/** 由镜头计划生成分镜步骤 */
function buildStorySteps(shots = []) {
  if (!shots.length) {
    return [{
      id: 'step-1',
      order: 1,
      title: '环境交代',
      desc: '先拍全景建立场景',
      status: 'active'
    }];
  }
  return shots.map((shot, index) => ({
    id: shot.id || `step-${index}`,
    order: shot.order || index + 1,
    title: shot.title || `步骤 ${index + 1}`,
    desc: shot.scene || shot.tips || '',
    status: index === 0 ? 'active' : 'pending'
  }));
}

/** 点击某一步时更新 active / done / pending */
function setActiveStep(steps = [], activeIndex = 0) {
  return steps.map((step, index) => {
    const next = Object.assign({}, step);
    if (index < activeIndex) {
      next.status = 'done';
    } else if (index === activeIndex) {
      next.status = 'active';
    } else {
      next.status = 'pending';
    }
    return next;
  });
}

/** 页面 onShow 时触发进入动画（通过切换 class） */
function triggerPageEnter(pageVm) {
  if (!pageVm) {
    return;
  }
  pageVm.pageAnimClass = '';
  pageVm.$forceUpdate && pageVm.$forceUpdate();
  setTimeout(() => {
    pageVm.pageAnimClass = PAGE_ENTER_CLASS;
  }, 16);
}
var _default = exports["default"] = {
  DURATION_MS,
  DURATION_SLOW_MS,
  PAGE_ENTER_CLASS,
  PAGE_EXIT_CLASS,
  FADE_IN_CLASS,
  FADE_OUT_CLASS,
  SLIDE_UP_CLASS,
  CARD_LIFT_CLASS,
  CARD_EXIT_CLASS,
  nextIndex,
  buildPromptList,
  buildStorySteps,
  setActiveStep,
  triggerPageEnter
};

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

/***/ "./src/helper/store.js":
/*!*****************************!*\
  !*** ./src/helper/store.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
const state = {
  type: 'study',
  style: 'study',
  health: null,
  types: [],
  styles: [],
  shotPlan: null,
  materials: [],
  result: null
};
function setState(patch = {}) {
  Object.keys(patch).forEach(key => {
    state[key] = patch[key];
  });
  return state;
}
function resetFlow() {
  state.shotPlan = null;
  state.materials = [];
  state.result = null;
}
var _default = exports["default"] = {
  state,
  setState,
  resetFlow
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
  !*** ./src/pages/upload/index.ux?uxType=page ***!
  \***********************************************/
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/UploadZone/index.ux?uxType=comp&name=c-upload-zone */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/UploadZone/index.ux?uxType=comp&name=c-upload-zone")
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/MaterialCard/index.ux?uxType=comp&name=c-material-card */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/MaterialCard/index.ux?uxType=comp&name=c-material-card")
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/MaterialPreview/index.ux?uxType=comp&name=c-material-preview */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/MaterialPreview/index.ux?uxType=comp&name=c-material-preview")
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/Button/index.ux?uxType=comp&name=c-button */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/Button/index.ux?uxType=comp&name=c-button")
var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/upload/index.ux?uxType=page")
$app_define$('@app-component/index', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=page&importNames[]=c-upload-zone,importNames[]=c-material-card,importNames[]=c-material-preview,importNames[]=c-button */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/upload/index.ux?uxType=page&importNames[]=c-upload-zone,importNames[]=c-material-card,importNames[]=c-material-preview,importNames[]=c-button")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/upload/index.ux?uxType=page")
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