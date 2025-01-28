import { RWSCommand } from "@rws-framework/server";
import { ParsedOptions } from "@rws-framework/server/exec/src/application/cli.module";
import { RWSBaseCommand } from "@rws-framework/server/src/commands/_command";
import { RWSOpenApiService } from '@rws-framework/openapi';

@RWSCommand({ name: 'openapi', description: 'lol' })
export class OpenAPICommand extends RWSBaseCommand {
    constructor(        
      protected readonly openApiService: RWSOpenApiService  
    ) {
      super();
    }

    async run(passedParams: string[], options: ParsedOptions): Promise<void> {
        console.log(this.openApiService.generateOpenAPI());
        return;
    }
}