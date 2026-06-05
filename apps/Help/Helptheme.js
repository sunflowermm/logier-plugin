import lodash from 'lodash'
import { Data } from '../../components/index.js'

const resPath = '{{_res_path}}/help/'

/** BJT 帮助底图固定尺寸（与 resources/help/bg.png 一致） */
const BG_W = 1137
const BG_H = 627
const LEFT_GUTTER = 248
const SIDE_PAD = 28

const Theme = {
  async getThemeData (diyStyle, sysStyle) {
    const helpConfig = lodash.extend({}, sysStyle, diyStyle)
    const colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
    const contentW = BG_W - LEFT_GUTTER - SIDE_PAD * 2
    const colWidth = Math.floor(contentW / colCount)

    const ret = [`
    body.elem-default,body.elem-hydro{
      transform:scale(1)!important;
      transform-origin:top left;
      width:${BG_W}px!important;
      min-height:100%;
      background-color:#1e1a28;
      background-image:url(${resPath}bg.png);
      background-repeat:no-repeat;
      background-position:top left;
      background-size:${BG_W}px ${BG_H}px;
    }
    body.elem-default .container,body.elem-hydro .container{
      width:${BG_W}px!important;
      max-width:${BG_W}px;
      padding:0 ${SIDE_PAD}px 40px ${LEFT_GUTTER}px;
      background:none!important;
      box-sizing:border-box;
    }
    .help-table .td,.help-table .th{width:${100 / colCount}%}
    `]
    const css = function (sel, cssKey, key, def, fn) {
      const val = Data.def(diyStyle[key], sysStyle[key], def)
      ret.push(`${sel}{${cssKey}:${fn ? fn(val) : val}}`)
    }
    css('.help-title,.help-group', 'color', 'fontColor', '#3d3550')
    css('.help-title,.help-group', 'text-shadow', 'fontShadow', '0 1px 2px rgba(255,255,255,0.35)')
    css('.help-desc', 'color', 'descColor', '#4a4258')
    css('.cont-box', 'background', 'contBgColor', 'rgba(255,255,255,0.72)')
    css('.cont-box', 'backdrop-filter', 'contBgBlur', 6, (n) => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`)
    css('.help-group', 'background', 'headerBgColor', 'rgba(255,255,255,0.45)')
    css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(255,255,255,0.35)')
    css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(255,255,255,0.5)')
    css('.head-box .title', 'color', 'titleColor', '#2a2438')
    css('.head-box .label', 'color', 'subTitleColor', '#4a4258')
    return {
      style: `<style>${ret.join('\n')}</style>`,
      colCount,
      colWidth
    }
  }
}

export default Theme
