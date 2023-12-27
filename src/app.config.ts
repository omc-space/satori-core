export const MONGO_DB = {
  dbName: 'satori',
  host: '127.0.0.1',
  // host: argv.db_host || '10.0.0.33',
  port: 27017,
  user: '',
  password: '',
  get uri() {
    const userPassword =
      this.user && this.password ? `${this.user}:${this.password}@` : ''
    return `mongodb://${userPassword}${this.host}:${this.port}/${this.dbName}`
  },
}
export const isDev = false
