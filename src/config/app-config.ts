export const DATABASE_CONFIG = {
  uri: process.env.DATABASE_URI || '',
  username: process.env.DATABASE_USERNAME || '',
  password: process.env.DATABASE_PASSWORD || '',
}

export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT, 10) || 3000,
}
