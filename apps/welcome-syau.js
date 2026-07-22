import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FileUtils } from '../../../lib/utils/file-utils.js'
import plugin from '../../../lib/plugins/plugin.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** 沈阳农业大学新生官方群 */
const SYAU_GROUP_ID = 1004112115
const RULE_IMAGE = path.join(__dirname, '1.png')

const WELCOME_TEXT = `欢迎加入沈阳农业大学新生官方群！

【改名要求】
请尽快将群名片改为：2x-专业-姓名
示例：25-农学-张三、26-园艺-李四
（2x = 入学年份后两位）

【群规摘要】
1. 文明交流，禁止辱骂、引战、人身攻击
2. 禁止广告、传销、无关链接与二维码
3. 提问请先看群公告 / 群文件，避免重复刷屏
4. 涉及学校通知以官方渠道为准，谨防诈骗
5. 下图为沈阳农业大学学校地图`

export class syauNewcomer extends plugin {
  constructor () {
    super({
      name: '[鸢尾花插件]沈农新生欢迎',
      dsc: '沈阳农业大学新生官方群入群欢迎',
      event: 'notice.group.increase',
      priority: 4990
    })
  }

  async accept () {
    const e = this.e
    if (Number(e.group_id) !== SYAU_GROUP_ID) return
    if (e.user_id === e.self_id || e.user_id === e.bot?.uin) return

    const msg = [segment.at(e.user_id), ' ', WELCOME_TEXT]

    if (FileUtils.existsSync(RULE_IMAGE)) {
      msg.push('\n', segment.image(RULE_IMAGE))
    } else {
      Bot.makeLog('warn', `[沈农新生欢迎] 未找到群规图: ${RULE_IMAGE}`, 'WelcomeSyau')
    }

    await this.reply(msg)
    // 交由 Loader accept 链：返回 true 不再执行后续「欢迎新人」等
    return true
  }
}
