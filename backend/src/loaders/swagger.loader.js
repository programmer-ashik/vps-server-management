import swaggerUi from 'swagger-ui-express'
import { buildOpenApiDocument } from '../docs/openapi/build-openapi-document.js'
import { config } from '../config/env.js'

export function setupSwagger(app) {
  const serverUrl = `http://localhost:${config.port}`
  const document = buildOpenApiDocument(serverUrl)

  const setup = swaggerUi.setup(document, {
    customSiteTitle: 'Server Dashboard API',
  })

  app.use('/api/docs', swaggerUi.serve, setup)
  app.use('/api-docs', swaggerUi.serve, setup)
  app.get('/api/docs.json', (_req, res) => res.json(document))
  app.get('/api-docs.json', (_req, res) => res.json(document))
}
