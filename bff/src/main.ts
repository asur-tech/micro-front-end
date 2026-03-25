import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, {
  fastifyApolloDrainPlugin,
} from '@as-integrations/fastify';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';

async function start() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true, credentials: true });

  const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(app)],
  });

  await apollo.start();
  await app.register(fastifyApollo(apollo));

  await app.listen({ port: 4005, host: '0.0.0.0' });
  console.log('BFF running on http://localhost:4005');
  console.log('GraphQL playground at http://localhost:4005/graphql');
}

start().catch(console.error);
