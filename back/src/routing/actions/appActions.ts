import { IHTTProute } from "@rws-framework/server/src/routing/routes";

export const appRoutes: IHTTProute[] = [   
    {
        name: 'generate_code',
        path: '/generate_code',
        method: 'POST'                
    },
    {
        name: 'git_sync',
        path: '/check',
        method: 'POST'                
    }
]         
