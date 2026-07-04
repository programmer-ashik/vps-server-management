import { z } from '../../core/validation/zod-openapi.js'
import { loginSchema } from '../../api/v1/auth/auth.validators.js'
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from '../../api/v1/users/users.validators.js'
import {
  createTodoSchema,
  updateTodoSchema,
} from '../../api/v1/todos/todos.validators.js'
import {
  createServerRequestSchema,
  updateServerRequestSchema,
  updatePaymentStatusSchema,
  updateServerStatusSchema,
  sendServerDetailsSchema,
} from '../../api/v1/server-requests/server-requests.validators.js'
import {
  createPartnerPaymentSchema,
  updatePartnerPaymentSchema,
  updatePartnerPaymentStatusSchema,
} from '../../api/v1/partner-payments/partner-payments.validators.js'
import {
  createVpsServerSchema,
  updateVpsServerSchema,
  updateAvailabilityStatusSchema,
} from '../../api/v1/vps-servers/vps-servers.validators.js'
import {
  createVpsUserSchema,
  updateVpsUserSchema,
} from '../../api/v1/vps-users/vps-users.validators.js'
import {
  createVpsSubscriptionsSchema,
  renewVpsSubscriptionSchema,
} from '../../api/v1/vps-subscriptions/vps-subscriptions.validators.js'
import {
  authPayloadSchema,
  createVpsSubscriptionsResultSchema,
  dashboardSummarySchema,
  errorResponseSchema,
  partnerPaymentDtoSchema,
  serverRequestDtoSchema,
  successEnvelope,
  todoDtoSchema,
  userDtoSchema,
  vpsServerDtoSchema,
  vpsSubscriptionDtoSchema,
  vpsUserDtoSchema,
} from './response-schemas.js'
import { mongoIdParams } from './path-params.js'

const bearerSecurity = [{ bearerAuth: [] }]
const error401 = {
  description: 'Unauthorized',
  content: { 'application/json': { schema: errorResponseSchema } },
}
const error404 = {
  description: 'Not found',
  content: { 'application/json': { schema: errorResponseSchema } },
}
const error422 = {
  description: 'Validation error',
  content: { 'application/json': { schema: errorResponseSchema } },
}

export function registerOpenApiPaths(registry) {
  registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT access token from POST /api/v1/auth/login',
  })

  registry.registerPath({
    method: 'get',
    path: '/api/v1/health',
    tags: ['System'],
    summary: 'Health check',
    responses: {
      200: {
        description: 'API is running',
        content: {
          'application/json': {
            schema: successEnvelope(
              z.object({ status: z.literal('ok'), env: z.string() })
            ),
          },
        },
      },
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/auth/login',
    tags: ['Auth'],
    summary: 'Login with email and password',
    request: {
      body: { content: { 'application/json': { schema: loginSchema } } },
    },
    responses: {
      200: {
        description: 'JWT access token and user profile',
        content: {
          'application/json': { schema: successEnvelope(authPayloadSchema) },
        },
      },
      401: error401,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/v1/auth/me',
    tags: ['Auth'],
    summary: 'Get current authenticated user',
    security: bearerSecurity,
    responses: {
      200: {
        description: 'Current user',
        content: {
          'application/json': { schema: successEnvelope(userDtoSchema) },
        },
      },
      401: error401,
    },
  })

  for (const [method, path, summary, bodySchema, tag] of [
    ['get', '/api/v1/users', 'List users', null, 'Users'],
    ['post', '/api/v1/users', 'Create user', createUserSchema, 'Users'],
    ['get', '/api/v1/users/{id}', 'Get user by id', null, 'Users'],
    ['put', '/api/v1/users/{id}', 'Update user', updateUserSchema, 'Users'],
    ['delete', '/api/v1/users/{id}', 'Delete user', null, 'Users'],
  ]) {
    registry.registerPath({
      method,
      path,
      tags: [tag],
      summary,
      security: bearerSecurity,
      ...(bodySchema
        ? { request: { body: { content: { 'application/json': { schema: bodySchema } } } } }
        : {}),
      ...(path.includes('{id}')
        ? { request: { ...(bodySchema ? { body: { content: { 'application/json': { schema: bodySchema } } } } : {}), params: mongoIdParams } }
        : {}),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: successEnvelope(
                method === 'delete'
                  ? z.object({ id: z.string() })
                  : method === 'get' && !path.includes('{id}')
                    ? z.array(userDtoSchema)
                    : userDtoSchema
              ),
            },
          },
        },
        401: error401,
        404: error404,
        422: error422,
      },
    })
  }

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/users/{id}/status',
    tags: ['Users'],
    summary: 'Activate or deactivate user',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: { 'application/json': { schema: updateUserStatusSchema } },
      },
    },
    responses: {
      200: {
        description: 'Updated user',
        content: {
          'application/json': { schema: successEnvelope(userDtoSchema) },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/server-requests',
    tags: ['Server Requests'],
    summary: 'Submit server purchase request (public)',
    request: {
      body: {
        content: { 'application/json': { schema: createServerRequestSchema } },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: successEnvelope(serverRequestDtoSchema),
          },
        },
      },
      422: error422,
    },
  })

  for (const [method, path, summary, bodySchema] of [
    ['get', '/api/v1/server-requests', 'List server requests', null],
    ['get', '/api/v1/server-requests/{id}', 'Get server request', null],
    ['put', '/api/v1/server-requests/{id}', 'Update server request', updateServerRequestSchema],
    ['delete', '/api/v1/server-requests/{id}', 'Delete server request', null],
  ]) {
    registry.registerPath({
      method,
      path,
      tags: ['Server Requests'],
      summary,
      security: bearerSecurity,
      ...(path.includes('{id}')
        ? {
            request: {
              params: mongoIdParams,
              ...(bodySchema
                ? { body: { content: { 'application/json': { schema: bodySchema } } } }
                : {}),
            },
          }
        : {}),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: successEnvelope(
                method === 'get' && !path.includes('{id}')
                  ? z.array(serverRequestDtoSchema)
                  : method === 'delete'
                    ? z.object({ id: z.string() })
                    : serverRequestDtoSchema
              ),
            },
          },
        },
        401: error401,
        404: error404,
        422: error422,
      },
    })
  }

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/server-requests/{id}/payment-status',
    tags: ['Server Requests'],
    summary: 'Update payment status',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: { 'application/json': { schema: updatePaymentStatusSchema } },
      },
    },
    responses: {
      200: {
        description: 'Updated',
        content: {
          'application/json': {
            schema: successEnvelope(serverRequestDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/server-requests/{id}/server-status',
    tags: ['Server Requests'],
    summary: 'Update server delivery status',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: { 'application/json': { schema: updateServerStatusSchema } },
      },
    },
    responses: {
      200: {
        description: 'Updated',
        content: {
          'application/json': {
            schema: successEnvelope(serverRequestDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/server-requests/{id}/send-server-details',
    tags: ['Server Requests'],
    summary: 'Email server access details to customer',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: { 'application/json': { schema: sendServerDetailsSchema } },
      },
    },
    responses: {
      200: {
        description: 'Email sent and status updated to shared',
        content: {
          'application/json': {
            schema: successEnvelope(serverRequestDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/partner-payments',
    tags: ['Partner Payments'],
    summary: 'Submit partner payout request (public, multipart)',
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: createPartnerPaymentSchema.extend({
              screenshot: z
                .any()
                .optional()
                .openapi({ type: 'string', format: 'binary' }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Created',
        content: {
          'application/json': {
            schema: successEnvelope(partnerPaymentDtoSchema),
          },
        },
      },
      422: error422,
    },
  })

  for (const [method, path, summary, bodySchema] of [
    ['get', '/api/v1/partner-payments', 'List partner payments', null],
    ['get', '/api/v1/partner-payments/{id}', 'Get partner payment', null],
    ['put', '/api/v1/partner-payments/{id}', 'Update partner payment', updatePartnerPaymentSchema],
    ['delete', '/api/v1/partner-payments/{id}', 'Delete partner payment', null],
  ]) {
    registry.registerPath({
      method,
      path,
      tags: ['Partner Payments'],
      summary,
      security: bearerSecurity,
      ...(path.includes('{id}')
        ? {
            request: {
              params: mongoIdParams,
              ...(bodySchema
                ? { body: { content: { 'application/json': { schema: bodySchema } } } }
                : {}),
            },
          }
        : {}),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: successEnvelope(
                method === 'get' && !path.includes('{id}')
                  ? z.array(partnerPaymentDtoSchema)
                  : method === 'delete'
                    ? z.object({ id: z.string() })
                    : partnerPaymentDtoSchema
              ),
            },
          },
        },
        401: error401,
        404: error404,
        422: error422,
      },
    })
  }

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/partner-payments/{id}/status',
    tags: ['Partner Payments'],
    summary: 'Update partner payment status',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: {
          'application/json': { schema: updatePartnerPaymentStatusSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Updated',
        content: {
          'application/json': {
            schema: successEnvelope(partnerPaymentDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/v1/dashboard/summary',
    tags: ['Dashboard'],
    summary: 'Dashboard summary statistics',
    security: bearerSecurity,
    responses: {
      200: {
        description: 'Summary',
        content: {
          'application/json': {
            schema: successEnvelope(dashboardSummarySchema),
          },
        },
      },
      401: error401,
    },
  })

  for (const [method, path, summary, bodySchema] of [
    ['get', '/api/v1/vps-servers', 'List VPS servers', null],
    ['post', '/api/v1/vps-servers', 'Create VPS server', createVpsServerSchema],
    ['get', '/api/v1/vps-servers/{id}', 'Get VPS server', null],
    ['put', '/api/v1/vps-servers/{id}', 'Update VPS server', updateVpsServerSchema],
    ['delete', '/api/v1/vps-servers/{id}', 'Delete VPS server', null],
  ]) {
    registry.registerPath({
      method,
      path,
      tags: ['VPS Servers'],
      summary,
      security: bearerSecurity,
      ...(path.includes('{id}')
        ? {
            request: {
              params: mongoIdParams,
              ...(bodySchema
                ? { body: { content: { 'application/json': { schema: bodySchema } } } }
                : {}),
            },
          }
        : bodySchema
          ? { request: { body: { content: { 'application/json': { schema: bodySchema } } } } }
          : {}),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: successEnvelope(
                method === 'get' && !path.includes('{id}')
                  ? z.array(vpsServerDtoSchema)
                  : method === 'delete'
                    ? z.object({ id: z.string() })
                    : vpsServerDtoSchema
              ),
            },
          },
        },
        ...(method === 'post'
          ? {
              201: {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: successEnvelope(vpsServerDtoSchema),
                  },
                },
              },
            }
          : {}),
        401: error401,
        404: error404,
        422: error422,
      },
    })
  }

  registry.registerPath({
    method: 'patch',
    path: '/api/v1/vps-servers/{id}/availability-status',
    tags: ['VPS Servers'],
    summary: 'Update VPS server availability status',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: { 'application/json': { schema: updateAvailabilityStatusSchema } },
      },
    },
    responses: {
      200: {
        description: 'Updated',
        content: {
          'application/json': {
            schema: successEnvelope(vpsServerDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/vps-servers/{id}/ping',
    tags: ['VPS Servers'],
    summary: 'Ping VPS server and update status',
    security: bearerSecurity,
    request: { params: mongoIdParams },
    responses: {
      200: {
        description: 'Ping completed',
        content: {
          'application/json': {
            schema: successEnvelope(vpsServerDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
    },
  })

  for (const [method, path, summary, bodySchema] of [
    ['get', '/api/v1/vps-users', 'List VPS users', null],
    ['post', '/api/v1/vps-users', 'Create VPS user', createVpsUserSchema],
    ['get', '/api/v1/vps-users/{id}', 'Get VPS user', null],
    ['put', '/api/v1/vps-users/{id}', 'Update VPS user', updateVpsUserSchema],
    ['delete', '/api/v1/vps-users/{id}', 'Delete VPS user', null],
  ]) {
    registry.registerPath({
      method,
      path,
      tags: ['VPS Users'],
      summary,
      security: bearerSecurity,
      ...(path.includes('{id}')
        ? {
            request: {
              params: mongoIdParams,
              ...(bodySchema
                ? { body: { content: { 'application/json': { schema: bodySchema } } } }
                : {}),
            },
          }
        : bodySchema
          ? { request: { body: { content: { 'application/json': { schema: bodySchema } } } } }
          : {}),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: successEnvelope(
                method === 'get' && !path.includes('{id}')
                  ? z.array(vpsUserDtoSchema)
                  : method === 'delete'
                    ? z.object({ id: z.string() })
                    : vpsUserDtoSchema
              ),
            },
          },
        },
        ...(method === 'post'
          ? {
              201: {
                description: 'Created',
                content: {
                  'application/json': {
                    schema: successEnvelope(vpsUserDtoSchema),
                  },
                },
              },
            }
          : {}),
        401: error401,
        404: error404,
        422: error422,
      },
    })
  }

  registry.registerPath({
    method: 'post',
    path: '/api/v1/vps-users/{id}/subscriptions',
    tags: ['VPS Users'],
    summary: 'Create one or more VPS subscriptions for a customer',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: {
          'application/json': { schema: createVpsSubscriptionsSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Subscriptions created',
        content: {
          'application/json': {
            schema: successEnvelope(createVpsSubscriptionsResultSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'get',
    path: '/api/v1/vps-subscriptions/{id}',
    tags: ['VPS Subscriptions'],
    summary: 'Get VPS subscription by id',
    security: bearerSecurity,
    request: { params: mongoIdParams },
    responses: {
      200: {
        description: 'Subscription',
        content: {
          'application/json': {
            schema: successEnvelope(vpsSubscriptionDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/vps-subscriptions/{id}/renew',
    tags: ['VPS Subscriptions'],
    summary: 'Renew a VPS subscription',
    security: bearerSecurity,
    request: {
      params: mongoIdParams,
      body: {
        content: {
          'application/json': { schema: renewVpsSubscriptionSchema },
        },
      },
    },
    responses: {
      200: {
        description: 'Renewed',
        content: {
          'application/json': {
            schema: successEnvelope(vpsSubscriptionDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
      422: error422,
    },
  })

  registry.registerPath({
    method: 'post',
    path: '/api/v1/vps-subscriptions/{id}/cancel',
    tags: ['VPS Subscriptions'],
    summary: 'Cancel a VPS subscription',
    security: bearerSecurity,
    request: { params: mongoIdParams },
    responses: {
      200: {
        description: 'Cancelled',
        content: {
          'application/json': {
            schema: successEnvelope(vpsSubscriptionDtoSchema),
          },
        },
      },
      401: error401,
      404: error404,
    },
  })

  for (const [method, path, summary, bodySchema] of [
    ['get', '/api/v1/todos', 'List todos', null],
    ['post', '/api/v1/todos', 'Create todo', createTodoSchema],
    ['get', '/api/v1/todos/{id}', 'Get todo', null],
    ['put', '/api/v1/todos/{id}', 'Update todo', updateTodoSchema],
    ['delete', '/api/v1/todos/{id}', 'Delete todo', null],
  ]) {
    registry.registerPath({
      method,
      path,
      tags: ['Todos'],
      summary,
      security: bearerSecurity,
      ...(path.includes('{id}')
        ? {
            request: {
              params: mongoIdParams,
              ...(bodySchema
                ? { body: { content: { 'application/json': { schema: bodySchema } } } }
                : {}),
            },
          }
        : {}),
      responses: {
        200: {
          description: 'Success',
          content: {
            'application/json': {
              schema: successEnvelope(
                method === 'get' && !path.includes('{id}')
                  ? z.array(todoDtoSchema)
                  : method === 'delete'
                    ? z.object({ id: z.string() })
                    : todoDtoSchema
              ),
            },
          },
        },
        401: error401,
        404: error404,
        422: error422,
      },
    })
  }
}
