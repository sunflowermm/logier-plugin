import ConfigBase from '../../../lib/commonconfig/commonconfig.js'
import { listFormationEnum, listFormationOptions } from '../model/tarot.js'

export default class TarotConfig extends ConfigBase {
  constructor () {
    super({
      name: 'logier-plugin_tarot',
      displayName: '鸢尾花 · 塔罗',
      description: '#占卜 默认牌阵等塔罗设置（与锅巴配置同步）',
      filePath: 'plugins/logier-plugin/config/Tarot.yaml',
      defaultFilePath: 'plugins/logier-plugin/defSet/Tarot.yaml',
      fileType: 'yaml',
      schema: {
        fields: {
          defaultFormation: {
            type: 'string',
            label: '默认牌阵',
            description: '#占卜 使用的牌阵；#牌阵列表 查看全部公开牌阵',
            component: 'Select',
            enum: listFormationEnum(),
            options: listFormationOptions(),
            default: '圣三角牌阵'
          }
        }
      }
    })
  }
}
