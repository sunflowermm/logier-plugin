import cfg from '../../../lib/config/config.js'
import { FileUtils } from '../../../lib/utils/file-utils.js'

const README_path = `${process.cwd()}/plugins/logier-plugin/README.md`
let currentVersion = '维护版'

const readme = FileUtils.readFileSync(README_path)
if (readme) {
  const reg = /版本[：:]\s*(.+)/.exec(readme)
  if (reg) currentVersion = reg[1].trim()
}

export default {
  get ver () {
    return currentVersion
  },
  get yunzai () {
    return `v${cfg.package.version}`
  },
  get logs () {
    return [{
      version: currentVersion,
      logs: [{
        title: '向日葵维护版：功能资源已全部本地化，详见 README。',
        logs: []
      }]
    }]
  }
}
