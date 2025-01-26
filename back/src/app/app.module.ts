import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { TraverseController } from '../controllers/traverse.controller';

import { NestModuleData } from '@rws-framework/server/exec/src/application/cli.module';


@Module({})
export class TheAppModule {
  static forRoot(parentModule: NestModuleData){
    const processedImports = parentModule ? [parentModule] : [];

    return {
      module: TheAppModule,
      imports: processedImports,
      controllers:[
        AppController
      ]
    }
  }
}
