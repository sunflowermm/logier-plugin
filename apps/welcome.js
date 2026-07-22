import { readAndParseJSON } from '../utils/getdate.js'
import { isWelcomeGroupAllowed } from '../model/welcome-config.js'
import plugin from '../../../lib/plugins/plugin.js'

export class newcomer extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]进退群群通知',
      dsc: '进退群群通知',
      event: 'notice.group.increase',
      priority: 4999
    })
  }

  async accept (e) {
    const ev = e || this.e
    if (ev.user_id === ev.self_id || ev.user_id === ev.bot?.uin) return
    if (!await isWelcomeGroupAllowed(ev.group_id)) return

    const welcome = await readAndParseJSON('../data/welcome.json')
    if (!Array.isArray(welcome) || welcome.length === 0) return

    let nickname = ev.nickname || ev.sender?.card || ''
    if (!nickname && ev.group?.getMemberMap) {
      const memberMap = await ev.group.getMemberMap()
      nickname = memberMap?.get(ev.user_id)?.nickname || ''
    }

    const msg = welcome[Math.floor(Math.random() * welcome.length)].replace('{0}', nickname)
    await this.reply([segment.at(ev.user_id), ' ', msg])
    return true
  }
}
