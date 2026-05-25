(function(){
    
    var createPageHandler = function() {
      return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/generate/index.ux?uxType=page":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/generate/index.ux?uxType=page ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _system = _interopRequireDefault($app_require$("@app-module/system.router"));
var _vlog = _interopRequireDefault(__webpack_require__(/*! ../../helper/apis/vlog */ "./src/helper/apis/vlog.js"));
var _store = _interopRequireDefault(__webpack_require__(/*! ../../helper/store */ "./src/helper/store.js"));
var _utils = _interopRequireDefault(__webpack_require__(/*! ../../helper/utils */ "./src/helper/utils.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports.default = {
  private: {
    loading: false,
    statusText: '准备生成',
    result: null,
    steps: [],
    timeline: []
  },
  onInit() {
    this.$page.setTitleBar({
      text: '生成'
    });
    this.generate();
  },
  generate() {
    this.loading = true;
    this.statusText = '正在调用生成接口...';
    _vlog.default.generateVlog({
      type: _store.default.state.type || 'study',
      style: _store.default.state.style || 'study',
      shotPlan: _store.default.state.shotPlan,
      materials: _store.default.state.materials || []
    }).then(result => {
      this.result = result;
      this.steps = result.steps || [];
      this.timeline = result.timeline || [];
      this.statusText = '生成完成';
      _store.default.setState({
        result
      });
    }).catch(() => {
      this.statusText = '生成失败';
      _utils.default.showToast('生成失败');
    }).finally(() => {
      this.loading = false;
    });
  },
  goPreview() {
    if (!_store.default.state.result) {
      _utils.default.showToast('还没有生成结果');
      return;
    }
    _system.default.push({
      uri: '/pages/preview'
    });
  },
  goUpload() {
    _system.default.push({
      uri: '/pages/upload'
    });
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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/generate/index.ux?uxType=page":
/*!*****************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/generate/index.ux?uxType=page ***!
  \*****************************************************************************************************************************************************************************************************************************************************************/
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
  ".page": {
    "flexDirection": "column",
    "paddingTop": "32px",
    "paddingRight": "32px",
    "paddingBottom": "32px",
    "paddingLeft": "32px",
    "backgroundColor": "#f7f8f5"
  },
  ".top": {
    "flexDirection": "column",
    "marginBottom": "22px"
  },
  ".heading": {
    "fontSize": "38px",
    "fontWeight": "bold",
    "color": "#12181f",
    "marginBottom": "10px"
  },
  ".hint": {
    "fontSize": "24px",
    "color": "#7c838b"
  },
  ".loading": {
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "minHeight": "260px",
    "paddingTop": "32px",
    "paddingRight": "32px",
    "paddingBottom": "32px",
    "paddingLeft": "32px",
    "borderRadius": "10px",
    "backgroundColor": "#ffffff",
    "marginBottom": "22px"
  },
  ".loading-title": {
    "fontSize": "34px",
    "color": "#12181f",
    "marginBottom": "12px"
  },
  ".loading-text": {
    "fontSize": "24px",
    "color": "#7c838b",
    "textAlign": "center"
  },
  ".result": {
    "flexDirection": "column",
    "paddingTop": "26px",
    "paddingRight": "26px",
    "paddingBottom": "26px",
    "paddingLeft": "26px",
    "borderRadius": "10px",
    "backgroundColor": "#ffffff",
    "marginBottom": "20px"
  },
  ".result-title": {
    "fontSize": "32px",
    "fontWeight": "bold",
    "color": "#12181f",
    "marginBottom": "10px"
  },
  ".result-meta": {
    "fontSize": "23px",
    "color": "#456b86",
    "marginBottom": "16px"
  },
  ".narration": {
    "fontSize": "24px",
    "lineHeight": "36px",
    "color": "#5c646d"
  },
  ".steps": {
    "flexDirection": "column",
    "marginBottom": "20px"
  },
  ".step": {
    "flexDirection": "row",
    "alignItems": "center",
    "paddingTop": "18px",
    "paddingRight": "22px",
    "paddingBottom": "18px",
    "paddingLeft": "22px",
    "marginBottom": "12px",
    "borderRadius": "10px",
    "backgroundColor": "#ffffff"
  },
  ".step-index": {
    "width": "40px",
    "height": "40px",
    "borderRadius": "20px",
    "textAlign": "center",
    "backgroundColor": "#2f6f58",
    "color": "#ffffff",
    "fontSize": "22px"
  },
  ".step-main": {
    "flex": 1,
    "flexDirection": "column",
    "marginLeft": "16px"
  },
  ".step-name": {
    "fontSize": "26px",
    "color": "#12181f"
  },
  ".step-desc": {
    "fontSize": "21px",
    "color": "#8a9098"
  },
  ".step-status": {
    "fontSize": "22px",
    "color": "#2f6f58"
  },
  ".subheading": {
    "fontSize": "30px",
    "fontWeight": "bold",
    "color": "#12181f",
    "marginBottom": "14px"
  },
  ".timeline": {
    "flexDirection": "column",
    "marginBottom": "22px"
  },
  ".timeline-item": {
    "flexDirection": "row",
    "paddingTop": "18px",
    "paddingRight": "20px",
    "paddingBottom": "18px",
    "paddingLeft": "20px",
    "marginBottom": "12px",
    "borderRadius": "10px",
    "backgroundColor": "#ffffff"
  },
  ".timeline-order": {
    "width": "42px",
    "color": "#2f6f58",
    "fontSize": "26px"
  },
  ".timeline-main": {
    "flex": 1,
    "flexDirection": "column"
  },
  ".timeline-title": {
    "fontSize": "25px",
    "color": "#12181f",
    "marginBottom": "6px"
  },
  ".timeline-meta": {
    "fontSize": "21px",
    "color": "#8a9098"
  },
  ".actions": {
    "flexDirection": "column"
  },
  ".btn": {
    "height": "70px",
    "marginBottom": "16px",
    "borderRadius": "10px",
    "backgroundColor": "#e9ebee",
    "color": "#111111",
    "fontSize": "29px"
  },
  ".primary": {
    "backgroundColor": "#2f6f58",
    "color": "#ffffff"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/generate/index.ux?uxType=page&":
/*!**************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/generate/index.ux?uxType=page& ***!
  \**************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "page"
  ],
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "top"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "生成 Vlog"
          },
          "classList": [
            "heading"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.statusText}
          },
          "classList": [
            "hint"
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "loading"
      ],
      "shown": function () {return this.loading},
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "生成中..."
          },
          "classList": [
            "loading-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "正在按镜头计划排序素材、套用模板和配乐。"
          },
          "classList": [
            "loading-text"
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "result"
      ],
      "shown": function () {return !this.loading&&this.result},
      "children": [
        {
          "type": "text",
          "attr": {
            "value": function () {return this.result.title}
          },
          "classList": [
            "result-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return '' + (this.result.exportConfig.ratio) + ' / ' + (this.result.exportConfig.resolution) + ' / ' + (this.result.exportConfig.duration) + 's'}
          },
          "classList": [
            "result-meta"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.result.narration}
          },
          "classList": [
            "narration"
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "steps"
      ],
      "shown": function () {return !this.loading&&this.steps.length},
      "children": [
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.steps},
            "key": "index",
            "value": "step"
          },
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "step"
              ],
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.index+1}
                  },
                  "classList": [
                    "step-index"
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "step-main"
                  ],
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "value": function () {return this.step.name}
                      },
                      "classList": [
                        "step-name"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": function () {return this.step.template||this.step.bgm||this.step.count}
                      },
                      "classList": [
                        "step-desc"
                      ]
                    }
                  ]
                },
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.step.status}
                  },
                  "classList": [
                    "step-status"
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
      "attr": {},
      "classList": [
        "timeline"
      ],
      "shown": function () {return !this.loading&&this.timeline.length},
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "时间线"
          },
          "classList": [
            "subheading"
          ]
        },
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.timeline},
            "key": "index",
            "value": "item"
          },
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "timeline-item"
              ],
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.item.order}
                  },
                  "classList": [
                    "timeline-order"
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "timeline-main"
                  ],
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "value": function () {return this.item.shotTitle}
                      },
                      "classList": [
                        "timeline-title"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": function () {return '' + (this.item.materialName) + ' / ' + (this.item.transition) + ' / ' + (this.item.duration) + 's'}
                      },
                      "classList": [
                        "timeline-meta"
                      ]
                    }
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
      "attr": {},
      "classList": [
        "actions"
      ],
      "children": [
        {
          "type": "input",
          "attr": {
            "type": "button",
            "value": "预览结果"
          },
          "classList": [
            "btn",
            "primary"
          ],
          "events": {
            "click": "goPreview"
          }
        },
        {
          "type": "input",
          "attr": {
            "type": "button",
            "value": "重新生成"
          },
          "classList": [
            "btn"
          ],
          "events": {
            "click": "generate"
          }
        },
        {
          "type": "input",
          "attr": {
            "type": "button",
            "value": "返回上传素材"
          },
          "classList": [
            "btn"
          ],
          "events": {
            "click": "goUpload"
          }
        }
      ]
    }
  ]
}

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
/*!*************************************************!*\
  !*** ./src/pages/generate/index.ux?uxType=page ***!
  \*************************************************/

var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/generate/index.ux?uxType=page")
$app_define$('@app-component/index', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=page& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/generate/index.ux?uxType=page&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/generate/index.ux?uxType=page")
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