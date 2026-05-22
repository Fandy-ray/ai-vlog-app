(function(){
    
    var $app_define_wrap$ = $app_define_wrap$ || function() {}
    var manifestJson = {"package":"com.example.demo","name":"忆眸","versionName":"1.0.0","versionCode":1,"minPlatformVersion":1070,"icon":"/assets/images/logo.png","features":[{"name":"system.prompt"},{"name":"system.router"},{"name":"system.shortcut"},{"name":"system.fetch"},{"name":"system.media"},{"name":"system.request"},{"name":"system.file"},{"name":"system.share"}],"permissions":[{"origin":"*"}],"template/official":"demo-template","config":{"logLevel":"debug","MEMENTO_API_BASE":"http://192.168.43.162:3000"},"router":{"entry":"pages/home","pages":{"pages/Demo":{"component":"index"},"pages/DemoDetail":{"component":"index"},"pages/home":{"component":"index"},"pages/style":{"component":"index"},"pages/shoot":{"component":"index"},"pages/upload":{"component":"index"},"pages/generate":{"component":"index"},"pages/preview":{"component":"index"},"pages/create":{"component":"index"},"pages/editor":{"component":"index"},"pages/complete":{"component":"index"},"pages/vlog-learn":{"component":"index"}},"widgets":{"CardDemo":{"name":"CardDemo","description":"快应用卡片展示","component":"index","path":"/CardDemo","minPlatformVersion":1032,"targetManufactorys":["vivo"],"features":[]}}},"display":{"titleBarBackgroundColor":"#f2f2f2","titleBarTextColor":"#414141","pages":{"pages/Demo":{"titleBarText":"快应用示例模版"},"pages/DemoDetail":{"titleBarText":"详情页"},"pages/home":{"titleBar":false,"titleBarText":"首页"},"pages/style":{"titleBar":false,"titleBarText":"风格"},"pages/shoot":{"titleBarText":"拍摄"},"pages/upload":{"titleBarText":"上传"},"pages/generate":{"titleBarText":"生成"},"pages/preview":{"titleBar":false,"titleBarText":"预览"},"pages/create":{"titleBar":false,"titleBarText":"导入素材"},"pages/editor":{"titleBar":false,"titleBarText":"智能剪辑"},"pages/complete":{"titleBar":false,"titleBarText":"创作完成"},"pages/vlog-learn":{"titleBar":false,"titleBarText":"学习 Vlog"}}}}
    var createAppHandler = function() {
      return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/manifest-loader.js?path=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\src!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/app.ux?uxType=app":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/manifest-loader.js?path=C:\Users\26453\Desktop\ai-vlog-app-main\src!./node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/app.ux?uxType=app ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function __scriptModule__ (module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const $utils = (__webpack_require__(/*! ./helper/utils */ "./src/helper/utils.js")["default"]);
const $apis = (__webpack_require__(/*! ./helper/apis */ "./src/helper/apis/index.js")["default"]);
const $api = (__webpack_require__(/*! ./helper/api */ "./src/helper/api/index.js")["default"]);
const $ai = (__webpack_require__(/*! ./helper/ai */ "./src/helper/ai/index.js")["default"]);
const $store = (__webpack_require__(/*! ./helper/store */ "./src/helper/store.js")["default"]);
const $routes = (__webpack_require__(/*! ./helper/routes */ "./src/helper/routes.js")["default"]);
const $editorStore = (__webpack_require__(/*! ./helper/editorStore */ "./src/helper/editorStore.js")["default"]);
const hook2global = __webpack_require__.g.__proto__ || __webpack_require__.g;
hook2global.$utils = $utils;
hook2global.$apis = $apis;
hook2global.$api = $api;
hook2global.$ai = $ai;
hook2global.$store = $store;
hook2global.$routes = $routes;
hook2global.$editorStore = $editorStore;
var _default = exports.default = {
  onCreate() {}
};}

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

/***/ "./src/helper/api/index.js":
/*!*********************************!*\
  !*** ./src/helper/api/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _vlog = _interopRequireDefault(__webpack_require__(/*! ../apis/vlog */ "./src/helper/apis/vlog.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports["default"] = {
  vlog: _vlog.default
};

/***/ }),

/***/ "./src/helper/apis/example.js":
/*!************************************!*\
  !*** ./src/helper/apis/example.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _ajax = _interopRequireDefault(__webpack_require__(/*! ../ajax */ "./src/helper/ajax.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * @desc 在实际开发中，您可以将 baseUrl 替换为您的请求地址前缀；
 *
 * 已将 $apis 挂载在 global，您可以通过如下方式，进行调用：
 * $apis.example.getApi().then().catch().finally()
 *
 * 备注：如果您不需要发起请求，删除 apis 目录，以及 app.ux 中引用即可；
 */
const baseUrl = 'https://api.exampel.com/';
var _default = exports["default"] = {
  getApi(data) {
    return _ajax.default.get(`${baseUrl}your-project-api`, data);
  },
  postOtherApi(data) {
    return _ajax.default.post(`${baseUrl}your-project-api`, data);
  }
};

/***/ }),

/***/ "./src/helper/apis/index.js":
/*!**********************************!*\
  !*** ./src/helper/apis/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _vlog = _interopRequireDefault(__webpack_require__(/*! ./vlog */ "./src/helper/apis/vlog.js"));
var _example = _interopRequireDefault(__webpack_require__(/*! ./example */ "./src/helper/apis/example.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
var _default = exports["default"] = {
  vlog: _vlog.default,
  example: _example.default
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

/***/ "./src/helper/editorStore.js":
/*!***********************************!*\
  !*** ./src/helper/editorStore.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
const INITIAL_SESSION = {
  title: '旅行的意义',
  filterId: 'none',
  filterIntensity: 100,
  effectId: 'none',
  textOverlay: null,
  stickerOverlays: [],
  textPresetId: 'none',
  textContent: '',
  keepOriginalAudio: true,
  bgmId: 'sunny-day'
};
let editorProject = null;
let editorSession = Object.assign({}, INITIAL_SESSION);
let exportedVideo = null;
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
function setEditorProject(project) {
  editorProject = project ? clone(project) : null;
  return editorProject;
}
function getEditorProject() {
  return editorProject ? clone(editorProject) : null;
}
function hasEditorProject() {
  return !!(editorProject && editorProject.clips && editorProject.clips.length);
}
function resetEditorSession() {
  editorSession = clone(Object.assign({}, INITIAL_SESSION));
}
function getEditorSession() {
  return clone(editorSession);
}
function setEditorSession(patch = {}) {
  const next = Object.assign({}, editorSession, patch);
  if (patch.stickerOverlays) {
    next.stickerOverlays = clone(patch.stickerOverlays);
  }
  if (patch.textOverlay !== undefined) {
    next.textOverlay = patch.textOverlay ? clone(patch.textOverlay) : null;
  }
  editorSession = next;
  return editorSession;
}
function setExportedVideo(payload) {
  exportedVideo = payload ? clone(payload) : null;
  return exportedVideo;
}
function getExportedVideo() {
  return exportedVideo ? clone(exportedVideo) : null;
}
function buildClipsFromImports(items = []) {
  let start = 0;
  const clips = items.map((item, index) => {
    const clip = {
      id: item.id || `clip-${index + 1}`,
      name: item.name ? item.name : `片段 ${index + 1}`,
      start,
      duration: item.duration || 5,
      thumb: item.thumb || item.uri,
      poster: item.thumb || item.uri,
      videoSrc: item.uri
    };
    start += clip.duration;
    return clip;
  });
  return {
    clips,
    duration: Math.max(start, 1)
  };
}
function getClipAtTime(clips = [], time = 0) {
  const list = clips.length ? clips : [];
  let cursor = 0;
  for (let i = 0; i < list.length; i += 1) {
    const clip = list[i];
    const end = cursor + clip.duration;
    if (time < end || i === list.length - 1) {
      return {
        clip,
        index: i,
        localTime: Math.max(0, Math.min(time - cursor, clip.duration - 0.05))
      };
    }
    cursor = end;
  }
  return {
    clip: list[0],
    index: 0,
    localTime: 0
  };
}
var _default = exports["default"] = {
  INITIAL_SESSION,
  setEditorProject,
  getEditorProject,
  hasEditorProject,
  resetEditorSession,
  getEditorSession,
  setEditorSession,
  setExportedVideo,
  getExportedVideo,
  buildClipsFromImports,
  getClipAtTime
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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./src/app.ux?uxType=app ***!
  \*******************************/

var $app_style$ = {}
var $app_script$ = __webpack_require__(/*! !../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!../node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!../node_modules/@hap-toolkit/packager/lib/loaders/manifest-loader.js?path=C:\Users\26453\Desktop\ai-vlog-app-main\src!../node_modules/babel-loader/lib/index.js?cwd=C:\Users\26453\Desktop\ai-vlog-app-main&cacheDirectory&comments=false&configFile=C:\Users\26453\Desktop\ai-vlog-app-main\node_modules\@hap-toolkit\packager\babel.config.js!../node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./app.ux?uxType=app */ "./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/script-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/module-loader.js!./node_modules/@hap-toolkit/packager/lib/loaders/manifest-loader.js?path=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\src!./node_modules/babel-loader/lib/index.js?cwd=C:\\Users\\26453\\Desktop\\ai-vlog-app-main&cacheDirectory&comments=false&configFile=C:\\Users\\26453\\Desktop\\ai-vlog-app-main\\node_modules\\@hap-toolkit\\packager\\babel.config.js!./node_modules/@hap-toolkit/dsl-xvm/lib/loaders/fragment-loader.js?index=0&type=script!./src/app.ux?uxType=app")

$app_define$('@app-application/app', [], function ($app_require$, $app_exports$, $app_module$) {
  
  $app_script$($app_module$, $app_exports$, $app_require$)
  if ($app_exports$.__esModule && $app_exports$.default) {
    $app_module$.exports = $app_exports$.default
  }
  $app_module$.exports.manifest = __webpack_require__(/*! ./manifest.json */ "./src/manifest.json")
  $app_module$.exports.style = { list: [ $app_style$ ] }
  
})
$app_bootstrap$('@app-application/app', { packagerVersion: "2.0.8" })

})();

/******/ })()
;
    };
    if (typeof window === "undefined") {
      return createAppHandler();
    }
    else {
      window.createAppHandler = createAppHandler
      // H5注入manifest以获取features
      global.manifest = manifestJson;
    }
  })();