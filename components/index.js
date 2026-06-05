const Path = process.cwd();
const Plugin_Name = 'logier-plugin'
const Plugin_Path = `${Path}/plugins/${Plugin_Name}`;
import Version from './Version.js'
import Data from './Data.js'
import render, {
  renderHtmlImage,
  screenshotHtml,
  screenshotHtmlWithFallback,
  replyAtImage,
  atUser,
  PLUGIN_RENDER_OPTS
} from './renderer.js'
export {
  render,
  renderHtmlImage,
  screenshotHtml,
  screenshotHtmlWithFallback,
  replyAtImage,
  atUser,
  PLUGIN_RENDER_OPTS,
  Data,
  Version,
  Path,
  Plugin_Name,
  Plugin_Path
}