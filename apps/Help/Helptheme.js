import lodash from 'lodash'
import { Data } from '../../components/index.js'

const PAGE_W = 1280
const SIDE_PAD = 36

/** 仅注入背景图、列宽与文字色；气泡透明度由 index.css 固定 */
const Theme = {
  async getThemeData (diyStyle, sysStyle, bgUrl) {
    const helpConfig = lodash.extend({}, sysStyle, diyStyle)
    const colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))

    const ret = [`
    body.elem-default,body.elem-hydro{
      transform:scale(1)!important;
      transform-origin:top left;
      width:${PAGE_W}px!important;
      min-height:100%;
      background-color:#0f172a;
      background-image:
        linear-gradient(180deg,rgba(15,23,42,0.12) 0%,rgba(15,23,42,0.22) 45%,rgba(15,23,42,0.42) 100%),
        url(${bgUrl});
      background-repeat:no-repeat;
      background-position:center top;
      background-size:cover;
    }
    body.elem-default .container,body.elem-hydro .container{
      width:${PAGE_W}px!important;
      max-width:${PAGE_W}px;
      padding:0 ${SIDE_PAD}px 48px;
      background:none!important;
      box-sizing:border-box;
    }
    .help-table .td,.help-table .th{width:${100 / colCount}%}
    `]

    const css = function (sel, cssKey, key, def, fn) {
      const val = Data.def(diyStyle[key], sysStyle[key], def)
      ret.push(`${sel}{${cssKey}:${fn ? fn(val) : val}}`)
    }

    css('.help-title', 'color', 'fontColor', '#1e293b')
    css('.help-group', 'color', 'fontColor', '#0f172a')
    css('.head-box .title', 'color', 'titleColor', '#f8fafc')
    css('.head-box .label', 'color', 'subTitleColor', 'rgba(248,250,252,0.88)')
    css('.help-desc', 'color', 'descColor', '#475569')

    return {
      style: `<style>${ret.join('\n')}</style>`,
      colCount,
      colWidth: Math.floor((PAGE_W - SIDE_PAD * 2) / colCount)
    }
  }
}

export default Theme
