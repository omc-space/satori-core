import { describe, it, expect } from 'vitest'
import { mockRequestInstance } from '../helpers/instance'
import { NoteController } from '~/controllers'

describe('test user client', () => {
  const client = mockRequestInstance(NoteController)

  it('GET /master', async () => {
    const res = await client.note.getList()
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
        "timestamp": "2024-01-11T08:33:25.852Z",
      }
    `)
  })
})
