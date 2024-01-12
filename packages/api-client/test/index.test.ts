import { describe, expect, it } from 'vitest'
import { createClient } from '../src/core/client'
import { fetchAdaptor } from '../src/adaptors/fetch'

describe('should', () => {
  const client = createClient(fetchAdaptor,'http://127.0.0.1:3000')
  
  console.log(client.user)
  it('exported', () => {
    expect(1).toEqual(1)
  })
})
