import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'

export function loadYamlFile(filePath: string): any {
  const absolutePath = path.resolve(filePath)
  const fileContents = fs.readFileSync(absolutePath, 'utf8')
  return yaml.load(fileContents)
}

export function loadUserData(dir: string): { [key: string]: any } {
  const userData: { [key: string]: any } = {}
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      // For directories, load data and merge it.
      const nestedData = loadUserData(fullPath)
      Object.assign(userData, nestedData)
    } else if (
      item.isFile() &&
      (item.name.endsWith('.yml') || item.name.endsWith('.yaml'))
    ) {
      const fileData = loadYamlFile(fullPath)
      Object.assign(userData, fileData)
    }
  }
  return userData
}
