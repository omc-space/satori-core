import type { HTTPClient } from '~/core'
import type { IController } from '~/interfaces/controller'

import { fetchAdaptor } from '~/adaptors/fetch'
import { createClient } from '~/core'

export const mockRequestInstance = (
  injectController: new (client: HTTPClient) => IController,
) => {
  const client = createClient(fetchAdaptor)('http://localhost:3000')

  client.injectControllers(injectController)
  return client
}
