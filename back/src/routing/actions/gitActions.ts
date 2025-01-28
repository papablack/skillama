import { IHTTProute } from "@rws-framework/server/src/routing/routes";

export const gitRoutes: IHTTProute[] = [   
    {
        name: 'git_sync',
        path: '/git/check',
        method: 'POST'                
    }
]         
