import { Injectable, Logger } from '@nestjs/common'
import { BusinessEvents } from '~/constants/business-event.constant'

@Injectable()
export class EventManagerService {
  private readonly logger = new Logger(EventManagerService.name)
  constructor() {}

  emit(eventName: BusinessEvents, data: any) {
    this.logger.log('eventName: ' + eventName + ' ' + 'data:' + data)
  }

  get broadcast() {
    return this.emit
  }
}
