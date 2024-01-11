import { describe, expect, it } from 'vitest'
import { mockRequestInstance } from '../helpers/instance'
import { UserController } from '~/controllers'

describe('test user client', () => {
  const client = mockRequestInstance(UserController)

  it('GET /master', async () => {
    const res = await client.user.getMasterInfo()
    expect(res)
  })
})
