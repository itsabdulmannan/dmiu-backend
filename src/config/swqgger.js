const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Journal Publication API",
            version: "1.0.0",
            contact: {
                name: "Journal Publication",
            },
        },
        servers: [
            {
                url: "http://localhost:3007",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: [path.join(__dirname, '/../routes/*.js')],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
    app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

module.exports = setupSwagger;
