import { Module } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { GitController } from '../controllers/git.controller';
import { TraverseController } from '../controllers/traverse.controller';
import { TunnelerService } from '../services/tunneler.service';
import { NestModuleData } from '@rws-framework/server/exec/src/application/cli.module';
import { RWSOpenApiModule } from '@rws-framework/openapi';


@Module({})
export class TheAppModule {
  static forRoot(parentModule: NestModuleData){
    const processedImports = parentModule ? [parentModule] : [];

    return {      
      module: TheAppModule,
      imports: [...processedImports, RWSOpenApiModule],
      controllers:[
        AppController,
        GitController,
        TraverseController
      ],
      providers: [
        TunnelerService
      ]
    }
  }
}
