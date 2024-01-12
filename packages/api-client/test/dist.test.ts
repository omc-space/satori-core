import {createClient} from '../dist'
import {fetchAdaptor} from '../dist/adaptors'

const client = createClient(fetchAdaptor,'https://aaaa')
client.injectControllers()
