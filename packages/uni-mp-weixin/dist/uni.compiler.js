'use strict';

var uniCliShared = require('@dcloudio/uni-cli-shared');
var initMiniProgramPlugin = require('@dcloudio/uni-mp-vite');
var path = require('path');
var uniShared = require('@dcloudio/uni-shared');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var initMiniProgramPlugin__default = /*#__PURE__*/_interopDefaultLegacy(initMiniProgramPlugin);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

var description = "项目配置文件。";
var packOptions = {
	ignore: [
	]
};
var setting = {
	urlCheck: false,
	es6: true,
	postcss: false,
	minified: false,
	newFeature: true
};
var compileType = "miniprogram";
var libVersion = "";
var appid = "touristappid";
var projectname = "";
var condition = {
	search: {
		current: -1,
		list: [
		]
	},
	conversation: {
		current: -1,
		list: [
		]
	},
	game: {
		current: -1,
		list: [
		]
	},
	miniprogram: {
		current: -1,
		list: [
		]
	}
};
var source = {
	description: description,
	packOptions: packOptions,
	setting: setting,
	compileType: compileType,
	libVersion: libVersion,
	appid: appid,
	projectname: projectname,
	condition: condition
};

const compilerOptions = {
    isNativeTag: uniShared.isNativeTag,
    isCustomElement: (tag) => {
        return (['page-meta', 'navigation-bar', 'match-media'].includes(tag) ||
            uniShared.isCustomElement(tag));
    },
    nodeTransforms: [uniCliShared.transformRef, uniCliShared.transformComponentLink],
};
const miniProgram = {
    class: {
        array: true,
    },
    slot: {
        fallbackContent: false,
        dynamicSlotNames: true,
    },
    directive: 'wx:',
    lazyElement: {
        editor: ['ready'],
    },
};
const projectConfigFilename = 'project.config.json';
const options = {
    vite: {
        inject: {
            uni: [path__default["default"].resolve(__dirname, 'uni.api.esm.js'), 'default'],
        },
        alias: {
            'uni-mp-runtime': path__default["default"].resolve(__dirname, 'uni.mp.esm.js'),
        },
        copyOptions: {
            assets: ['wxcomponents'],
            targets: [
                {
                    src: [
                        'theme.json',
                        'sitemap.json',
                        'ext.json',
                        'custom-tab-bar',
                        'functional-pages',
                        projectConfigFilename,
                    ],
                    get dest() {
                        return process.env.UNI_OUTPUT_DIR;
                    },
                },
            ],
        },
    },
    global: 'wx',
    app: {
        darkmode: true,
        subpackages: true,
    },
    project: {
        filename: projectConfigFilename,
        source,
    },
    template: Object.assign(Object.assign({}, miniProgram), { filter: {
            extname: '.wxs',
            lang: 'wxs',
            generate(filter, filename) {
                if (filename) {
                    return `<wxs src="${filename}.wxs" module="${filter.name}"/>`;
                }
                return `<wxs module="${filter.name}">
${filter.code}
</wxs>`;
            },
        }, extname: '.wxml', compilerOptions }),
    style: {
        extname: '.wxss',
    },
};

const uniMiniProgramWeixinPlugin = {
    name: 'vite:uni-mp-weixin',
    config() {
        return {
            define: {
                __VUE_CREATED_DEFERRED__: false,
            },
            build: {
                // css 中不支持引用本地资源
                assetsInlineLimit: uniCliShared.ASSETS_INLINE_LIMIT,
            },
        };
    },
};
var index = [uniMiniProgramWeixinPlugin, ...initMiniProgramPlugin__default["default"](options)];

module.exports = index;