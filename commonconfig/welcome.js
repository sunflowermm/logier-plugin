import ConfigBase from '../../../lib/commonconfig/commonconfig.js'

export default class WelcomeConfig extends ConfigBase {
  constructor () {
    super({
      name: 'logier-plugin_welcome',
      displayName: '鸢尾花 · 入群欢迎',
      description: '入群欢迎白名单：仅配置的群会发送欢迎语',
      filePath: 'plugins/logier-plugin/config/Welcome.yaml',
      defaultFilePath: 'plugins/logier-plugin/defSet/Welcome.yaml',
      fileType: 'yaml',
      schema: {
        fields: {
          whiteGroup: {
            type: 'array',
            label: '白名单群',
            description: '仅这些群发送入群欢迎；为空则不欢迎任何群',
            itemType: 'string',
            default: [],
            component: 'Tags'
          }
        }
      }
    })
  }
}
