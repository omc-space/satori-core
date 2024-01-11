import { homedir } from 'os'
import { join } from 'path'
import { cwd } from '~/global/env.global'

import { isDev } from '~/app.config'
export const HOME = homedir()

export const DATA_DIR = isDev ? join(cwd, './tmp') : join(HOME, '.satori')

export const LOG_DIR = join(DATA_DIR, 'log')

export const USER_ASSET_DIR = join(DATA_DIR, 'assets')
