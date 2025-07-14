import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Darknet Duel API',
      version: '1.0.0',
      description: 'Authentication and persistence API for Darknet Duel - A cybersecurity-themed multiplayer card game',
      contact: {
        name: 'Darknet Duel Team',
        email: 'support@darknetduel.game'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.PUBLIC_URL || 'http://localhost:8000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for user authentication'
        },
        serverApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-server-api-key',
          description: 'Server-to-server API key for game server communication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique user identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              description: 'Unique username'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the account is active'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Last login timestamp'
            },
            gamesPlayed: {
              type: 'integer',
              description: 'Total number of games played'
            },
            gamesWon: {
              type: 'integer',
              description: 'Total number of games won'
            },
            gamesLost: {
              type: 'integer',
              description: 'Total number of games lost'
            },
            rating: {
              type: 'integer',
              description: 'Current ELO rating'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'username', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 20,
              description: 'Unique username'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Response message'
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            token: {
              type: 'string',
              description: 'JWT authentication token'
            }
          }
        },
        RecentActivityItem: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['WIN', 'LOSS'],
              description: 'Game outcome type'
            },
            opponent: {
              type: 'string',
              description: 'Opponent username'
            },
            time: {
              type: 'string',
              description: 'Human-readable time ago (e.g., "2h ago")'
            },
            pointsChange: {
              type: 'string',
              description: 'Rating points change (e.g., "+125 PTS")'
            },
            gameId: {
              type: 'string',
              description: 'Game identifier'
            },
            gameMode: {
              type: 'string',
              description: 'Game mode (e.g., "standard")'
            }
          }
        },
        ProfileStats: {
          type: 'object',
          properties: {
            wins: {
              type: 'integer',
              description: 'Total wins'
            },
            losses: {
              type: 'integer',
              description: 'Total losses'
            },
            totalGames: {
              type: 'integer',
              description: 'Total games played'
            },
            winRate: {
              type: 'string',
              description: 'Win rate percentage (e.g., "75.5%")'
            },
            rating: {
              type: 'integer',
              description: 'Current ELO rating'
            },
            level: {
              type: 'integer',
              description: 'Player level'
            }
          }
        },
        ProfileInfo: {
          type: 'object',
          properties: {
            recentActivity: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/RecentActivityItem'
              }
            },
            profileStats: {
              $ref: '#/components/schemas/ProfileStats'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            error: {
              type: 'string',
              description: 'Additional error details (development mode only)'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and account management'
      },
      {
        name: 'Profile & Info',
        description: 'User profile information and activity data'
      },
      {
        name: 'Server',
        description: 'Server-to-server communication endpoints'
      },
      {
        name: 'Health',
        description: 'System health and monitoring'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const specs = swaggerJSDoc(options);
export const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #00d9ff; }
    .swagger-ui .scheme-container { background: #1a1a1a; }
  `,
  customSiteTitle: 'Darknet Duel API Documentation'
};

export { swaggerUi }; 