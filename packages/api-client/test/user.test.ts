import { describe, expect, it } from 'vitest'
import { createClient } from '../src/core/client'
import { fetchAdaptor } from '../src/adaptors/fetch'

describe('GET /master', () => {
  const client = createClient(fetchAdaptor,'http://127.0.0.1:3000')
  it('exported', () => {
    expect(1).toEqual(1)
  })
})
