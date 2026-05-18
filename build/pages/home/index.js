(function(){
    
    var createPageHandler = function() {
      return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/home/index.ux?uxType=page":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/home/index.ux?uxType=page ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _routes = _interopRequireDefault(__webpack_require__(/*! ../../helper/routes */ "./src/helper/routes.js"));
var _memories = __webpack_require__(/*! ../../helper/data/memories */ "./src/helper/data/memories.js");
var _utils = _interopRequireDefault(__webpack_require__(/*! ../../helper/utils */ "./src/helper/utils.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports.default = {
  private: {
    safeBottom: 0,
    heroCover: _memories.HERO_COVER,
    memoryItems: _memories.MEMORY_ITEMS
  },
  onInit() {
    const inset = this.$page && this.$page.safeAreaInsets;
    this.safeBottom = inset && inset.bottom ? inset.bottom : 0;
  },
  onShow() {},
  onSearch() {
    _utils.default.showToast('搜索功能开发中');
  },
  onViewAll() {
    _utils.default.showToast('查看全部回忆');
  },
  goCreate() {
    _routes.default.push('create');
  },
  goVlogLearn() {
    _routes.default.push('vlogLearn');
  },
  onMemoryClick() {
    _routes.default.push('create');
  },
  onTabChange(evt) {
    const tab = evt.detail.tab;
    if (tab === 'create') {
      _routes.default.push('create');
      return;
    }
    if (tab === 'home') {
      return;
    }
    const label = tab === 'garden' ? '记忆花园' : '我的';
    _utils.default.showToast(`${label}即将开放`);
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

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/BottomNav/index.ux?uxType=comp":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/BottomNav/index.ux?uxType=comp ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    active: {
      type: String,
      default: 'home'
    },
    gardenBadge: {
      type: Number,
      default: 0
    },
    safeBottom: {
      type: Number,
      default: 0
    }
  },
  data: {
    tabs: [{
      id: 'home',
      label: '首页',
      icon: '⌂'
    }, {
      id: 'create',
      label: '创作',
      icon: '＋'
    }, {
      id: 'garden',
      label: '花园',
      icon: '✿'
    }, {
      id: 'profile',
      label: '我的',
      icon: '☺'
    }]
  },
  onTabTap(evt) {
    const tab = evt.target.attr.tab;
    this.$emit('change', {
      tab
    });
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MemoryCard/index.ux?uxType=comp":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MemoryCard/index.ux?uxType=comp ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = exports.default = {
  props: {
    item: {
      type: Object,
      default: {}
    }
  },
  handleTap() {
    this.$emit('click', {
      item: this.item
    });
  }
};}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/BottomNav/index.ux?uxType=comp":
/*!***********************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/BottomNav/index.ux?uxType=comp ***!
  \***********************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-bottom-nav": {
    "width": "100%",
    "backgroundColor": "rgba(255,255,255,0.95)",
    "borderTopWidth": "1px",
    "borderTopColor": "rgba(232,236,242,0.8)"
  },
  ".c-bottom-nav-inner": {
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center",
    "width": "100%",
    "paddingTop": "12px",
    "paddingRight": "24px",
    "paddingBottom": "16px",
    "paddingLeft": "24px"
  },
  ".c-bottom-nav-item": {
    "width": "25%",
    "flexDirection": "column",
    "alignItems": "center",
    "justifyContent": "center",
    "paddingTop": "8px",
    "paddingRight": "0px",
    "paddingBottom": "8px",
    "paddingLeft": "0px",
    "position": "relative"
  },
  ".c-bottom-nav-icon": {
    "width": "48px",
    "height": "48px",
    "fontSize": "40px",
    "color": "#8b9097",
    "textAlign": "center",
    "marginBottom": "6px"
  },
  ".c-bottom-nav-icon-active": {
    "color": "#5e7ce0"
  },
  ".c-bottom-nav-label": {
    "fontSize": "18px",
    "color": "#8b9097",
    "textAlign": "center",
    "lines": 1,
    "textOverflow": "ellipsis"
  },
  ".c-bottom-nav-label-active": {
    "color": "#5e7ce0",
    "fontWeight": "bold"
  },
  ".c-bottom-nav-badge": {
    "position": "absolute",
    "right": "12px",
    "top": "0px",
    "minWidth": "32px",
    "height": "32px",
    "borderRadius": "16px",
    "backgroundColor": "#ffb357",
    "color": "#ffffff",
    "fontSize": "18px",
    "textAlign": "center",
    "paddingTop": "0px",
    "paddingRight": "8px",
    "paddingBottom": "0px",
    "paddingLeft": "8px"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MemoryCard/index.ux?uxType=comp":
/*!************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MemoryCard/index.ux?uxType=comp ***!
  \************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  ".c-memory-card": {
    "width": "331px",
    "marginBottom": "24px",
    "borderRadius": "16px",
    "backgroundColor": "#ffffff",
    "overflow": "hidden"
  },
  ".c-memory-cover-wrap": {
    "width": "100%",
    "height": "248px"
  },
  ".c-memory-cover": {
    "width": "100%",
    "height": "248px",
    "objectFit": "cover"
  },
  ".c-memory-cover-mask": {
    "position": "absolute",
    "left": "0px",
    "right": "0px",
    "bottom": "0px",
    "height": "120px",
    "background": "{\"values\":[{\"type\":\"linearGradient\",\"directions\":[\"to\",\"top\"],\"values\":[\"rgba(0,0,0,0.45)\",\"rgba(0,0,0,0)\"]}]}"
  },
  ".c-memory-duration": {
    "position": "absolute",
    "right": "16px",
    "bottom": "16px",
    "paddingTop": "4px",
    "paddingRight": "12px",
    "paddingBottom": "4px",
    "paddingLeft": "12px",
    "borderRadius": "8px",
    "backgroundColor": "rgba(0,0,0,0.5)",
    "color": "#ffffff",
    "fontSize": "20px"
  },
  ".c-memory-play": {
    "position": "absolute",
    "left": "16px",
    "bottom": "16px",
    "width": "48px",
    "height": "48px",
    "borderRadius": "24px",
    "backgroundColor": "rgba(255,255,255,0.25)",
    "color": "#ffffff",
    "fontSize": "20px",
    "textAlign": "center",
    "paddingTop": "10px"
  },
  ".c-memory-body": {
    "paddingTop": "16px",
    "paddingRight": "20px",
    "paddingBottom": "20px",
    "paddingLeft": "20px",
    "flexDirection": "column",
    "minHeight": "88px"
  },
  ".c-memory-title": {
    "fontSize": "28px",
    "fontWeight": "bold",
    "color": "#2c3e50",
    "lines": 1,
    "textOverflow": "ellipsis"
  },
  ".c-memory-meta": {
    "fontSize": "22px",
    "color": "#8b9097",
    "marginTop": "4px"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/home/index.ux?uxType=page":
/*!*************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/home/index.ux?uxType=page ***!
  \*************************************************************************************************************************************************************************************************************************************************************/
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
  ".web-home-scroll": {
    "flex": 1,
    "width": "100%",
    "backgroundColor": "#f7f9fc"
  },
  ".home-block": {
    "width": "100%",
    "paddingLeft": "32px",
    "paddingRight": "32px"
  },
  ".home-hero-block": {
    "marginTop": "8px",
    "marginBottom": "24px"
  },
  ".home-learn-block": {
    "marginBottom": "24px"
  },
  ".home-section-block": {
    "marginBottom": "16px"
  },
  ".home-memory-block": {
    "marginBottom": "8px",
    "paddingLeft": "32px",
    "paddingRight": "32px"
  },
  ".home-spacer": {
    "height": "24px"
  }
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/BottomNav/index.ux?uxType=comp&":
/*!********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/BottomNav/index.ux?uxType=comp& ***!
  \********************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "c-bottom-nav"
  ],
  "style": {
    "paddingBottom": function () {return '' + (this.safeBottom) + 'px'}
  },
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-bottom-nav-inner"
      ],
      "children": [
        {
          "type": "block",
          "attr": {},
          "repeat": {
            "exp": function () {return this.tabs},
            "key": "index",
            "value": "tab"
          },
          "children": [
            {
              "type": "div",
              "attr": {
                "dataTab": function () {return this.tab.id}
              },
              "classList": [
                "c-bottom-nav-item"
              ],
              "events": {
                "click": "onTabTap"
              },
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.tab.icon}
                  },
                  "classList": function () {return ['c-bottom-nav-icon', this.active===this.tab.id?'c-bottom-nav-icon-active':'']}
                },
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.tab.label}
                  },
                  "classList": function () {return ['c-bottom-nav-label', this.active===this.tab.id?'c-bottom-nav-label-active':'']}
                },
                {
                  "type": "text",
                  "attr": {
                    "value": function () {return this.gardenBadge}
                  },
                  "classList": [
                    "c-bottom-nav-badge"
                  ],
                  "shown": function () {return this.tab.id==='garden'&&this.gardenBadge>0}
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MemoryCard/index.ux?uxType=comp&":
/*!*********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MemoryCard/index.ux?uxType=comp& ***!
  \*********************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "c-memory-card"
  ],
  "events": {
    "click": "handleTap"
  },
  "children": [
    {
      "type": "stack",
      "attr": {},
      "classList": [
        "c-memory-cover-wrap"
      ],
      "children": [
        {
          "type": "image",
          "attr": {
            "src": function () {return this.item.cover}
          },
          "classList": [
            "c-memory-cover"
          ]
        },
        {
          "type": "div",
          "attr": {},
          "classList": [
            "c-memory-cover-mask"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return this.item.duration}
          },
          "classList": [
            "c-memory-duration"
          ],
          "shown": function () {return this.item.duration}
        },
        {
          "type": "text",
          "attr": {
            "value": "▶"
          },
          "classList": [
            "c-memory-play"
          ]
        }
      ]
    },
    {
      "type": "div",
      "attr": {},
      "classList": [
        "c-memory-body"
      ],
      "children": [
        {
          "type": "text",
          "attr": {
            "value": function () {return this.item.title}
          },
          "classList": [
            "c-memory-title"
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": function () {return '' + (this.item.views) + ' 次观看'}
          },
          "classList": [
            "c-memory-meta"
          ]
        }
      ]
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/home/index.ux?uxType=page&importNames[]=c-bottom-nav,importNames[]=c-memory-card":
/*!****************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/home/index.ux?uxType=page&importNames[]=c-bottom-nav,importNames[]=c-memory-card ***!
  \****************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = {
  "type": "div",
  "attr": {},
  "classList": [
    "web-page-with-nav"
  ],
  "children": [
    {
      "type": "div",
      "attr": {},
      "classList": [
        "web-header"
      ],
      "children": [
        {
          "type": "div",
          "attr": {},
          "classList": [
            "web-brand-row"
          ],
          "children": [
            {
              "type": "text",
              "attr": {
                "value": "◎"
              },
              "classList": [
                "web-brand-icon"
              ]
            },
            {
              "type": "text",
              "attr": {
                "value": "忆眸"
              },
              "classList": [
                "web-brand-title"
              ]
            }
          ]
        },
        {
          "type": "text",
          "attr": {
            "value": "⌕"
          },
          "classList": [
            "web-icon-btn"
          ],
          "events": {
            "click": "onSearch"
          }
        }
      ]
    },
    {
      "type": "list",
      "attr": {},
      "classList": [
        "web-home-scroll"
      ],
      "children": [
        {
          "type": "list-item",
          "attr": {
            "type": "hero"
          },
          "classList": [
            "home-block",
            "home-hero-block"
          ],
          "children": [
            {
              "type": "stack",
              "attr": {},
              "classList": [
                "web-hero-stack"
              ],
              "events": {
                "click": "goCreate"
              },
              "children": [
                {
                  "type": "image",
                  "attr": {
                    "src": function () {return this.heroCover}
                  },
                  "classList": [
                    "web-hero"
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "web-hero-mask"
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "web-hero-content"
                  ],
                  "children": [
                    {
                      "type": "text",
                      "attr": {
                        "value": "✦ AI 智能创作"
                      },
                      "classList": [
                        "web-hero-badge"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": "开始智能创作"
                      },
                      "classList": [
                        "web-hero-title"
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": "让每一段旅途都成为电影"
                      },
                      "classList": [
                        "web-hero-sub"
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
            "type": "learn"
          },
          "classList": [
            "home-block",
            "home-learn-block"
          ],
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "web-learn-card"
              ],
              "events": {
                "click": "goVlogLearn"
              },
              "children": [
                {
                  "type": "text",
                  "attr": {
                    "value": "🎓"
                  },
                  "classList": [
                    "web-learn-icon"
                  ]
                },
                {
                  "type": "div",
                  "attr": {},
                  "classList": [
                    "web-learn-main"
                  ],
                  "children": [
                    {
                      "type": "div",
                      "attr": {},
                      "classList": [
                        "web-learn-title-row"
                      ],
                      "children": [
                        {
                          "type": "text",
                          "attr": {
                            "value": "学习 Vlog"
                          },
                          "classList": [
                            "web-learn-title"
                          ]
                        },
                        {
                          "type": "text",
                          "attr": {
                            "value": "AI 导拍"
                          },
                          "classList": [
                            "web-learn-tag"
                          ]
                        }
                      ]
                    },
                    {
                      "type": "text",
                      "attr": {
                        "value": "九宫格构图 · 人物该放哪一格"
                      },
                      "classList": [
                        "web-learn-desc"
                      ]
                    }
                  ]
                },
                {
                  "type": "text",
                  "attr": {
                    "value": "›"
                  },
                  "classList": [
                    "web-learn-arrow"
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "list-item",
          "attr": {
            "type": "section"
          },
          "classList": [
            "home-block",
            "home-section-block"
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
                    "value": "回忆瞬间"
                  },
                  "classList": [
                    "web-section-title"
                  ]
                },
                {
                  "type": "text",
                  "attr": {
                    "value": "查看全部 ›"
                  },
                  "classList": [
                    "web-section-link"
                  ],
                  "events": {
                    "click": "onViewAll"
                  }
                }
              ]
            }
          ]
        },
        {
          "type": "list-item",
          "attr": {
            "type": "memory"
          },
          "classList": [
            "home-block",
            "home-memory-block"
          ],
          "children": [
            {
              "type": "div",
              "attr": {},
              "classList": [
                "web-memory-grid"
              ],
              "children": [
                {
                  "type": "block",
                  "attr": {},
                  "repeat": {
                    "exp": function () {return this.memoryItems},
                    "key": "index",
                    "value": "item"
                  },
                  "children": [
                    {
                      "type": "c-memory-card",
                      "attr": {
                        "item": function () {return this.item}
                      },
                      "events": {
                        "click": "onMemoryClick"
                      }
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
            "home-spacer"
          ]
        }
      ]
    },
    {
      "type": "c-bottom-nav",
      "attr": {
        "active": "home",
        "gardenBadge": function () {return 3},
        "safeBottom": function () {return this.safeBottom}
      },
      "events": {
        "change": "onTabChange"
      }
    }
  ]
}

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/BottomNav/index.ux?uxType=comp&name=c-bottom-nav":
/*!**********************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/BottomNav/index.ux?uxType=comp&name=c-bottom-nav ***!
  \**********************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/BottomNav/index.ux?uxType=comp")
$app_define$('@app-component/c-bottom-nav', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/BottomNav/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/BottomNav/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/MemoryCard/index.ux?uxType=comp&name=c-memory-card":
/*!************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!./src/components/MemoryCard/index.ux?uxType=comp&name=c-memory-card ***!
  \************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/components/MemoryCard/index.ux?uxType=comp")
$app_define$('@app-component/c-memory-card', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=comp& */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/components/MemoryCard/index.ux?uxType=comp&")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=comp */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/components/MemoryCard/index.ux?uxType=comp")
});
;

/***/ }),

/***/ "./src/helper/data/memories.js":
/*!*************************************!*\
  !*** ./src/helper/data/memories.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = exports.MEMORY_ITEMS = exports.HERO_COVER = void 0;
const HERO_COVER = exports.HERO_COVER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop';
const MEMORY_ITEMS = exports.MEMORY_ITEMS = [{
  id: '1',
  title: '大理的慢时光',
  cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
  views: '1.2k',
  duration: '01:24'
}, {
  id: '2',
  title: '西湖边的午后',
  cover: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop',
  views: '856',
  duration: '00:58'
}, {
  id: '3',
  title: '厦门的海风',
  cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
  views: '2.3k',
  duration: '02:10'
}, {
  id: '4',
  title: '京都秋色',
  cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=300&fit=crop',
  views: '643',
  duration: '01:05'
}];
var _default = exports["default"] = {
  HERO_COVER,
  MEMORY_ITEMS
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
/*!*********************************************!*\
  !*** ./src/pages/home/index.ux?uxType=page ***!
  \*********************************************/
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/BottomNav/index.ux?uxType=comp&name=c-bottom-nav */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/BottomNav/index.ux?uxType=comp&name=c-bottom-nav")
__webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&type=import!../../components/MemoryCard/index.ux?uxType=comp&name=c-memory-card */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/ux-loader.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&type=import!./src/components/MemoryCard/index.ux?uxType=comp&name=c-memory-card")
var $app_script$ = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../../../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../../../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&plugins[]=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\dsl-xvm\lib\loaders\babel-plugin-jsx.js&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&plugins[]=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\dsl-xvm\\lib\\loaders\\babel-plugin-jsx.js&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/access-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/pages/home/index.ux?uxType=page")
$app_define$('@app-component/index', [], function($app_require$, $app_exports$, $app_module$) {
     $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
          $app_module$.exports = $app_exports$.default
        }
    $app_module$.exports.template = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./index.ux?uxType=page&importNames[]=c-bottom-nav,importNames[]=c-memory-card */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/template-loader.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=template!./src/pages/home/index.ux?uxType=page&importNames[]=c-bottom-nav,importNames[]=c-memory-card")
    $app_module$.exports.style = __webpack_require__(/*! !../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!../../../node_modules/less-loader/dist/cjs.js!../../../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./index.ux?uxType=page */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/style-loader.js?index=0&type=style!./node_modules/less-loader/dist/cjs.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=style!./src/pages/home/index.ux?uxType=page")
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