const path = require('path');

const RWSWebpackWrapper = require('@rws-framework/server/cli.rws.webpack.config');

const executionDir = process.cwd();

module.exports = RWSWebpackWrapper({
  dev: parseInt(process.env.DEV) === 1,  
  tsConfigPath: executionDir + '/tsconfig.json',
  entry: `${executionDir}/src/cli.ts`,
  executionDir: executionDir,  
  outputDir:  path.resolve(executionDir, 'build'),
  outputFileName: 'rws.cli.js'
});