import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { registerOpenApiPaths } from './register-paths.js'

const registry = new OpenAPIRegistry()
registerOpenApiPaths(registry)

export function buildOpenApiDocument(serverUrl) {
  const generator = new OpenApiGeneratorV3(registry.definitions, {})
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Server Dashboard API',
      version: '1.0.0',
      description:
        'Admin dashboard API: authentication, user management, server purchase requests, partner payments, and dashboard summaries. Responses use `{ success, data }` for success and `{ success, code, message, ... }` for errors.',
    },
    servers: [{ url: serverUrl }],
  })
}
