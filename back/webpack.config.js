const path = require('path');

const  RWSWebpackWrapper  = require('@rws-framework/server/rws.webpack.config');
const dotenv = require('dotenv');
const executionDir = process.cwd();


const envData = dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const localEnvData = dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const allEnvData = {
  ...envData.parsed,
  ...localEnvData.parsed
}

module.exports = RWSWebpackWrapper({
  dev: parseInt(allEnvData.DEV) === 1,  
  tsConfigPath: executionDir + '/tsconfig.json',
  entry: `${executionDir}/src/index.ts`,
  executionDir: executionDir,  
  outputDir:  path.resolve(executionDir, 'build'),
  outputFileName: 'rws.server.js'
});