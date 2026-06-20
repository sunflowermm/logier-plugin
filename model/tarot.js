import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { FileUtils } from '../../../lib/utils/file-utils.js'
import { readAndParseJSON } from '../utils/getdate.js'
import { pluginResources, pluginRoot } from './path.js'

const tarotData = await readAndParseJSON('../data/tarot.json')
const CARD_DIR = path.join(pluginResources, 'tarot', 'cards')
const REDIS_DAILY_PREFIX = 'Yunzai:logier-plugin:tarot:daily'

export const TYPE_LABEL = {
  MajorArcana: '大阿卡纳',
  Swords: '宝剑',
  Wands: '权杖',
  Cups: '圣杯',
  Pentacles: '星币'
}

/** slotUi → 牌面朝向文案（仅横放/竖放等特殊朝向） */
const SLOT_ORIENT = {
  'cross-under': '竖放',
  'cross-overlay': '横放',
  'landscape-f4': '横放'
}

const LAYOUTS = tarotData?.layouts || {}
const formations = tarotData?.formations || {}
const cards = tarotData?.cards || {}

const SUIT_PREFIX = { Swords: 's', Wands: 'w', Cups: 'c', Pentacles: 'p' }
const COURT_NUM = { 侍从: 11, 骑士: 12, 王后: 13, 国王: 14 }

function formationAliases (name, cfg) {
  const set = new Set([name, name.replace(/牌阵$/, ''), ...(cfg.aliases || [])])
  return [...set].filter(Boolean).sort((a, b) => b.length - a.length)
}

function resolveImageName (key, card) {
  if (card?.image) return card.image
  const n = Number(key)
  if (card?.type === 'MajorArcana' && n >= 0 && n <= 21) return `a${n}.webp`
  const prefix = SUIT_PREFIX[card?.type]
  if (!prefix) return 'a0.webp'
  const cn = card.name_cn || ''
  for (const [name, num] of Object.entries(COURT_NUM)) {
    if (cn.includes(name)) return `${prefix}${num}.webp`
  }
  const picNum = card.pic?.match(/-0*(\d+)/)
  if (picNum) return `${prefix}${parseInt(picNum[1], 10)}.webp`
  const cnNum = cn.match(/(?:宝剑|权杖|圣杯|星币)(\d{1,2})$/)
  if (cnNum) return `${prefix}${parseInt(cnNum[1], 10)}.webp`
  if (/ACE/i.test(cn)) return `${prefix}1.webp`
  return `${prefix}1.webp`
}

function cardFile (cardKey) {
  const card = cards[cardKey]
  const image = resolveImageName(cardKey, card)
  const file = path.join(CARD_DIR, image)
  if (FileUtils.existsSync(file)) return file
  return path.join(CARD_DIR, 'a0.webp')
}

function cardImageUrl (cardKey) {
  return pathToFileURL(cardFile(cardKey)).href
}

function drawPosition (card, up = Math.random() < 0.5) {
  return {
    up,
    label: up ? '正位' : '逆位',
    meaning: up ? card.meaning.up : card.meaning.down,
    description: up ? card.info.description : card.info.reverseDescription
  }
}

function pickRandomKeys (count, excludeKeys = []) {
  const pool = Object.keys(cards).filter(k => !excludeKeys.includes(k))
  const picked = []
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked
}

function pickFormationLabels (formation) {
  const variants = formation.positions || [[]]
  return variants[Math.floor(Math.random() * variants.length)]
}

function getLayout (formation) {
  const labels = pickFormationLabels(formation)
  const layout = LAYOUTS[formation.layout]
  if (!layout || layout.areas.length !== labels.length) return null
  return { labels, layout }
}

function slotTitle (nameCn, slotClass = '') {
  const orient = SLOT_ORIENT[slotClass]
  return orient ? `${nameCn} · ${orient}` : nameCn
}

function attachLayoutSlots (slots, layout) {
  return slots.map((slot, i) => {
    const slotClass = layout.slotUi?.[i] || ''
    return {
      ...slot,
      gridArea: layout.areas[i],
      slotClass,
      seq: i + 1,
      title: slotTitle(slot.card.name_cn, slotClass)
    }
  })
}

function extractCrossCenter (slots) {
  const underI = slots.findIndex(s => s.slotClass === 'cross-under')
  const overI = slots.findIndex(s => s.slotClass === 'cross-overlay')
  if (underI < 0 || overI < 0) return { slots, crossCenter: null }
  return {
    crossCenter: { under: slots[underI], over: slots[overI] },
    slots: slots.filter((_, i) => i !== underI && i !== overI)
  }
}

function buildSpread (formationName, labels, layout) {
  const count = labels.length
  return {
    formationName,
    slotCount: count,
    width: layout.width,
    cardWidth: layout.cardWidth,
    gridClass: layout.gridClass,
    slots: attachLayoutSlots(
      pickRandomKeys(count).map((key, i) => buildSlot(key, labels[i] || `第${i + 1}张`)),
      layout
    )
  }
}

/** 校验牌阵与布局配置是否一致（测试脚本用） */
export function validateTarotConfig () {
  const errors = []
  for (const [name, cfg] of Object.entries(formations)) {
    const labels = cfg.positions?.[0] || []
    if (!labels.length) errors.push(`${name}: 缺少 positions`)
    if (!cfg.layout) errors.push(`${name}: 缺少 layout`)
    else if (!LAYOUTS[cfg.layout]) errors.push(`${name}: 未知 layout「${cfg.layout}」`)
    else if (LAYOUTS[cfg.layout].areas.length !== labels.length) {
      errors.push(`${name}: layout 区域数 ${LAYOUTS[cfg.layout].areas.length} ≠ 牌位 ${labels.length}`)
    }
  }
  return errors
}

export function resolveFormation (name = '') {
  const query = String(name).trim()
  if (!query) return null
  if (formations[query]) return { name: query, ...formations[query] }

  for (const [nameKey, cfg] of Object.entries(formations)) {
    for (const alias of formationAliases(nameKey, cfg)) {
      if (query === alias || query.includes(alias) || alias.includes(query)) {
        return { name: nameKey, ...cfg }
      }
    }
  }
  return null
}

export function parseSpreadInput (rest = '') {
  const raw = String(rest || '').trim()
  if (!raw) return { formationQuery: '', topic: '' }

  if (/\s/.test(raw)) {
    const parts = raw.split(/\s+/)
    const formationQuery = parts.shift()
    return { formationQuery, topic: parts.join(' ').trim() }
  }

  const sorted = Object.entries(formations).sort((a, b) => b[0].length - a[0].length)
  for (const [name, cfg] of sorted) {
    for (const alias of formationAliases(name, cfg)) {
      if (raw.startsWith(alias)) {
        return { formationQuery: name, topic: raw.slice(alias.length).trim() }
      }
    }
  }

  return { formationQuery: raw, topic: '' }
}

export function resolveCard (query = '') {
  const raw = String(query).trim()
  if (!raw) return null
  const compact = raw.replace(/\s+/g, '')
  const lower = compact.toLowerCase()

  if (/^\d+$/.test(compact) && cards[compact]) return compact

  for (const [key, card] of Object.entries(cards)) {
    const cn = card.name_cn.replace(/\s+/g, '')
    const en = card.name_en.replace(/\s+/g, '').toLowerCase()
    if (cn === compact || en === lower) return key
    if (card.pic.replace(/\s+/g, '') === compact) return key
  }

  const aceMatch = compact.match(/^(宝剑|权杖|圣杯|星币)(?:ace|ACE|A|a|1|一|首牌)?$/)
  if (aceMatch) {
    const suitMap = { 宝剑: 'Swords', 权杖: 'Wands', 圣杯: 'Cups', 星币: 'Pentacles' }
    const hit = Object.entries(cards).find(([, c]) => c.type === suitMap[aceMatch[1]] && /ACE/i.test(c.name_cn))
    if (hit) return hit[0]
  }

  let best = null
  let bestLen = Infinity
  for (const [key, card] of Object.entries(cards)) {
    const cn = card.name_cn.replace(/\s+/g, '')
    const en = card.name_en.replace(/\s+/g, '').toLowerCase()
    if (cn.includes(compact) || compact.includes(cn) || en.includes(lower) || card.pic.includes(compact)) {
      if (cn.length < bestLen) {
        best = key
        bestLen = cn.length
      }
    }
  }
  return best
}

export function buildSlot (key, role = '抽牌', up) {
  const card = cards[key]
  const pos = drawPosition(card, up)
  return {
    role: role ?? '抽牌',
    key,
    card,
    ...pos,
    reversed: !pos.up,
    typeLabel: TYPE_LABEL[card.type] || card.type,
    imageUrl: cardImageUrl(key)
  }
}

export function drawSpread (formationName) {
  const formation = resolveFormation(formationName)
  if (!formation) return null
  const resolved = getLayout(formation)
  if (!resolved) return null
  return buildSpread(formation.name, resolved.labels, resolved.layout)
}

function previewSlug (name) {
  return String(name).replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '') || 'spread'
}

export function spreadPreviewName (formationName) {
  return `spread-${previewSlug(formationName)}.png`
}

export function getSpreadPreviewPath (formationName) {
  const file = path.join(pluginRoot, 'docs/previews', spreadPreviewName(formationName))
  return FileUtils.existsSync(file) ? file : null
}

export function getCardImagePath (cardKey) {
  return cardFile(cardKey)
}

export function listFormationBriefs ({ internal = false } = {}) {
  return Object.entries(formations)
    .filter(([, cfg]) => internal || !cfg.internal)
    .map(([name, cfg]) => ({
      name,
      labels: cfg.positions?.[0] || []
    }))
}

export function listCardsGrouped () {
  const groups = { MajorArcana: [], Swords: [], Wands: [], Cups: [], Pentacles: [] }
  for (const [key, card] of Object.entries(cards)) {
    if (groups[card.type]) groups[card.type].push({ key, name: card.name_cn })
  }
  for (const type of Object.keys(groups)) {
    groups[type].sort((a, b) => {
      const na = Number(a.key)
      const nb = Number(b.key)
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb
      return String(a.key).localeCompare(String(b.key))
    })
  }
  return groups
}

export function listFormationNames ({ internal = false } = {}) {
  return Object.entries(formations)
    .filter(([, cfg]) => internal || !cfg.internal)
    .map(([name]) => name)
}

/** CommonConfig / 锅巴 Select 选项（公开牌阵） */
export function listFormationOptions () {
  return Object.entries(formations)
    .filter(([, cfg]) => !cfg.internal)
    .map(([name, cfg]) => {
      const count = cfg.positions?.[0]?.length ?? 0
      return { label: `${name}（${count}张）`, value: name }
    })
}

export function listFormationEnum () {
  return listFormationOptions().map(o => o.value)
}

export function drawSingle () {
  return buildSlot(pickRandomKeys(1)[0], '单牌')
}

export function drawMajorRainbow () {
  const pool = Object.keys(cards).filter(k => Number(k) >= 0 && Number(k) <= 21)
  return buildSlot(pool[Math.floor(Math.random() * pool.length)], '彩虹塔罗')
}

export function drawLookup (query) {
  const key = resolveCard(query)
  if (!key) return null
  const card = cards[key]
  return {
    key,
    card,
    typeLabel: TYPE_LABEL[card.type] || card.type,
    imageUrl: cardImageUrl(key),
    meaning: `正位：${card.meaning.up}\n逆位：${card.meaning.down}`,
    description: `【正位】${card.info.description}\n\n【逆位】${card.info.reverseDescription}`,
    position: '牌义参考',
    label: '牌义参考',
    reversed: false
  }
}

export async function drawDaily (userId) {
  const date = new Date().toLocaleDateString('zh-CN')
  const cacheKey = `${REDIS_DAILY_PREFIX}:${userId}:${date}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    const data = JSON.parse(cached)
    return { ...buildSlot(data.key, '今日指引', data.up), cached: true }
  }
  const key = pickRandomKeys(1)[0]
  const up = Math.random() < 0.5
  await redis.set(cacheKey, JSON.stringify({ key, up }))
  return { ...buildSlot(key, '今日指引', up), cached: false }
}

export function toCardView (draw, title, extra = {}) {
  return {
    width: 1080,
    cardWidth: 318,
    title,
    nameCn: draw.card.name_cn,
    nameEn: draw.card.name_en,
    typeLabel: draw.typeLabel,
    meaning: draw.meaning,
    description: draw.description,
    position: draw.label,
    reversed: draw.reversed,
    imageUrl: draw.imageUrl,
    bodyClass: 'tarot-render w-1080',
    ...extra
  }
}

export function toSpreadView (spread, meta = {}) {
  const { userName = '', topic = '' } = meta
  const { slots, crossCenter } = extractCrossCenter(spread.slots)
  return {
    width: spread.width,
    userName,
    topic,
    formationName: spread.formationName,
    gridClass: spread.gridClass,
    cardWidth: spread.cardWidth,
    slotCount: spread.slotCount,
    slots,
    crossCenter,
    bodyClass: `tarot-render w-${spread.width}`
  }
}

export function listHelpText () {
  return [
    '#塔罗 [主题] — 单牌',
    '#二牌 [主题] — 现状 / 指引',
    '#占卜 [主题] — 圣三角牌阵',
    '#牌阵 名称 [主题] — 指定牌阵（可连写，如 #牌阵圣三角我今天高兴吗）',
    '#牌阵列表 — 合并转发牌阵预览',
    '#查牌名称 — 正逆位牌义（#查牌愚者 或 #查牌 愚者）',
    '#每日塔罗 — 每日一牌',
    '#彩虹塔罗 — 大阿卡纳单牌',
    '#塔罗牌库 — 合并转发78张牌面',
    '#塔罗帮助 — 本说明'
  ].join('\n')
}
