import path from 'path'
import fs from 'node:fs'
import { pathToFileURL, fileURLToPath } from 'url'
import { FileUtils } from '../../../lib/utils/file-utils.js'
import { pluginRoot } from '../model/path.js'
import { pickGalleryFile, toFileUrl } from './gallery-image.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GALLERY_DIR = path.join(pluginRoot, 'resources/gallery')
const IMAGE_EXT = new Set(['.jpg', '.png', '.gif', '.jpeg', '.webp'])

export function pluginAssetUrl (relativePath) {
  return pathToFileURL(path.join(pluginRoot, relativePath)).href
}

/** 仅从插件本地 gallery 取背景图，不访问任何外部 API */
export async function getLocalGalleryImage (opts = {}) {
  if (typeof opts === 'string') {
    const dir = path.join(GALLERY_DIR, opts)
    const file = await getRandomUrl(dir)
    return toFileUrl(file)
  }
  const file = pickGalleryFile(opts)
  return toFileUrl(file)
}

export async function readAndParseJSON (filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath)
  const fileContent = await FileUtils.readFile(abs)
  if (!fileContent) {
    logger.info('[鸢尾花插件] json 读取失败')
    return null
  }
  try {
    return JSON.parse(fileContent)
  } catch {
    logger.info('[鸢尾花插件] json 解析失败')
    return null
  }
}

export function getTimeOfDay () {
  const hours = new Date().getHours()
  if (hours < 6) return '凌晨'
  if (hours < 12) return '上午'
  if (hours < 18) return '下午'
  return '晚上'
}

export async function numToChinese (num) {
  const units = ['', '十', '百', '千']
  const nums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  let result = ''
  const strNum = num.toString()
  const len = strNum.length
  for (let i = 0; i < len; i++) {
    const curNum = parseInt(strNum[i])
    const unit = units[len - 1 - i]
    if (curNum === 0) {
      if (result.slice(-1) !== '零') result += '零'
    } else {
      result += nums[curNum] + unit
    }
  }
  return result.replace(/零+$/, '')
}

function collectImageFiles (dirPath, imageFiles = []) {
  if (!FileUtils.existsSync(dirPath)) return imageFiles
  for (const ent of FileUtils.readDirSync(dirPath, { withFileTypes: true })) {
    const filePath = path.join(dirPath, ent.name)
    if (ent.isDirectory?.()) {
      collectImageFiles(filePath, imageFiles)
    } else if (IMAGE_EXT.has(path.extname(ent.name).toLowerCase())) {
      imageFiles.push(filePath)
    }
  }
  return imageFiles
}

function isDirectory (target) {
  try {
    return fs.statSync(target).isDirectory()
  } catch {
    return false
  }
}

export async function getRandomUrl (imageUrls) {
  let imageUrl = Array.isArray(imageUrls)
    ? imageUrls[Math.floor(Math.random() * imageUrls.length)]
    : imageUrls

  if (FileUtils.existsSync(imageUrl) && isDirectory(imageUrl)) {
    const imageFiles = collectImageFiles(imageUrl)
    if (imageFiles.length > 0) {
      imageUrl = imageFiles[Math.floor(Math.random() * imageFiles.length)]
    }
  }

  return imageUrl
}
// 许月珍真扫