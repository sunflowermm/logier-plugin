import lodash from 'lodash'
import { Data } from '../../components/index.js'

const resPath = '{{_res_path}}/help/'
const framePath = '{{_res_path}}/common/theme/main-01.png'

const Theme = {
  async getThemeData (diyStyle, sysStyle) {
    const helpConfig = lodash.extend({}, sysStyle, diyStyle)
    const colCount = Math.min(5, Math.max(parseInt(helpConfig?.colCount) || 3, 2))
    const colWidth = Math.min(500, Math.max(100, parseInt(helpConfig?.colWidth) || 265))
    const width = Math.min(2500, Math.max(800, colCount * colWidth + 30))
    const ret = [`
    body{
      width:${width}px;
      min-height:100%;
      background:url(${resPath}bg.png) center top / cover no-repeat;
      background-color:#d8c8e8;
    }
    .container{
      width:${width}px;
      min-height:100%;
      background:url(${framePath}) top center no-repeat;
      background-size:100% auto;
      padding-bottom:48px;
    }
    .help-table .td,.help-table .th{width:${100 / colCount}%}
    `]
    const css = function (sel, cssKey, key, def, fn) {
      const val = Data.def(diyStyle[key], sysStyle[key], def)
      ret.push(`${sel}{${cssKey}:${fn ? fn(val) : val}}`)
    }
    css('.help-title,.help-group', 'color', 'fontColor', '#e8d5b5')
    css('.help-title,.help-group', 'text-shadow', 'fontShadow', '0 1px 3px rgba(0,0,0,0.65)')
    css('.help-desc', 'color', 'descColor', '#f0ece4')
    css('.cont-box', 'background', 'contBgColor', 'rgba(32, 28, 40, 0.78)')
    css('.cont-box', 'backdrop-filter', 'contBgBlur', 4, (n) => diyStyle.bgBlur === false ? 'none' : `blur(${n}px)`)
    css('.help-group', 'background', 'headerBgColor', 'rgba(24, 20, 32, 0.55)')
    css('.help-table .tr:nth-child(odd)', 'background', 'rowBgColor1', 'rgba(34, 41, 51, 0.25)')
    css('.help-table .tr:nth-child(even)', 'background', 'rowBgColor2', 'rgba(34, 41, 51, 0.42)')
    return {
      style: `<style>${ret.join('\n')}</style>`,
      colCount
    }
  }
}

export default Theme
