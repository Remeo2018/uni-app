import fs from 'fs'
import path from 'path'
import { ConfigEnv } from 'vite'
import { parse } from 'jsonc-parser'
import { isArray } from '@vue/shared'
import { VitePluginUniResolvedOptions } from '..'
import { normalizePagesJson } from './pagesJson'

interface ProjectFeatures {}
interface PagesFeatures {
  nvue: boolean
  pages: boolean
  tabBar: boolean
  topWindow: boolean
  leftWindow: boolean
  rightWindow: boolean
  navigationBar: boolean
  pullDownRefresh: boolean
  navigationBarButtons: boolean
  navigationBarSearchInput: boolean
  navigationBarTransparent: boolean
}
interface ManifestFeatures {
  wx: boolean
  wxs: boolean
  promise: boolean
  longpress: boolean
  routerMode: '"hash"' | '"history"'
}

function resolveProjectFeature(
  options: VitePluginUniResolvedOptions,
  command: ConfigEnv['command']
) {
  const features: ProjectFeatures = {}
  if (command === 'build') {
  }
  return features
}

function resolvePagesFeature(
  options: VitePluginUniResolvedOptions,
  command: ConfigEnv['command']
): PagesFeatures {
  const features: PagesFeatures = {
    nvue: true,
    pages: true,
    tabBar: true,
    topWindow: false,
    leftWindow: false,
    rightWindow: false,
    navigationBar: true,
    pullDownRefresh: false,
    navigationBarButtons: true,
    navigationBarSearchInput: true,
    navigationBarTransparent: true,
  }

  const {
    tabBar,
    pages,
    topWindow,
    leftWindow,
    rightWindow,
    globalStyle,
  } = normalizePagesJson(
    fs.readFileSync(path.join(options.inputDir, 'pages.json'), 'utf8'),
    options.platform
  )
  if (pages && pages.length === 1) {
    features.pages = false
  }
  if (!(tabBar && tabBar.list && tabBar.list.length)) {
    features.tabBar = false
  }
  if (topWindow && topWindow.path) {
    features.topWindow = true
  }
  if (leftWindow && leftWindow.path) {
    features.leftWindow = true
  }
  if (rightWindow && rightWindow.path) {
    features.rightWindow = true
  }
  if (globalStyle.enablePullDownRefresh) {
    features.pullDownRefresh = true
  } else {
    if (pages.find((page) => page.style && page.style.enablePullDownRefresh)) {
      features.pullDownRefresh = true
    }
  }
  if (command === 'build') {
    if (
      !pages.find((page) =>
        fs.existsSync(path.resolve(options.inputDir, page.path, '.nvue'))
      )
    ) {
      features.nvue = false
    }
    let isNavigationCustom = false
    if (globalStyle.navigationBar.style === 'custom') {
      isNavigationCustom = true // 全局custom
      if (pages.find((page) => page.style.navigationBar.style === 'default')) {
        isNavigationCustom = false
      }
    } else {
      // 所有页面均custom
      if (pages.every((page) => page.style.navigationBar.style === 'custom')) {
        isNavigationCustom = true
      }
    }
    if (isNavigationCustom) {
      features.navigationBar = false
      features.navigationBarButtons = false
      features.navigationBarSearchInput = false
      features.navigationBarTransparent = false
    } else {
      if (
        !pages.find(
          (page) =>
            isArray(page.style.navigationBar.buttons) &&
            page.style.navigationBar.buttons.length
        )
      ) {
        features.navigationBarButtons = false
      }
      if (
        !globalStyle.navigationBar.searchInput &&
        !pages.find((page) => page.style.navigationBar.searchInput)
      ) {
        features.navigationBarSearchInput = false
      }
      if (
        globalStyle.navigationBar.type !== 'transparent' &&
        !pages.find((page) => page.style.navigationBar.type === 'transparent')
      ) {
        features.navigationBarTransparent = false
      }
    }
  }
  return features
}

function resolveManifestFeature(
  options: VitePluginUniResolvedOptions
): ManifestFeatures {
  const features: ManifestFeatures = {
    wx: true, // 是否启用小程序的组件实例 API，如：selectComponent 等（uni-core/src/service/plugin/appConfig）
    wxs: true, // 是否启用 wxs 支持，如：getComponentDescriptor 等（uni-core/src/view/plugin/appConfig）
    promise: false, // 是否启用旧版本的 promise 支持（即返回[err,res]的格式）
    longpress: true, // 是否启用longpress
    routerMode: '"hash"', // 启用的 router 类型（uni-h5/src/framework/plugin/router）
  }
  const manifest = parse(
    fs.readFileSync(path.join(options.inputDir, 'manifest.json'), 'utf8')
  )
  if (
    manifest.h5 &&
    manifest.h5.router &&
    manifest.h5.router.mode === 'history'
  ) {
    features.routerMode = '"history"'
  }
  // TODO manifest.json features
  return features
}

export type FEATURE_DEFINES = ReturnType<typeof getFeatures>

export function getFeatures(
  options: VitePluginUniResolvedOptions,
  command: ConfigEnv['command']
) {
  const {
    wx,
    wxs,
    nvue,
    pages,
    tabBar,
    promise,
    longpress,
    routerMode,
    topWindow,
    leftWindow,
    rightWindow,
    navigationBar,
    pullDownRefresh,
    navigationBarButtons,
    navigationBarSearchInput,
    navigationBarTransparent,
  } = Object.assign(
    resolveManifestFeature(options),
    resolvePagesFeature(options, command),
    resolveProjectFeature(options, command)
  )
  return {
    __UNI_FEATURE_WX__: wx,
    __UNI_FEATURE_WXS__: wxs,
    __UNI_FEATURE_NVUE__: nvue,
    __UNI_FEATURE_PROMISE__: promise,
    __UNI_FEATURE_LONGPRESS__: longpress,
    __UNI_FEATURE_ROUTER_MODE__: routerMode,
    __UNI_FEATURE_PAGES__: pages,
    __UNI_FEATURE_TABBAR__: tabBar,
    __UNI_FEATURE_TOPWINDOW__: topWindow,
    __UNI_FEATURE_LEFTWINDOW__: leftWindow,
    __UNI_FEATURE_RIGHTWINDOW__: rightWindow,
    __UNI_FEATURE_RESPONSIVE__: topWindow || leftWindow || rightWindow,
    __UNI_FEATURE_NAVIGATIONBAR__: navigationBar,
    __UNI_FEATURE_PULL_DOWN_REFRESH__: pullDownRefresh,
    __UNI_FEATURE_NAVIGATIONBAR_BUTTONS__: navigationBarButtons,
    __UNI_FEATURE_NAVIGATIONBAR_SEARCHINPUT__: navigationBarSearchInput,
    __UNI_FEATURE_NAVIGATIONBAR_TRANSPARENT__: navigationBarTransparent,
  }
}
