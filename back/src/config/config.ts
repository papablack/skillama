import IAppConfig from "@rws-framework/server/src/types/IAppConfig";
import { ConfigHelper } from "./ConfigHelper";
import httpRoutes from '../routing/routes';
import { TheAppModule } from "../app/app.module";

export interface IAppModuleOpts extends IAppConfig { 
}

const configHelper = new ConfigHelper();

function config(): IAppModuleOpts
{
    return {       
        nest_module: TheAppModule,
        secret_key: configHelper.get('JWT_SECRET'),    
        port: parseInt(configHelper.get('PORT')) || 3000,              
        pub_dir: configHelper.get('PUBLIC_DIR'),                  
        http_routes: httpRoutes,
    };
}


export { config };