import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'url'
import { FileUtils } from '../../../lib/utils/file-utils.js'
import { pluginRoot } from '../model/path.js'

const GALLERY_DIR = path.join(pluginRoot, 'resources/gallery')
const IMAGE_EXT = new Set(['.jpg', '.png', '.gif', '.jpeg', '.webp'])
const FALLBACK = path.join(GALLERY_DIR, '92095127.webp')

/** 读取本地图片宽高（无需额外依赖） */
export function readImageSize (filePath) {
  let buf
  try {
    buf = fs.readFileSync(filePath)
  } catch {
    return null
  }
  if (!buf?.length) return null

  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    let i = 2
    while (i < buf.length) {
      if (buf[i] !== 0xFF) { i++; continue }
      const marker = buf[i + 1]
      if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 9) }
      }
      const len = buf.readUInt16BE(i + 2)
      i += 2 + len
    }
  }
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    if (buf.toString('ascii', 12, 16) === 'VP8X') {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3)
      }
    }
  }
  return null
}

function listGalleryFiles (dir = GALLERY_DIR, out = []) {
  if (!FileUtils.existsSync(dir)) return out
  for (const ent of FileUtils.readDirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory?.()) {
      listGalleryFiles(full, out)
    } else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) {
      out.push(full)
    }
  }
  return out
}

/**
 * 按画幅挑选本地 gallery 图，避免竖图被拉扁、横图被裁切异常
 * @param {{ minRatio?: number, maxRatio?: number, minWidth?: number }} opts
 */
export function pickGalleryFile (opts = {}) {
  const { minRatio = 1.2, maxRatio = 8, minWidth = 1200 } = opts
  const candidates = []
  for (const file of listGalleryFiles()) {
    const size = readImageSize(file)
    if (!size?.width || !size?.height) continue
    const ratio = size.width / size.height
    if (ratio >= minRatio && ratio <= maxRatio && size.width >= minWidth) {
      candidates.push(file)
    }
  }
  const pool = candidates.length ? candidates : listGalleryFiles()
  if (!pool.length) return FALLBACK
  return pool[Math.floor(Math.random() * pool.length)]
}

export function toFileUrl (filePath) {
  if (FileUtils.existsSync(filePath)) {
    return pathToFileURL(path.resolve(filePath)).href
  }
  return pathToFileURL(FALLBACK).href
}

/** 生成 object-fit: cover 的 img 样式与推荐容器尺寸 */
export function layoutForImage (filePath, boxW, boxH) {
  const size = readImageSize(filePath)
  const ratio = size ? size.width / size.height : 16 / 9
  const boxRatio = boxW / boxH
  let w = boxW
  let h = boxH
  if (ratio > boxRatio) {
    h = boxH
    w = Math.ceil(boxH * ratio)
  } else {
    w = boxW
    h = Math.ceil(boxW / ratio)
  }
  return {
    url: toFileUrl(filePath),
    width: size?.width,
    height: size?.height,
    ratio,
    boxW,
    boxH,
    imgCss: `width:${w}px;height:${h}px;max-width:none;object-fit:cover;object-position:center;display:block;margin:0 auto;`
  }
}
