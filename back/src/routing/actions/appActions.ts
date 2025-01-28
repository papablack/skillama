import { IOpenApiRouteParams } from "@rws-framework/openapi";
import { IHTTProute } from "@rws-framework/server/src/routing/routes";



export const appRoutes: IHTTProute<IOpenApiRouteParams>[] = [   
    {
        name: 'healthcheck',
        path: '/healthcheck',
        method: 'POST',               
    },
    {
        name: 'generate_code',
        path: '/code/generate',
        method: 'POST',
        plugins: {
            openapi: {
                payload: { 
                    prompt: {
                        type: 'string'
                    }, 
                    filename: {
                        type: 'string'
                    }, 
                    projectName: {
                        type: 'string'
                    }
                },
                responses: {
                    200: {
                        returnParams: {
                            message: {
                                type: 'string'
                            },
                            filePath: {
                                type: 'string'
                            },
                            code: {
                                type: 'string'
                            }
                        }                        
                    },
                    400: {
                        returnParams: {
                            statusCode: {
                                type: 'number'
                            },
                            message: {
                                type: 'string'
                            }                            
                        }       
                    }
                }
            }
        }                
    },
    {
        name: 'openapi',
        path: '/openapi',
        method: 'GET'                
    }
]         
