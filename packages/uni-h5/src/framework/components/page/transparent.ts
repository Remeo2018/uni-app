import { computed, onMounted, Ref } from 'vue'
import { hexToRgba } from '../../../helpers/hexToRgba'

export function usePageHeadTransparentBackgroundColor(backgroundColor: string) {
  const { r, g, b } = hexToRgba(backgroundColor)
  return `rgba(${r},${g},${b},0)`
}

export function usePageHeadTransparent(
  headRef: Ref<null>,
  { titleColor, coverage, backgroundColor }: UniApp.PageNavigationBar
) {
  let A = 0
  const rgb = computed(() => hexToRgba(backgroundColor!))

  const offset = parseInt(coverage!)
  onMounted(() => {
    const $el = (headRef.value as unknown) as HTMLDivElement
    const transparentElemStyle = $el.style
    const titleElem = $el.querySelector(
      '.uni-page-head__title'
    ) as HTMLDivElement
    const borderRadiusElems = $el.querySelectorAll(
      '.uni-page-head-btn'
    ) as NodeListOf<HTMLElement>
    const iconElems = $el.querySelectorAll(
      '.uni-btn-icon'
    ) as NodeListOf<HTMLElement>
    const iconElemsStyles: CSSStyleDeclaration[] = []
    for (let i = 0; i < iconElems.length; i++) {
      iconElemsStyles.push(iconElems[i].style)
    }
    const oldColors: string[] = []
    const borderRadiusElemsStyles: CSSStyleDeclaration[] = []
    for (let i = 0; i < borderRadiusElems.length; i++) {
      const borderRadiusElem = borderRadiusElems[i]
      oldColors.push(getComputedStyle(borderRadiusElem).backgroundColor)
      borderRadiusElemsStyles.push(borderRadiusElem.style)
    }
    A = 0
    UniViewJSBridge.on(
      'onPageScroll',
      ({ scrollTop }: { scrollTop: number }) => {
        const alpha = Math.min(scrollTop / offset, 1)
        if (alpha === 1 && A === 1) {
          return
        }
        if (alpha > 0.5 && A <= 0.5) {
          iconElemsStyles.forEach(function (iconElemStyle) {
            iconElemStyle.color = titleColor!
          })
        } else if (alpha <= 0.5 && A > 0.5) {
          iconElemsStyles.forEach(function (iconElemStyle) {
            iconElemStyle.color = '#fff'
          })
        }
        A = alpha
        // TODO 暂时仅处理背景色
        if (titleElem) {
          titleElem.style.opacity = (alpha as unknown) as string
        }
        const bg = rgb.value
        transparentElemStyle.backgroundColor = `rgba(${bg.r},${bg.g},${bg.b},${alpha})`
        borderRadiusElemsStyles.forEach(function (
          borderRadiusElemStyle,
          index
        ) {
          const oldColor = oldColors[index]
          const rgba = oldColor.match(/[\d+\.]+/g)!
          rgba[3] = (((1 - alpha) *
            ((rgba.length === 4 ? rgba[3] : 1) as number)) as unknown) as string
          borderRadiusElemStyle.backgroundColor = `rgba(${rgba})`
        })
      }
    )
  })
}
