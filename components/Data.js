import lodash from 'lodash'
import { FileUtils } from '../../../lib/utils/file-utils.js'

const _path = process.cwd()
const plugin = 'logier-plugin'

const getRoot = (root = '') => {
  if (root === 'root' || root === 'yunzai') return `${_path}/`
  if (!root) return `${_path}/plugins/${plugin}/`
  return root
}

const Data = {
  createDir (pathName = '', root = '', includeFile = false) {
    root = getRoot(root)
    const pathList = pathName.split('/')
    let nowPath = root
    pathList.forEach((name, idx) => {
      name = name.trim()
      if (!includeFile && idx <= pathList.length - 1) {
        nowPath += name + '/'
        if (name) FileUtils.ensureDirSync(nowPath)
      }
    })
  },

  async importModule (file, root = '') {
    root = getRoot(root)
    if (!/\.js$/.test(file)) file = file + '.js'
    const full = `${root}/${file}`
    if (!FileUtils.existsSync(full)) return {}
    try {
      return await import(`file://${full}?t=${Date.now()}`) || {}
    } catch (e) {
      console.log(e)
      return {}
    }
  },

  async importCfg (key) {
    const sysCfg = await Data.importModule(`config/system/${key}_system.js`)
    let diyCfg = await Data.importModule(`config/${key}.js`)
    if (diyCfg.isSys) {
      console.error(`logier-plugin: config/${key}.js 无效，已忽略`)
      diyCfg = {}
    }
    return { sysCfg, diyCfg }
  },

  def () {
    for (const idx in arguments) {
      if (!lodash.isUndefined(arguments[idx])) return arguments[idx]
    }
  }
}

export default Data
