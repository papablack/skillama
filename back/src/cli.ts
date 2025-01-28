import 'reflect-metadata';

import { RWSCliBootstrap } from "@rws-framework/server";
import { config, IAppModuleOpts } from './config/config';
import { OpenAPICommand } from './command/openapi.command';
import { RWSConfigInjector } from "@rws-framework/server/nest";
import { RWSOpenApiModule, RWSOpenApiService } from '@rws-framework/openapi';

@RWSConfigInjector(config())
class AppCliBootstrap  extends RWSCliBootstrap {}

if (require.main === module) {    
    AppCliBootstrap
      .run<IAppModuleOpts>(config, {        
        providers: [          
          RWSOpenApiService,
          OpenAPICommand
        ]
      }).catch((error) => {
          console.error('Failed to run CLI:', error);
          process.exit(1);
      });
}