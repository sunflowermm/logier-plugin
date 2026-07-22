import ConfigLoader from '../../../lib/commonconfig/loader.js'

export const WELCOME_CONFIG_KEY = 'logier-plugin_welcome'

const FALLBACK = { whiteGroup: [] }

let cache = null
let cacheAt = 0
const CACHE_TTL = 5000

function configInst () {
  return ConfigLoader.get(WELCOME_CONFIG_KEY)
}

export async function getWelcomeConfig () {
  const now = Date.now()
  if (cache && now - cacheAt < CACHE_TTL) return { ...cache }

  const inst = configInst()
  if (!inst) {
    cache = { ...FALLBACK, whiteGroup: [...FALLBACK.whiteGroup] }
    cacheAt = now
    return { ...cache, whiteGroup: [...cache.whiteGroup] }
  }

  try {
    const data = await inst.read()
    cache = {
      whiteGroup: Array.isArray(data?.whiteGroup) ? data.whiteGroup : []
    }
    cacheAt = now
    return { ...cache, whiteGroup: [...cache.whiteGroup] }
  } catch (err) {
    Bot.makeLog('warn', `[logier-plugin] 读取入群欢迎配置失败: ${err?.message || err}`, 'WelcomeConfig')
    cache = { ...FALLBACK, whiteGroup: [...FALLBACK.whiteGroup] }
    cacheAt = now
    return { ...cache, whiteGroup: [...cache.whiteGroup] }
  }
}

/** 群是否在入群欢迎白名单内（空名单 = 不欢迎任何群） */
export async function isWelcomeGroupAllowed (groupId) {
  const { whiteGroup } = await getWelcomeConfig()
  if (!Array.isArray(whiteGroup) || whiteGroup.length === 0) return false
  const ids = [Number(groupId), String(groupId)]
  return whiteGroup.some(id => ids.includes(Number(id)) || ids.includes(String(id)))
}
