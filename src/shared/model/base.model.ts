export class BaseModel {
  created?: Date

  id: string

  static get protectedKeys() {
    return ['created', 'id', '_id']
  }
}
