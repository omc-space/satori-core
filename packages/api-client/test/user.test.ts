import { describe, expect, it } from 'vitest'
import { createClient } from '../src/core/client'
import { fetchAdaptor } from '../src/adaptors/fetch'
import { UserController } from '../src'

describe('GET /master', async () => {
  const client = createClient(fetchAdaptor)('http://127.0.0.1:2333',{controllers: [UserController]})
  const res = await client.post.getList()
  
  it('exported', () => {
    expect(res).toMatchInlineSnapshot()
  })
})
