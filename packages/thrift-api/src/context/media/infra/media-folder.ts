import { knex } from '#src/db/index.js'

export const readMediaFolderPrefix = async (): Promise<string> => {
  const row = await knex('app_config')
    .where({ config_key: 'dam_folder_prefix' })
    .first('config_value')
  return String(row?.config_value ?? 'sellit-media/')
}
