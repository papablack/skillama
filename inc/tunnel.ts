import localtunnel from 'localtunnel';
import { TunnelOptions, TunnelInstance } from '../types';
import {nanoid} from 'nanoid';

export async function tunneling(port: number): Promise<TunnelInstance> {
    const options: TunnelOptions = { 
      port,
      subdomain: process.env.TUNNELER_NAME || `skillama-${nanoid()}`,
    };

    const tunnel = await localtunnel(options);
    console.log(`🌍 Tunnel URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('❌ Tunnel closed');
    });

    tunnel.on('error', (err: Error) => {
      console.error('🔥 Tunnel error:', err);
    });

   return tunnel;
}
