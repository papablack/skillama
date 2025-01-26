import { IHTTProute } from "@rws-framework/server/src/routing/routes";

export const traverseRoutes: IHTTProute[] = [   
    {
        name: 'list_files',
        path: '/list',
        method: 'POST'                
    },
    {
        name: 'show_file',
        path: '/show',
        method: 'POST'                
    }
]         
