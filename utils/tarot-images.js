/** 从 tarotchina.net Brand_Link 解析本地牌图文件名 */
export function brandLinkToRemoteName (brandLink) {
  if (!brandLink) return null
  let m = brandLink.match(/major-arcana(\d+)-vip/)
  if (m) return `a${m[1]}.webp`
  for (const [suit, prefix] of [
    ['swords', 's'],
    ['wands', 'w'],
    ['cups', 'c'],
    ['pentacles', 'p']
  ]) {
    m = brandLink.match(new RegExp(`suit-of-${suit}(\\d+)-vip`))
    if (m) return `${prefix}${m[1]}.webp`
  }
  return null
}
