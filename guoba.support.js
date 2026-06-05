import path from 'path'
import setting from './model/setting.js'
import lodash from 'lodash'

const _path = process.cwd() + '/plugins/logier-plugin'

export function supportGuoba () {
  return {
    pluginInfo: {
      name: '鸢尾花插件',
      title: '鸢尾花插件(logier-plugin)',
      author: '@sunflower / XRK-Yunzai',
      authorLink: 'https://github.com/sunflowermm/logier-plugin',
      link: 'https://github.com/sunflowermm/logier-plugin',
      isV3: true,
      isV2: false,
      description: '运势系列与塔罗占卜（本地渲染）',
      icon: 'mdi:stove',
      iconColor: '#d19f56',
      iconPath: path.join(_path, 'resources/img/-zue37Q5-e39pZlT3cSiw-il.jpeg')
    },
    configInfo: {
      schemas: [
        {
          field: 'Tarot.defaultFormation',
          label: '默认牌阵',
          bottomHelpMessage: '#占卜 使用的牌阵名称',
          component: 'Input'
        }
      ],
      getConfigData () {
        return setting.merge()
      },
      setConfigData (data, { Result }) {
        const config = {}
        for (const [keyPath, value] of Object.entries(data)) {
          lodash.set(config, keyPath, value)
        }
        setting.analysis(lodash.merge({}, setting.merge(), config))
        return Result.ok({}, '保存成功~')
      }
    }
  }
}
