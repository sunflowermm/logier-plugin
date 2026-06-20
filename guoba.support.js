import path from 'path'
import { listFormationOptions } from './model/tarot.js'
import { getTarotConfig, saveTarotConfig } from './model/tarot-config.js'
import { pluginRoot } from './model/path.js'

export function supportGuoba () {
  const formationOptions = listFormationOptions()

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
      iconPath: path.join(pluginRoot, 'resources/img/logo.png')
    },
    configInfo: {
      schemas: [
        {
          field: 'defaultFormation',
          label: '默认牌阵',
          bottomHelpMessage: '#占卜 使用的牌阵；亦可在 XRK 控制台编辑「鸢尾花 · 塔罗」',
          component: 'Select',
          componentProps: { options: formationOptions }
        }
      ],
      async getConfigData () {
        return getTarotConfig()
      },
      async setConfigData (data, { Result }) {
        const value = data.defaultFormation ?? data['Tarot.defaultFormation']
        if (!value) return Result.error({}, '请选择默认牌阵')
        await saveTarotConfig({ defaultFormation: value })
        return Result.ok({}, '保存成功~')
      }
    }
  }
}
