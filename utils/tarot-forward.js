import BotUtil from '../../../lib/util.js'
import {
  TYPE_LABEL,
  listFormationBriefs,
  listCardsGrouped,
  getSpreadPreviewPath,
  getCardImagePath
} from '../model/tarot.js'
import { FileUtils } from '../../../lib/utils/file-utils.js'

const CARD_TYPE_ORDER = ['MajorArcana', 'Wands', 'Cups', 'Swords', 'Pentacles']

function withImage (text, filePath) {
  if (filePath && FileUtils.existsSync(filePath)) {
    return [text, segment.image(filePath)]
  }
  return text
}

/** #牌阵列表 → 合并转发（每项：牌阵说明 + 预览图） */
export async function replyFormationListForward (e) {
  const briefs = listFormationBriefs()
  const nodes = [
    '【鸢尾花 · 牌阵一览】\n用法：#牌阵 名称 [问事]\n例：#牌阵 圣三角 我今天高兴吗'
  ]

  for (const { name, labels } of briefs) {
    const lines = labels.map((label, i) => `${i + 1}. ${label}`).join('\n')
    const text = `${name}（${labels.length}张）\n${lines}`
    nodes.push(withImage(text, getSpreadPreviewPath(name)))
  }

  await BotUtil.makeChatRecord(e, nodes, '鸢尾花 · 牌阵一览')
}

/** #塔罗牌库 → 合并转发（每张牌编号 + 牌面图） */
export async function replyCardIndexForward (e) {
  const groups = listCardsGrouped()
  const nodes = ['【鸢尾花 · 塔罗牌库】共 78 张\n#查牌名称 或 #查牌 名称 查看牌义']

  for (const type of CARD_TYPE_ORDER) {
    const list = groups[type]
    if (!list?.length) continue
    nodes.push(`—— ${TYPE_LABEL[type] || type}（${list.length}张）——`)
    for (const { key, name } of list) {
      const text = `${key}. ${name}`
      nodes.push(withImage(text, getCardImagePath(key)))
    }
  }

  await BotUtil.makeChatRecord(e, nodes, '鸢尾花 · 塔罗牌库')
}
