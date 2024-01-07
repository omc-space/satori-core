import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston'
import * as winston from 'winston'
import { join } from 'path'
import dayjs from 'dayjs'
import { createLogger } from 'winston'
import * as pkg from '../../package.json'
import { LOG_DIR } from '~/constants/path.constant'
import { LOG_MAX_SIZE } from '~/constants/system.constant'

const instance = createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike(pkg.name.toUpperCase(), {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winston.transports.File({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike(pkg.name.toUpperCase(), {
          colors: true,
          prettyPrint: true,
        }),
      ),
      //TODO: 文件名包含':'就无法正常生成log文件
      filename: join(LOG_DIR, `${dayjs().format('YYYY-MM-DD HH.mm.ss')}.log`),
      maxsize: LOG_MAX_SIZE,
    }),
    // other transports...
  ],
})

export default WinstonModule.createLogger({ instance })
export const logger = instance
