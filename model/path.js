import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'

const cwd = process.cwd().replace(/\\/g, '/')
const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..').replace(/\\/g, '/')
const pluginName = path.basename(pluginRoot)
const pluginResources = `${pluginRoot}/resources`

export const Path = cwd
export const Plugin_Name = pluginName
export const Plugin_Path = `${cwd}/plugins/${pluginName}`

export function pluginAssetUrl (relativePath) {
  return pathToFileURL(path.join(pluginRoot, relativePath)).href
}

export {
  cwd as _path,
  pluginRoot,
  pluginResources
}
