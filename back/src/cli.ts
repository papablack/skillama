import 'reflect-metadata';

import { RWSCliBootstrap } from "@rws-framework/server";
import { config, IAppModuleOpts } from './config/config'

import { RWSConfigInjector } from "@rws-framework/server/nest";

@RWSConfigInjector(config())
class AppCliBootstrap  extends RWSCliBootstrap {}

if (require.main === module) {    
    AppCliBootstrap
      .run<IAppModuleOpts>(config, {
        providers: [        
        ]
      }).catch((error) => {
          console.error('Failed to run CLI:', error);
          process.exit(1);
      });
}