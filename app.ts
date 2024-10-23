import 'zod-openapi/extend';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import fastify from 'fastify';
import {
  type FastifyZodOpenApiSchema,
  type FastifyZodOpenApiTypeProvider,
  fastifyZodOpenApiPlugin,
  fastifyZodOpenApiTransform,
  fastifyZodOpenApiTransformObject,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-zod-openapi';
import { z } from 'zod';
import { type ZodOpenApiVersion } from 'zod-openapi';

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const openapi: ZodOpenApiVersion = '3.0.3';

await app.register(fastifyZodOpenApiPlugin, { openapi });
await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'hello world',
      version: '1.0.0',
    },
    openapi,
  },
  transform: fastifyZodOpenApiTransform,
  transformObject: fastifyZodOpenApiTransformObject,
});
await app.register(fastifySwaggerUI, {
  routePrefix: '/documentation',
});

const job = z.object({
  jobId: z.string(),
  jobName: z.string(),
}).openapi({
  description: 'Job',
  ref: 'job',
})

app.withTypeProvider<FastifyZodOpenApiTypeProvider>().route({
  method: 'POST',
  url: '/',
  schema: {
    body: job,
    response: {
      200: job,
    },
  } satisfies FastifyZodOpenApiSchema,
  handler: async (_req, res) =>
    res.send({
      jobId: '60002023',
      jobName: 'job_name',
    }),
});
await app.ready();
await app.listen({ port: 5000 });
