const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const RWSWebpackWrapper  = require('@rws-framework/client/rws.webpack.config');
const { copyFile } = require('fs');
const executionDir = process.cwd();

dotenv.config({
  path: [path.resolve(__dirname, '..', '.env.local'), path.resolve(__dirname, '..', '.env')]
});

const devMode = process.env.DEV_MODE === 'false' ? false : true;

const devFiles = devMode ? ['./build/rws.client.js.map'] : []

module.exports = RWSWebpackWrapper({
  dev: devMode,
  hot: false,
  report: false,
  tsConfigPath: executionDir + '/tsconfig.json',
  entry: `${executionDir}/src/index.ts`,
  executionDir: executionDir,
  publicDir:  path.resolve(executionDir, 'public'),
  outputDir:  path.resolve(executionDir, 'build'),
  outputFileName: 'rws.client.js',
  parted: false,
  partedDirUrlPrefix: '/js',
  copyAssets: {
    './public/css/' : [      
      './src/styles/compiled/main.css'
    ],
    './public/js/' : [      
      './build/rws_info.json',
      './build/rws.client.js',
      ...devFiles,
    ]
  },
  rwsDefines: {
    'process.env.TUNNELER_NAME': JSON.stringify(process.env.TUNNELER_NAME),
    'process.env.OPENAPI_TEMPLATE': JSON.stringify(fs.readFileSync( path.resolve(__dirname, '..', 'back', 'docs', 'openapi.json'), 'utf-8')),
  }
});