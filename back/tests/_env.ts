import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

export const loadEnv = (): void => {
    // Load base .env file
    const baseEnvPath = path.resolve(process.cwd(), '..', '.env');
    const localEnvPath = path.resolve(process.cwd(), '..','.env.local');

    // First load the base .env file
    const baseResult = dotenv.config({ path: baseEnvPath });
    
    if (baseResult.error) {
        throw new Error(`Error loading .env file: ${baseResult.error.message}. Run from /back dir.`);
    }

    // Then check if .env.local exists and load it to override
    if (fs.existsSync(localEnvPath)) {
        const localResult = dotenv.config({ path: localEnvPath, override: true });
        
        if (localResult.error) {
            throw new Error(`Error loading .env.local file: ${localResult.error.message}`);
        }
    }
};
