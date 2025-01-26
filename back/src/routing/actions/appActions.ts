import { IHTTProute } from "@rws-framework/server/src/routing/routes";

export const appRoutes: IHTTProute[] = [   
    {
        name: 'healthcheck',
        path: '/healthcheck',
        method: 'POST'                
    },
    {
        name: 'generate_code',
        path: '/code/generate',
        method: 'POST'                
    },
    {
        name: 'git_sync',
        path: '/git/check',
        method: 'POST'                
    }
]         
