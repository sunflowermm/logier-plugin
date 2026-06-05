import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { readAndParseJSON } from '../utils/getdate.js'
import { pluginResources } from './path.js'
const tarotData = await readAndParseJSON('../data/tarot.json')
const CARD_DIR = path.join(pluginResources, 'tarot', 'cards')
const REDIS_DAILY_PREFIX = 'Yunzai:logier-plugin:tarot:daily'

const TYPE_LABEL = {
  MajorArcana: '大阿卡纳',
  Swords: '宝剑',
  Wands: '权杖',
  Cups: '圣杯',
  Pentacles: '星币'
}

const PAIR_LABELS = ['现状', '指引']

const formations = tarotData.formations
const cards = tarotData.cards

const SUIT_PREFIX = { Swords: 's', Wands: 'w', Cups: 'c', Pentacles: 'p' }
const COURT_NUM = { 侍从: 11, 骑士: 12, 王后: 13, 国王: 14 }

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
  if (fs.existsSync(file)) return file
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

export function resolveFormation (name = '') {
  const query = String(name).trim()
  if (!query) return null
  if (formations[query]) return { name: query, ...formations[query] }

  const keys = Object.keys(formations)
  const hit = keys.find(k => k.includes(query) || query.includes(k.replace(/牌阵$/, '')))
  return hit ? { name: hit, ...formations[hit] } : null
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

function pickFormationLabels (formation) {
  const variants = formation.representations || [[]]
  return variants[Math.floor(Math.random() * variants.length)]
}

function spreadLayout (count) {
  const layouts = {
    2: { gridClass: 'layout-2', width: 960, compact: false, cardWidth: 200 },
    3: { gridClass: 'layout-3', width: 1080, compact: false, cardWidth: 188 },
    4: { gridClass: 'layout-4', width: 1080, compact: false, cardWidth: 180 },
    5: { gridClass: 'layout-5', width: 1200, compact: true, cardWidth: 148 },
    6: { gridClass: 'layout-6', width: 1260, compact: true, cardWidth: 140 },
    7: { gridClass: 'layout-7', width: 1320, compact: true, cardWidth: 128 }
  }
  return layouts[count] || layouts[7]
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

  const labels = pickFormationLabels(formation)
  const count = Math.max(labels.length, formation.cards_num || labels.length)
  const layout = spreadLayout(Math.min(count, 7))

  return {
    formationName: formation.name,
    slotCount: count,
    ...layout,
    slots: pickRandomKeys(count).map((key, i) => buildSlot(key, labels[i] || `第${i + 1}张`))
  }
}

export function drawPair () {
  const layout = spreadLayout(2)
  return {
    formationName: '二牌阵',
    slotCount: 2,
    ...layout,
    slots: pickRandomKeys(2).map((key, i) => buildSlot(key, PAIR_LABELS[i]))
  }
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
  const cardWidth = Math.round(318)
  return {
    width: 1080,
    cardWidth,
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

export function toSpreadView (spread, title) {
  return {
    width: spread.width,
    title,
    formationName: spread.formationName,
    gridClass: spread.gridClass,
    cardWidth: spread.cardWidth,
    slotCount: spread.slotCount,
    compact: spread.compact,
    slots: spread.slots,
    bodyClass: `tarot-render w-${spread.width}`
  }
}

export function listFormationsText () {
  return Object.entries(formations).map(([name, cfg]) => {
    const labels = cfg.representations?.[0] || []
    const count = Math.max(labels.length, cfg.cards_num || 0)
    return `${name}（${count}张）\n  ${labels.join(' · ')}`
  }).join('\n\n')
}

export function listHelpText () {
  return [
    '#塔罗 [主题] — 单牌',
    '#二牌 [主题] — 现状 / 指引',
    '#占卜 [主题] — 圣三角牌阵',
    '#牌阵 名称 [主题] — 指定牌阵',
    '#牌阵列表 — 全部牌阵',
    '#查牌名称 — 正逆位牌义（#查牌愚者 或 #查牌 愚者）',
    '#每日塔罗 — 每日一牌',
    '#彩虹塔罗 — 大阿卡纳单牌',
    '#塔罗牌库 — 78张索引',
    '#塔罗帮助 — 本说明'
  ].join('\n')
}

export function listCardIndex () {
  const groups = { MajorArcana: [], Swords: [], Wands: [], Cups: [], Pentacles: [] }
  for (const [key, card] of Object.entries(cards)) {
    groups[card.type]?.push(`${key}.${card.name_cn}`)
  }
  return Object.entries(groups).map(([type, list]) =>
    `${TYPE_LABEL[type] || type}\n${list.join(' · ')}`
  ).join('\n\n')
}
