(function(){
    
    var createPageHandler = function() {
      return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/vlog-learn/index.ux?uxType=page":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/vlog-learn/index.ux?uxType=page ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _routes = _interopRequireDefault(__webpack_require__(/*! ../../helper/routes */ "./src/helper/routes.js"));
var _vlogGuide = __webpack_require__(/*! ../../helper/data/vlogGuide */ "./src/helper/data/vlogGuide.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function formatCells(cells = []) {
  return cells.map(c => `第 ${c} 格（${_vlogGuide.GRID_CELL_LABELS[c]}）`).join('、');
}
function pickSceneFields(scene) {
  return {
    sceneTitle: scene.title,
    sceneSubtitle: scene.subtitle,
    sceneSubjectCells: scene.subjectCells.slice(),
    sceneAccentCells: scene.accentCells.slice(),
    sceneAiPrompt: scene.aiPrompt,
    sceneGridSummary: scene.gridSummary,
    sceneSteps: scene.steps.slice(),
    subjectHint: formatCells(scene.subjectCells)
  };
}
const defaultScene = _vlogGuide.VLOG_SCENES[0];
const defaultFields = pickSceneFields(defaultScene);
var _default = exports.default = {
  private: {
    scenes: _vlogGuide.VLOG_SCENES,
    activeIndex: 0,
    activeId: defaultScene.id,
    sceneTitle: defaultFields.sceneTitle,
    sceneSubtitle: defaultFields.sceneSubtitle,
    sceneSubjectCells: defaultFields.sceneSubjectCells,
    sceneAccentCells: defaultFields.sceneAccentCells,
    sceneAiPrompt: defaultFields.sceneAiPrompt,
    sceneGridSummary: defaultFields.sceneGridSummary,
    sceneSteps: defaultFields.sceneSteps,
    subjectHint: defaultFields.subjectHint
  },
  goBack() {
    _routes.default.back();
  },
  onSceneSwipe(evt) {
    const index = evt && evt.index !== undefined ? Number(evt.index) : -1;
    if (index >= 0 && index < this.scenes.length) {
      this.selectScene(this.scenes[index].id, index);
    }
  },
  onSceneTap(evt) {
    const sceneId = this.resolveAttr(evt, 'scene');
    const sceneIndex = Number(this.resolveAttr(evt, 'index'));
    if (sceneId) {
      this.selectScene(sceneId, sceneIndex);
      return;
    }
    if (sceneIndex >= 0 && sceneIndex < this.scenes.length) {
      this.selectScene(this.scenes[sceneIndex].id, sceneIndex);
    }
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
  selectScene(id, indexHint) {
    const index = indexHint >= 0 ? indexHint : this.scenes.findIndex(item => item.id === id);
    const scene = index >= 0 ? this.scenes[index] : this.scenes[0];
    const fields = pickSceneFields(scene);
    this.activeIndex = index >= 0 ? index : 0;
    this.activeId = scene.id;
    this.sceneTitle = fields.sceneTitle;
    this.sceneSubtitle = fields.sceneSubtitle;
    this.sceneSubjectCells = fields.sceneSubjectCells;
    this.sceneAccentCells = fields.sceneAccentCells;
    this.sceneAiPrompt = fields.sceneAiPrompt;
    this.sceneGridSummary = fields.sceneGridSummary;
    this.sceneSteps = fields.sceneSteps;
    this.subjectHint = fields.subjectHint;
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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/GuideTip/index.ux?uxType=comp":
/*!*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/GuideTip/index.ux?uxType=comp ***!
  \*****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
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
      default: ''
    },
    description: {
      type: String,
      default: ''
    }
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/NineGridGuide/index.ux?uxType=comp":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/NineGridGuide/index.ux?uxType=comp ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    subjectCells: {
      type: Array,
      default: []
    },
    accentCells: {
      type: Array,
      default: []
    }
  },
  data: {
    rows: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  },
  isSubject(cell) {
    return (this.subjectCells || []).indexOf(cell) >= 0;
  },
  isAccent(cell) {
    return (this.accentCells || []).indexOf(cell) >= 0;
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/GuideTip/index.ux?uxType=comp":
/*!**********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/GuideTip/index.ux?uxType=comp ***!
  \**********************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-guide-tip": {
    "flexDirection": "row",
    "width": "100%",
    "paddingTop": "20px",
    "paddingRight": "20px",
    "paddingBottom": "20px",
    "paddingLeft": "20px",
    "borderRadius": "16px",
    "backgroundColor": "rgba(94,124,224,0.06)",
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "rgba(94,124,224,0.15)",
    "borderRightColor": "rgba(94,124,224,0.15)",
    "borderBottomColor": "rgba(94,124,224,0.15)",
    "borderLeftColor": "rgba(94,124,224,0.15)"
  },
  ".c-guide-tip-icon": {
    "width": "56px",
    "height": "56px",
    "borderRadius": "14px",
    "backgroundColor": "rgba(94,124,224,0.14)",
    "textAlign": "center",
    "fontSize": "28px",
    "paddingTop": "8px",
    "marginRight": "16px"
  },
  ".c-guide-tip-body": {
    "flex": 1,
    "flexDirection": "column"
  },
  ".c-guide-tip-title": {
    "fontSize": "26px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".c-guide-tip-desc": {
    "fontSize": "22px",
    "color": "#5b6b7f",
    "marginTop": "6px",
    "lineHeight": "34px",
    "width": "100%"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/NineGridGuide/index.ux?uxType=comp":
/*!***************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/NineGridGuide/index.ux?uxType=comp ***!
  \***************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-nine-grid": {
    "flexDirection": "column",
    "width": "100%"
  },
  ".c-nine-grid-frame": {
    "width": "100%",
    "height": "560px",
    "borderRadius": "20px",
    "overflow": "hidden",
    "backgroundColor": "#111111",
    "flexDirection": "column"
  },
  ".c-nine-grid-row": {
    "flex": 1,
    "flexDirection": "row",
    "width": "100%",
    "height": "0px"
  },
  ".c-nine-grid-cell": {
    "flex": 1,
    "height": "100%",
    "borderTopWidth": "1px",
    "borderRightWidth": "1px",
    "borderBottomWidth": "1px",
    "borderLeftWidth": "1px",
    "borderTopColor": "rgba(255,255,255,0.25)",
    "borderRightColor": "rgba(255,255,255,0.25)",
    "borderBottomColor": "rgba(255,255,255,0.25)",
    "borderLeftColor": "rgba(255,255,255,0.25)",
    "backgroundColor": "rgba(255,255,255,0.05)",
    "position": "relative"
  },
  ".c-nine-grid-cell-subject": {
    "backgroundColor": "rgba(94,124,224,0.45)"
  },
  ".c-nine-grid-cell-accent": {
    "backgroundColor": "rgba(255,179,87,0.2)"
  },
  ".c-nine-grid-num": {
    "position": "absolute",
    "left": "8px",
    "top": "8px",
    "fontSize": "18px",
    "color": "rgba(255,255,255,0.7)"
  },
  ".c-nine-grid-tag": {
    "position": "absolute",
    "left": "0px",
    "right": "0px",
    "top": "0px",
    "bottom": "0px",
    "textAlign": "center",
    "paddingTop": "56px",
    "fontSize": "20px",
    "color": "#ffffff",
    "fontWeight": "bold"
  },
  ".c-nine-grid-tag-accent": {
    "position": "absolute",
    "right": "8px",
    "bottom": "8px",
    "fontSize": "16px",
    "color": "rgba(255,255,255,0.7)"
  },
  ".c-nine-grid-legend": {
    "flexDirection": "row",
    "flexWrap": "wrap",
    "marginTop": "12px",
    "width": "100%"
  },
  ".c-nine-grid-legend-item": {
    "fontSize": "20px",
    "color": "#8b9097",
    "marginRight": "24px",
    "marginBottom": "4px"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/vlog-learn/index.ux?uxType=page":
/*!*******************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/vlog-learn/index.ux?uxType=page ***!
  \*******************************************************************************************************************************************************************************************************************************************************************/
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
  ".vlog-page": {
    "flexDirection": "column",
    "flex": 1,
    "width": "100%",
    "backgroundColor": "#f7f9fc"
  },
  ".vlog-header": {
    "flexDirection": "row",
    "alignItems": "center",
    "justifyContent": "space-between",
    "paddingTop": "20px",
    "paddingRight": "32px",
    "paddingBottom": "16px",
    "paddingLeft": "32px",
    "backgroundColor": "rgba(247,249,252,0.92)"
  },
  ".vlog-header-title": {
    "flex": 1,
    "textAlign": "center",
    "fontSize": "30px",
    "fontWeight": "bold",
    "color": "#2c3e50"
  },
  ".vlog-header-placeholder": {
    "opacity": 0
  },
  ".vlog-scroll": {
    "flex": 1,
    "width": "100%"
  },
  ".vlog-block": {
    "width": "100%",
    "paddingLeft": "32px",
    "paddingRight": "32px"
  },
  ".vlog-tip-icon": {
    "width": "80px",
    "height": "80px",
    "borderRadius": "20px",
    "backgroundColor": "#5e7ce0",
    "color": "#ffffff",
    "fontSize": "36px",
    "textAlign": "center",
    "paddingTop": "16px",
    "marginRight": "20px"
  },
  ".vlog-tip-main": {
    "flex": 1,
    "flexDirection": "column",
    "width": "100%"
  },
  ".vlog-tip-title": {
    "fontSize": "28px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "width": "100%"
  },
  ".vlog-tip-desc": {
    "fontSize": "24px",
    "color": "#5b6b7f",
    "marginTop": "8px",
    "lineHeight": "36px",
    "width": "100%"
  },
  ".vlog-scenes-block": {
    "paddingLeft": "0px",
    "paddingRight": "0px"
  },
  ".vlog-scene-swiper": {
    "width": "100%",
    "height": "176px"
  },
  ".vlog-scene-slide": {
    "width": "100%",
    "height": "100%",
    "alignItems": "center",
    "justifyContent": "center",
    "paddingTop": "0px",
    "paddingRight": "8px",
    "paddingBottom": "0px",
    "paddingLeft": "8px"
  },
  ".vlog-scene-slide .web-scene-chip": {
    "width": "280px",
    "height": "148px",
    "paddingTop": "20px",
    "paddingRight": "20px",
    "paddingBottom": "20px",
    "paddingLeft": "20px",
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
    "flexShrink": 0,
    "_meta": {
      "ruleDef": [
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "vlog-scene-slide"
        },
        {
          "t": "d"
        },
        {
          "t": "a",
          "n": "class",
          "i": false,
          "a": "element",
          "v": "web-scene-chip"
        }
      ]
    }
  },
  ".scene-text-active": {
    "color": "#ffffff"
  },
  ".scene-sub-active": {
    "color": "rgba(255,255,255,0.85)"
  },
  ".vlog-dots-row": {
    "flexDirection": "row",
    "justifyContent": "center",
    "alignItems": "center",
    "paddingTop": "8px",
    "paddingBottom": "20px"
  },
  ".vlog-dot": {
    "width": "12px",
    "height": "12px",
    "borderRadius": "6px",
    "backgroundColor": "#e8ecf2",
    "marginLeft": "8px",
    "marginRight": "8px"
  },
  ".vlog-dot-active": {
    "width": "40px",
    "backgroundColor": "#5e7ce0"
  },
  ".vlog-detail-card": {
    "width": "100%",
    "paddingTop": "24px",
    "paddingRight": "24px",
    "paddingBottom": "24px",
    "paddingLeft": "24px",
    "borderRadius": "20px",
    "backgroundColor": "#ffffff",
    "flexDirection": "column"
  },
  ".vlog-detail-head": {
    "flexDirection": "row",
    "alignItems": "center",
    "marginBottom": "20px",
    "width": "100%"
  },
  ".vlog-detail-icon": {
    "fontSize": "32px",
    "marginRight": "12px"
  },
  ".vlog-detail-head-main": {
    "flex": 1,
    "flexDirection": "column",
    "width": "100%"
  },
  ".vlog-detail-title": {
    "fontSize": "32px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "width": "100%"
  },
  ".vlog-detail-sub": {
    "fontSize": "24px",
    "color": "#8b9097",
    "marginTop": "4px",
    "width": "100%"
  },
  ".vlog-guide-wrap": {
    "width": "100%",
    "marginTop": "20px",
    "marginBottom": "20px"
  },
  ".vlog-grid-wrap": {
    "width": "100%"
  },
  ".web-compose-box": {
    "width": "100%",
    "paddingTop": "16px",
    "paddingRight": "16px",
    "paddingBottom": "16px",
    "paddingLeft": "16px",
    "borderRadius": "12px",
    "backgroundColor": "#f7f9fc",
    "marginTop": "20px",
    "marginBottom": "16px",
    "flexDirection": "column"
  },
  ".compose-title": {
    "fontSize": "24px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "width": "100%"
  },
  ".compose-body": {
    "fontSize": "24px",
    "color": "#5b6b7f",
    "marginTop": "8px",
    "lineHeight": "36px",
    "width": "100%"
  },
  ".compose-hint": {
    "fontSize": "20px",
    "color": "#8b9097",
    "marginTop": "12px",
    "width": "100%"
  },
  ".vlog-step-row": {
    "flexDirection": "row",
    "alignItems": "flex-start",
    "width": "100%",
    "marginBottom": "12px"
  },
  ".vlog-step-num": {
    "width": "40px",
    "height": "40px",
    "borderRadius": "20px",
    "backgroundColor": "rgba(94,124,224,0.1)",
    "color": "#5e7ce0",
    "textAlign": "center",
    "fontSize": "20px",
    "paddingTop": "6px",
    "marginRight": "12px"
  },
  ".vlog-step-text": {
    "flex": 1,
    "fontSize": "24px",
    "color": "#5b6b7f",
    "lineHeight": "36px",
    "marginTop": "4px",
    "width": "100%"
  },
  ".vlog-spacer": {
    "height": "48px"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/GuideTip/index.ux?uxType=comp&":
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/GuideTip/index.ux?uxType=comp& ***!
  \*******************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "c-guide-tip"
  ],
  "children": [
    {
      "type": "text",
      "attr": {
        "value": "💡"
      },
      "classList": [
        "c-guide-tip-icon"
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-guide-tip-body"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": function () {return this.title}
          },
          "classList": [
            "c-guide-tip-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.description}
          },
          "classList": [
            "c-guide-tip-desc"
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/NineGridGuide/index.ux?uxType=comp&":
/*!************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/NineGridGuide/index.ux?uxType=comp& ***!
  \************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "c-nine-grid"
  ],
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-nine-grid-frame"
      ],
      "children": [
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.rows},
            "key": "rowIndex",
            "value": "row"
          },
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "c-nine-grid-row"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.row},
                    "key": "cellIndex",
                    "value": "cell"
                  },
                  "children": [
                    {
                      "type": "div",
                      "attr": {},
                      "classList": function () {return ['c-nine-grid-cell', this.isSubject(this.cell)?'c-nine-grid-cell-subject':'', this.isAccent(this.cell)?'c-nine-grid-cell-accent':'']},
                      "children": [
                        {
                          "type": "text",
                          "attr": {
                            "value": function () {return this.cell}
                          },
                          "classList": [
                            "c-nine-grid-num"
                          ]
                        },
                        {
                          "type": "text",
                          "attr": {
                            "value": "主体"
                          },
                          "classList": [
                            "c-nine-grid-tag"
                          ],
                          "shown": function () {return this.isSubject(this.cell)}
                        },
                        {
                          "type": "text",
                          "attr": {
                            "value": "留白"
                          },
                          "classList": [
                            "c-nine-grid-tag-accent"
                          ],
                          "shown": function () {return this.isAccent(this.cell)&&!this.isSubject(this.cell)}
                        }
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
        "c-nine-grid-legend"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": "■ 放置主体"
          },
          "classList": [
            "c-nine-grid-legend-item"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "■ 留白 / 字幕区"
          },
          "classList": [
            "c-nine-grid-legend-item"
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/vlog-learn/index.ux?uxType=page&importNames[]=c-nine-grid,importNames[]=c-guide-tip":
/*!*******************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/vlog-learn/index.ux?uxType=page&importNames[]=c-nine-grid,importNames[]=c-guide-tip ***!
  \*******************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "vlog-page"
  ],
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "vlog-header"
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
            "value": "学习 Vlog"
          },
          "classList": [
            "vlog-header-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "‹"
          },
          "classList": [
            "web-back-btn",
            "vlog-header-placeholder"
          ]
        }
      ]
    },
    {
      "type": "list",
      "attr": {},
      "classList": [
        "vlog-scroll"
      ],
      "children": [
        {
          "type": "list-item",
          "attr": {
            "type": "tip"
          },
          "classList": [
            "vlog-block"
          ],
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "web-vlog-tip-card"
              ],
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": "✦"
                  },
                  "classList": [
                    "vlog-tip-icon"
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "vlog-tip-main"
                  ],
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "value": "AI 导拍提示"
                      },
                      "classList": [
                        "vlog-tip-title"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": " 打开手机相机网格线，对照下方九宫格放置人物或景物。编号从左到右、从上到下为 1-9。 "
                      },
                      "classList": [
                        "vlog-tip-desc"
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "list-item",
          "attr": {
            "type": "scenes-title"
          },
          "classList": [
            "vlog-block"
          ],
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "web-section-head"
              ],
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": "拍摄场景"
                  },
                  "classList": [
                    "web-section-title"
                  ]
                },
                {
                  "type": "text",
                  "attr": {
                    "value": "左右滑动选择"
                  },
                  "classList": [
                    "web-section-link"
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "list-item",
          "attr": {
            "type": "scenes"
          },
          "classList": [
            "vlog-block",
            "vlog-scenes-block"
          ],
          "children": [
            {
              "type": "swiper",
              "attr": {
                "index": function () {return this.activeIndex},
                "previousmargin": "24px",
                "nextmargin": "24px",
                "indicator": "false"
              },
              "classList": [
                "vlog-scene-swiper"
              ],
              "events": {
                "change": "onSceneSwipe"
              },
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.scenes},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "div",
                      "attr": {
                        "dataIndex": function () {return this.index},
                        "dataScene": function () {return this.item.id}
                      },
                      "classList": [
                        "vlog-scene-slide"
                      ],
                      "events": {
                        "click": "onSceneTap"
                      },
                      "children": [
                        {
                          "type": "div",
                          "attr": {},
                          "classList": function () {return ['web-scene-chip', this.activeIndex===this.index?'web-scene-chip-active':'']},
                          "children": [
                            {
                              "type": "text",
                              "attr": {
                                "value": function () {return this.item.title}
                              },
                              "classList": function () {return ['web-scene-chip-title', this.activeIndex===this.index?'scene-text-active':'']}
                            },
                            {
                              "type": "text",
                              "attr": {
                                "value": function () {return this.item.subtitle}
                              },
                              "classList": function () {return ['web-scene-chip-sub', this.activeIndex===this.index?'scene-sub-active':'']}
                            }
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
          "type": "list-item",
          "attr": {
            "type": "dots"
          },
          "classList": [
            "vlog-block",
            "vlog-dots-row"
          ],
          "children": [
            {
              "type": "block",
              "attr": {},
              "repeat": {
                "exp": function () {return this.scenes},
                "key": "index",
                "value": "item"
              },
              "children": [
                {
                  "type": "div",
                  "attr": {
                    "dataScene": function () {return this.item.id},
                    "dataIndex": function () {return this.index}
                  },
                  "classList": function () {return ['vlog-dot', this.activeIndex===this.index?'vlog-dot-active':'']},
                  "events": {
                    "click": "onSceneTap"
                  }
                }
              ]
            }
          ]
        },
        {
          "type": "list-item",
          "attr": {
            "type": "detail"
          },
          "classList": [
            "vlog-block"
          ],
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "vlog-detail-card"
              ],
              "shown": function () {return this.activeId},
              "children": [
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "vlog-detail-head"
                  ],
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "value": "🎬"
                      },
                      "classList": [
                        "vlog-detail-icon"
                      ]
                    },
                    {
                      "type": "div",
                      "attr": {},
                      "classList": [
                        "vlog-detail-head-main"
                      ],
                      "children": [
                        {
                          "type": "text",
                          "attr": {
                            "value": function () {return this.sceneTitle}
                          },
                          "classList": [
                            "vlog-detail-title"
                          ]
                        },
                        {
                          "type": "text",
                          "attr": {
                            "value": function () {return this.sceneSubtitle}
                          },
                          "classList": [
                            "vlog-detail-sub"
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
                    "vlog-grid-wrap"
                  ],
                  "children": [
                    {
                      "type": "c-nine-grid",
                      "attr": {
                        "key": function () {return this.activeId},
                        "subjectCells": function () {return this.sceneSubjectCells},
                        "accentCells": function () {return this.sceneAccentCells}
                      }
                    }
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "vlog-guide-wrap"
                  ],
                  "children": [
                    {
                      "type": "c-guide-tip",
                      "attr": {
                        "title": "AI 导播",
                        "description": function () {return this.sceneAiPrompt}
                      }
                    }
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "web-compose-box"
                  ],
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "value": "构图要点"
                      },
                      "classList": [
                        "compose-title"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": function () {return this.sceneGridSummary}
                      },
                      "classList": [
                        "compose-body"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": function () {return '' + '建议主体：' + (this.subjectHint)}
                      },
                      "classList": [
                        "compose-hint"
                      ]
                    }
                  ]
                },
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.sceneSteps},
                    "key": "index",
                    "value": "step"
                  },
                  "children": [
                    {
                      "type": "div",
                      "attr": {},
                      "classList": [
                        "vlog-step-row"
                      ],
                      "children": [
                        {
                          "type": "text",
                          "attr": {
                            "value": function () {return this.index+1}
                          },
                          "classList": [
                            "vlog-step-num"
                          ]
                        },
                        {
                          "type": "text",
                          "attr": {
                            "value": function () {return this.step}
                          },
                          "classList": [
                            "vlog-step-text"
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
          "type": "list-item",
          "attr": {
            "type": "spacer"
          },
          "classList": [
            "vlog-spacer"
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/GuideTip/index.ux?uxType=comp&name=c-guide-tip":
/*!********************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/GuideTip/index.ux?uxType=comp&name=c-guide-tip ***!
  \********************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/GuideTip/index.ux?uxType=comp")
$app_define$('@app-component/c-guide-tip', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/GuideTip/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/GuideTip/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/NineGridGuide/index.ux?uxType=comp&name=c-nine-grid":
/*!*************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/NineGridGuide/index.ux?uxType=comp&name=c-nine-grid ***!
  \*************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/NineGridGuide/index.ux?uxType=comp")
$app_define$('@app-component/c-nine-grid', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/NineGridGuide/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/NineGridGuide/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./src/helper/data/vlogGuide.js":
/*!**************************************!*\
  !*** ./src/helper/data/vlogGuide.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.VLOG_SCENES = exports.GRID_CELL_LABELS = void 0;
const GRID_CELL_LABELS = exports.GRID_CELL_LABELS = {
  1: '左上',
  2: '中上',
  3: '右上',
  4: '左中',
  5: '正中',
  6: '右中',
  7: '左下',
  8: '中下',
  9: '右下'
};
const VLOG_SCENES = exports.VLOG_SCENES = [{
  id: 'intro',
  title: '人物开场',
  subtitle: '对着镜头介绍行程、打招呼',
  subjectCells: [4],
  accentCells: [6, 3],
  gridSummary: '人物放在第 4 格（左中），视线朝向右侧留白；字幕可放在第 3、6 格区域。',
  aiPrompt: '将人物置于画面左侧三分线（第 4 格），头部接近上三分之一线，右侧留出 1/3 空间用于字幕或 B-roll。',
  steps: ['手机竖屏持稳，与眼睛平齐或略低 10°', '人物占画面高度约 1/2，不要顶满上沿', '看镜头时身体略侧，给右侧留出「呼吸感」', '连拍 3–5 秒，后期可接地图或车票转场']
}, {
  id: 'landscape',
  title: '风景转场',
  subtitle: '山川、海景、城市天际线',
  subjectCells: [7, 8, 9],
  accentCells: [1, 2, 3],
  gridSummary: '地平线压在第 7–9 格上沿（下方 1/3）；天空占第 1–3 格，避免天空过少。',
  aiPrompt: '地平线对齐下方三分之一线（第 7 格上沿），主体景物落在 7–9 格；若有大面积天空，让云层分布在 1–3 格。',
  steps: ['开启网格线，先找地平线再按快门', '避免地平线切在正中间（第 5 格横线）', '前景（礁石、栏杆）可占 8–9 格增加层次', '横屏拍摄更适合风光，竖屏可上下缓慢摇镜']
}, {
  id: 'walk',
  title: '行走跟拍',
  subtitle: '边走边聊、街景漫步',
  subjectCells: [5, 8],
  accentCells: [2],
  gridSummary: '人物在 5、8 格略偏下；头顶保留第 2 格空间，避免裁切发际。',
  aiPrompt: '人物居中略偏下（第 5、8 格），上方第 2 格留空；镜头与人物保持 1.5 米，缓慢后退跟拍。',
  steps: ['后置镜头 + 稳定器或双手握持肘部贴身体', '人物走路方向朝向画面一侧，不要直冲镜头', '背景线条（街道、廊柱）尽量与网格线平行', '每段 8–12 秒，后期用速度曲线做轻微慢动作']
}, {
  id: 'food',
  title: '美食 / 物品特写',
  subtitle: '餐桌、咖啡、手作细节',
  subjectCells: [5],
  accentCells: [2, 8],
  gridSummary: '主体居中（第 5 格），上方留白放店名或字幕；俯拍时主体可占 5、8 格。',
  aiPrompt: '美食主体置于第 5 格中心，俯拍 45°；背景虚化，第 2 格可放标题字幕。',
  steps: ['靠近主体，用 2x 微距或人像模式', '盘子边缘对齐网格，不要切出画面', '暖色光源从侧面 45° 打亮食物', '每个菜品 3–5 秒，后期加速拼接']
}];
var _default = exports["default"] = {
  GRID_CELL_LABELS,
  VLOG_SCENES
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
/*!***************************************************!*\
  !*** ./src/pages/vlog-learn/index.ux?uxType=page ***!
  \***************************************************/
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/NineGridGuide/index.ux?uxType=comp&name=c-nine-grid */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/NineGridGuide/index.ux?uxType=comp&name=c-nine-grid")
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/GuideTip/index.ux?uxType=comp&name=c-guide-tip */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/GuideTip/index.ux?uxType=comp&name=c-guide-tip")
var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/vlog-learn/index.ux?uxType=page")
$app_define$('@app-component/index', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=page&importNames[]=c-nine-grid,importNames[]=c-guide-tip */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/vlog-learn/index.ux?uxType=page&importNames[]=c-nine-grid,importNames[]=c-guide-tip")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/vlog-learn/index.ux?uxType=page")
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