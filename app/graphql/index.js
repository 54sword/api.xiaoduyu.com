
import { makeExecutableSchema } from 'graphql-tools'

import typeDefs from './schemas'
import resolvers from './resolvers'

module.exports = makeExecutableSchema({ typeDefs, resolvers })
