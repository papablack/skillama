const { executeProjectInstallScripts } = require('./rws_installer');

const isYarn = process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('yarn');
const isBun = process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('bun');

// Define the scripts to execute
const executeScripts = [    
    // { cmd: 'rws init -r=1', npx: true},
    { cmd: 'build'}
];

const options = {};

if(isYarn){
    options.isYarn = true;
}

if(isBun){
    options.isBun = true;
}

if(process.env.USE_PACKAGER === 'yarn'){
    options.isYarn = true;
}

if(process.env.USE_PACKAGER === 'bun'){
    options.isBun = true;
}

if(process.env.USE_EXECUTOR){
    options.nodeExecutor = process.env.USE_EXECUTOR;
}

executeProjectInstallScripts(executeScripts, options);
