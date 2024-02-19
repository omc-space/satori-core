import { describe, expect, it } from 'vitest'
import { createClient } from '../src/core/client'
import { fetchAdaptor } from '../src/adaptors/fetch'
import { NoteController } from 'src'

describe('should', async () => {
  const client = createClient(fetchAdaptor)('http://127.0.0.1:2333',{controllers: [NoteController]})
  const res = await client.post.getList()
  res.data
  it('res', () => {
    expect(res).toMatchInlineSnapshot(`
      {
        "code": 200,
        "data": {
          "docs": [
            {
              "Id": "659a32f0e92e474139bff798",
              "allowComment": true,
              "commentsIndex": 0,
              "count": {
                "like": 0,
                "read": 0,
              },
              "created": "2024-01-07T05:13:20.757Z",
              "hasMemory": true,
              "hide": false,
              "id": "659a32f0e92e474139bff798",
              "images": [
                {
                  "accent": "#f279df",
                  "height": 57,
                  "src": "http://dummyimage.com/300x600",
                  "type": "officia magna minim Excepteur",
                  "width": 64,
                },
              ],
              "meta": null,
              "modified": null,
              "mood": "et qui",
              "music": [
                {
                  "id": "23",
                  "type": "deserunt",
                },
              ],
              "nid": 2,
              "secret": "2020-12-06T12:47:06.000Z",
              "text": "ipsum non elit deserunt",
              "title": "2",
              "updated": "2024-01-07T05:13:20.757Z",
              "weather": "consectetur",
            },
          ],
          "hasNextPage": false,
          "hasPrevPage": false,
          "limit": 10,
          "nextPage": null,
          "page": 1,
          "pagingCounter": 1,
          "prevPage": null,
          "totalDocs": 1,
          "totalPages": 1,
        },
        "message": "success",
        "timestamp": "2024-02-19T00:24:35.612Z",
      }
    `)
  })
})
