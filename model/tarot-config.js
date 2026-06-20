import ConfigLoader from '../../../lib/commonconfig/loader.js'

export const TAROT_CONFIG_KEY = 'logier-plugin_tarot'

const FALLBACK = { defaultFormation: '圣三角牌阵' }

let cache = null
let cacheAt = 0
const CACHE_TTL = 5000

function configInst () {
  return ConfigLoader.get(TAROT_CONFIG_KEY)
}

export async function getTarotConfig () {
  const now = Date.now()
  if (cache && now - cacheAt < CACHE_TTL) return { ...cache }

  const inst = configInst()
  if (!inst) {
    cache = { ...FALLBACK }
    cacheAt = now
    return { ...cache }
  }

  try {
    cache = await inst.read()
    cacheAt = now
    return { ...cache }
  } catch (err) {
    Bot.makeLog('warn', `[logier-plugin] 读取塔罗配置失败: ${err?.message || err}`, 'TarotConfig')
    cache = { ...FALLBACK }
    cacheAt = now
    return { ...cache }
  }
}

export async function saveTarotConfig (partial) {
  const inst = configInst()
  if (!inst) throw new Error('塔罗 CommonConfig 未加载')
  const current = await inst.read(false)
  const next = { ...current, ...partial }
  await inst.write(next)
  cache = next
  cacheAt = Date.now()
}
