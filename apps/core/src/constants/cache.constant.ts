export enum RedisKeys {
  AccessIp = 'access_ip',
  Like = 'like',
  Read = 'read',
  LoginRecord = 'login_record',
  MaxOnlineCount = 'max_online_count',
  IpInfoMap = 'ip_info_map',
  LikeSite = 'like_site',
  /** 后台管理入口页面缓存 */
  AdminPage = 'admin_next_index_entry',
  /** 配置项缓存 */
  ConfigCache = 'config_cache',
  PTYSession = 'pty_session',
  /** HTTP 请求缓存 */
  HTTPCache = 'http_cache',
  /** Snippet 缓存 */
  SnippetCache = 'snippet_cache',

  JWTStore = 'jwt_store',
  /** 最近速记的点赞，点踩记录 */
  RecentlyAttitude = 'recently_attitude',

  Authn = 'authn',
}
export const API_CACHE_PREFIX = 'satori-api-cache:'
export enum CacheKeys {
  SiteMap = `${API_CACHE_PREFIX}aggregate_sitemap`,
  SiteMapXml = `${API_CACHE_PREFIX}aggregate_sitemap_xml`,
  RSS = `${API_CACHE_PREFIX}rss`,
  RSSXml = `${API_CACHE_PREFIX}rss_xml`,
}

export const likeAndReadCacheTTL = 24 * 60 * 60 * 1000 // 1天
