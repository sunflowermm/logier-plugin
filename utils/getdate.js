import path from 'path'
import { fileURLToPath } from 'url'
import { FileUtils } from '../../../lib/utils/file-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
