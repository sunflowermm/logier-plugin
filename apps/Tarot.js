import plugin from '../../../lib/plugins/plugin.js'
import setting from '../model/setting.js'
import render from '../components/renderer.js'
import {
  drawSingle,
  drawSpread,
  drawPair,
  drawMajorRainbow,
  drawLookup,
  drawDaily,
  listFormationsText,
  listHelpText,
  listCardIndex,
  resolveFormation,
  toCardView,
  toSpreadView
} from '../model/tarot.js'

const DEFAULT_FORMATION = '圣三角牌阵'

function tarotArg (msg, cmd) {
  return msg.replace(new RegExp(`^#${cmd}\\s*`, 'i'), '').trim()
}

function nickname (e) {
  return e.nickname || e.sender?.card || e.sender?.nickname || '旅人'
}

function renderTarot (tpl, view, e) {
  return render(tpl, view, { e })
}

export class TextMsg extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]塔罗牌',
      dsc: '塔罗牌占卜与牌阵',
      event: 'message',
      priority: -5000,
      rule: [
        { reg: '^#塔罗帮助$', fnc: '塔罗帮助' },
        { reg: '^#牌阵列表$', fnc: '牌阵列表' },
        { reg: '^#塔罗牌库$', fnc: '塔罗牌库' },
        { reg: '^#查牌\\s*(.*)$', fnc: '查牌' },
        { reg: '^#每日塔罗$', fnc: '每日塔罗' },
        { reg: '^#二牌\\s*(.*)$', fnc: '二牌' },
        { reg: '^#牌阵\\s*(.+)$', fnc: '牌阵' },
        { reg: '^#占卜\\s*(.*)$', fnc: '占卜' },
        { reg: '^#彩虹塔罗$', fnc: '彩虹塔罗牌' },
        { reg: '^#塔罗\\s*(.*)$', fnc: '塔罗牌' },
        { reg: '^#塔罗$', fnc: '塔罗牌' }
      ]
    })
  }

  get defaultFormation () {
    return setting.getConfig('Tarot')?.defaultFormation || DEFAULT_FORMATION
  }

  async 塔罗帮助 () {
    await this.e.reply(listHelpText())
    return true
  }

  async 牌阵列表 () {
    await this.e.reply(['可用牌阵（#牌阵 名称）：', listFormationsText()].join('\n\n'))
    return true
  }

  async 塔罗牌库 () {
    await this.e.reply(listCardIndex())
    return true
  }

  async 查牌 (e) {
    const query = tarotArg(e.msg, '查牌')
    if (!query) {
      await e.reply('请指定牌名，例如：#查牌愚者 或 #查牌 愚者\n#塔罗牌库 查看编号')
      return true
    }
    const draw = drawLookup(query)
    if (!draw) {
      await e.reply(`未找到「${query}」，发送 #塔罗牌库 查看`)
      return true
    }
    return renderTarot('tarot/card', toCardView(draw, `#查牌 · ${draw.card.name_cn}`, { mode: 'lookup' }), e)
  }

  async 每日塔罗 (e) {
    const draw = await drawDaily(e.user_id)
    const tag = draw.cached ? '（今日已抽）' : ''
    return renderTarot('tarot/card', toCardView(draw, `${nickname(e)} · 每日塔罗${tag}`), e)
  }

  async 二牌 (e) {
    const topic = tarotArg(e.msg, '二牌')
    const spread = drawPair()
    const title = topic ? `${nickname(e)} · ${topic}` : `${nickname(e)} · 二牌阵`
    return renderTarot('tarot/spread', toSpreadView(spread, title), e)
  }

  async 塔罗牌 (e) {
    const topic = tarotArg(e.msg, '塔罗')
    if (topic) {
      const lookup = drawLookup(topic)
      if (lookup) {
        return renderTarot('tarot/card', toCardView(lookup, `${nickname(e)} · ${lookup.card.name_cn}`), e)
      }
    }
    const title = topic ? `${nickname(e)} · ${topic}` : `${nickname(e)} · 单牌`
    return renderTarot('tarot/card', toCardView(drawSingle(), title), e)
  }

  async 占卜 (e) {
    const topic = tarotArg(e.msg, '占卜')
    return this.runSpread(e, this.defaultFormation, topic)
  }

  async 牌阵 (e) {
    const rest = tarotArg(e.msg, '牌阵')
    if (!rest) {
      await e.reply('请指定牌阵，例如：#牌阵 圣三角\n#塔罗帮助 查看指令')
      return true
    }
    const parts = rest.split(/\s+/)
    const formationQuery = parts.shift()
    const topic = parts.join(' ').trim()
    if (!resolveFormation(formationQuery)) {
      await e.reply(`未找到牌阵「${formationQuery}」，#牌阵列表 查看`)
      return true
    }
    return this.runSpread(e, formationQuery, topic)
  }

  async runSpread (e, formationQuery, topic = '') {
    const spread = drawSpread(formationQuery)
    if (!spread) {
      await e.reply('牌阵配置异常，请稍后再试')
      return true
    }
    const title = topic ? `${nickname(e)} · ${topic}` : `${nickname(e)} · ${spread.formationName}`
    return renderTarot('tarot/spread', toSpreadView(spread, title), e)
  }

  async 彩虹塔罗牌 (e) {
    return renderTarot('tarot/card', toCardView(drawMajorRainbow(), `${nickname(e)} · 彩虹塔罗`), e)
  }
}
