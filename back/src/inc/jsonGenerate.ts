import { Express } from 'express';
import * as path from 'path';

export function generateOpenApiDocs(app: Express) {
    app.get('/docs', (req, res) => {
        console.log('MAIN ROUTE FIRED')
        // Get all registered routes
        const routes = extractRoutes(app);
        
        // Basic OpenAPI structure
        const openApiSpec = {
            openapi: '3.0.0',
            info: {
                title: 'Skillama API',
                version: '1.0.0',
                description: 'API documentation for Skillama server'
            },
            servers: [
                {
                    url: `${req.protocol}://${req.get('host')}`,
                    description: 'Current server'
                }
            ],
            paths: generatePaths(routes)
        };

        // Generate HTML
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Skillama API Documentation</title>
                <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
            </head>
            <body>
                <div id="swagger-ui"></div>
                <script>
                    window.onload = () => {
                        SwaggerUIBundle({
                            spec: ${JSON.stringify(openApiSpec)},
                            dom_id: '#swagger-ui',
                            deepLinking: true,
                            presets: [
                                SwaggerUIBundle.presets.apis,
                                SwaggerUIBundle.SwaggerUIStandalonePreset
                            ]
                        });
                    }
                </script>
            </body>
            </html>
        `;

        res.send(html);
    });
}

interface Route {
    path: string;
    method: string;
    stack: any[];
}

function extractRoutes(app: Express): Route[] {
    const routes: Route[] = [];
    
    // Get the router stack
    const stack = (app as any)._router.stack;

    stack.forEach((layer: any) => {
        if (layer.route) {
            // Routes registered directly on the app
            const path = layer.route.path;
            const methods = Object.keys(layer.route.methods);
            routes.push({
                path,
                method: methods[0],
                stack: layer.route.stack
            });
        } else if (layer.name === 'router') {
            // Routes registered via Router
            layer.handle.stack.forEach((stackItem: any) => {
                if (stackItem.route) {
                    const path = stackItem.route.path;
                    const methods = Object.keys(stackItem.route.methods);
                    routes.push({
                        path,
                        method: methods[0],
                        stack: stackItem.route.stack
                    });
                }
            });
        }
    });

    return routes;
}

function generatePaths(routes: Route[]) {
    const paths: any = {};

    routes.forEach(route => {
        if (!paths[route.path]) {
            paths[route.path] = {};
        }

        paths[route.path][route.method.toLowerCase()] = {
            summary: `${route.method.toUpperCase()} ${route.path}`,
            responses: {
                '200': {
                    description: 'Successful response',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object'
                            }
                        }
                    }
                }
            }
        };

        // Try to extract parameters from path
        const pathParams = route.path.match(/:[^/]+/g);
        if (pathParams) {
            paths[route.path][route.method.toLowerCase()].parameters = pathParams.map(param => ({
                name: param.substring(1),
                in: 'path',
                required: true,
                schema: {
                    type: 'string'
                }
            }));
        }

        // Check if route handlers expect request body
        const hasRequestBody = route.stack.some(layer => 
            layer.name === 'jsonParser' || 
            layer.name === 'urlencodedParser'
        );

        if (hasRequestBody) {
            paths[route.path][route.method.toLowerCase()].requestBody = {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object'
                        }
                    }
                }
            };
        }
    });

    return paths;
}