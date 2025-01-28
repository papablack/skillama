import { Body, HttpStatus, HttpException } from '@nestjs/common';
import { Controller, RWSRoute } from '@rws-framework/server/nest';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promptAI } from '../inc/ai';
import { RWSOpenApiService, OpenAPISpec } from '@rws-framework/openapi';
import { AppGenerateCodeResponse } from './types/app.types';
import { RWSConfigService } from '@rws-framework/server';
import { IAppModuleOpts } from '../config/config';

const outputDir: string = path.resolve(process.cwd(), 'generated');

//@ApiTags('app')
@Controller('app')
export class AppController {
  constructor(private openApiService: RWSOpenApiService, private configService: RWSConfigService<IAppModuleOpts>){}

  // @ApiOperation({ summary: 'Checks server status' })
  // @ApiResponse({ status: 'OK', message: 'Server is running' })
  @RWSRoute('healthcheck')
  async healthCheck() {
    return { status: 'OK', message: 'Server is running' };
  }

  @RWSRoute('generate_code')
  async generateCode(
    @Body() body: { prompt: string; filename: string; projectName: string }
  ): Promise<AppGenerateCodeResponse> {
    const { prompt, filename, projectName } = body;

    if (!prompt || !filename || !projectName) {
      throw new HttpException(
        'Prompt, filename, and projectName are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const projectDir = path.join(outputDir, projectName);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    console.log('Processing code request...');
    const generatedCode = await promptAI(prompt);

    const filePath = path.join(projectDir, filename);
    const fileDir = path.dirname(filePath);
    
    if (!fs.existsSync(fileDir)) {
      fs.mkdirSync(fileDir, { recursive: true });
    }

    fs.writeFileSync(filePath, generatedCode);
    console.log(`Code generated and saved @ "${filePath}"`);

    return {
      message: 'Code generated and saved successfully',
      filePath,
      code: generatedCode,
    };
  }

  @RWSRoute('openapi')
  async openAPI(): Promise<OpenAPISpec> 
  {
    return this.openApiService.generateOpenAPI({
      'server': `https://${this.configService.get('tunneler_name')}.loca.lt`
    });
  }
}