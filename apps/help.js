import plugin from '../../../lib/plugins/plugin.js'

import lodash from 'lodash'

import { render, Data } from '../components/index.js'

import Theme from './Help/Helptheme.js'

import { pickRenderBackground, toFileUrl } from '../utils/render-layout.js'



export class ql_help extends plugin {

  constructor () {

    super({

      name: '[鸢尾花插件]鸢尾花帮助',

      dsc: '鸢尾花帮助',

      event: 'message',

      priority: 5000,

      rule: [

        {

          reg: '^#?(logier|鸢尾花|yuanweihua|iris|鸢尾|yuanwei)(帮助|help|指令|菜单|命令)$',

          fnc: 'logierhelp'

        }

      ]

    })

  }



  async logierhelp () {

    return await help(this.e)

  }

}



async function help (e) {

  const { diyCfg, sysCfg } = await Data.importCfg('help')

  const helpConfig = lodash.defaults(diyCfg.helpCfg || {}, sysCfg.helpCfg)

  const helpList = diyCfg.helpList || sysCfg.helpList

  const helpGroup = []



  lodash.forEach(helpList, (group) => {

    if (group.auth && group.auth === 'master' && !e.isMaster) return true

    lodash.forEach(group.list, (help) => {

      const icon = help.icon * 1

      if (!icon) {

        help.css = 'display:none'

      } else {

        const x = (icon - 1) % 10

        const y = (icon - x - 1) / 10

        help.css = `background-position:-${x * 50}px -${y * 50}px`

      }

    })

    helpGroup.push(group)

  })



  const bgUrl = toFileUrl(pickRenderBackground())

  const themeData = await Theme.getThemeData(diyCfg.helpCfg || {}, sysCfg.helpCfg || {}, bgUrl)



  return await render('help/index', {

    helpCfg: helpConfig,

    helpGroup,

    ...themeData,

    element: 'default'

  }, { e, scale: 1 })

}


