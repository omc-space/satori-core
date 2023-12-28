import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston'
import * as winston from 'winston'
import { join } from 'path'
import * as dayjs from 'dayjs'
import { createLogger } from 'winston'

const instance = createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    new winston.transports.File({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          colors: true,
          prettyPrint: true,
        }),
      ),
      filename: join(
        process.cwd(),
        `logs/${dayjs().format('MM-DD HH:mm:ss')}.log`,
      ),
    }),
    // other transports...
  ],
})

export default WinstonModule.createLogger({ instance })
