const chalk = require('chalk');
const { exec } = require('child_process');

const exampleCommands = [
    { cmd: 'install:bower'},
    { cmd: 'build:sass'},
    { cmd: 'build:rws'}
];

function executeProjectInstallScripts(executeScripts, options = {}){
    let packager = 'npm';
    let nodeExecutor = options?.nodeExecutor ? nodeExecutor :'node';
    let packagerCommand = 'npm run';
    let packagerNpx = 'npx';

    if(options?.isYarn){
        packager = 'yarn';
    }

    if(options?.isBun){
        packager = 'bun';
    }   
    // Set the command to run based on the environment variable

    switch(packager){
        case 'yarn': packagerCommand = 'yarn'; packagerNpx = packagerCommand; break;
        case 'bun': packagerCommand = 'bun run'; packagerNpx = packagerCommand; nodeExecutor = 'bun'; break;
        default: break;
    }

    // Execute the scripts in sequence
    executeScripts.forEach(scriptData => {
        script = scriptData.cmd;

        let execCommand = `${packagerCommand}`

        if(scriptData?.node){
            execCommand = `${nodeExecutor}`
        }

        if(scriptData?.npx){
            execCommand = `${packagerNpx}`
        }    

        const finalCmd = `${execCommand} ${script}`;

        console.log(chalk.green('Executing'), chalk.red(finalCmd))

        exec(finalCmd, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing ${finalCmd}:`, err);                
            }

            console.log(chalk.blue(`Output for ${script}: `), `${stdout}\n${stderr}`);
        });
    });
}

module.exports = {
    executeProjectInstallScripts
}