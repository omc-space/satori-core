export const systemDefaultConfig = {
  keys: {
    header: [
      {
        name: '首页',
        path: '/',
        iconClass: 'i-tabler:alpha',
        children: [
          {
            name: '自述',
            path: '/about',
          },
          {
            name: '留言',
            path: '/message',
          },
          {
            name: '时间线',
            path: '/timeline',
          },
        ],
      },
      {
        name: '文稿',
        path: '/post',
        iconClass: 'i-tabler:file-description',
        children: [],
      },
      {
        name: '手记',
        path: '/note/latest',
        iconClass: 'i-tabler:notebook',
      },
      {
        name: '速览',
        path: '/timeline',
        iconClass: 'i-tabler:list-details',
      },
      {
        name: '友链',
        path: '/friends',
        iconClass: 'i-tabler:link',
      },
      {
        name: '更多',
        iconClass: 'i-tabler:alphabet-cyrillic',
        children: [
          {
            name: '一言',
            path: '/more/say',
            iconClass: 'i-tabler:music',
          },
        ],
      },
    ],
    other: {
      // icp: 'xxxx',
    },
    theme: [
      {
        primary: '#089773',
        spotlight: '#e6f7f3',
      },
      {
        primary: '#f9bfb7',
        spotlight: '#faeae7',
      },
    ],
  },
}
