import localtunnel, { Tunnel } from 'localtunnel';
import { TunnelOptions } from '../types';
import { nanoid as uniqid} from 'nanoid';

export async function tunneling(port: number): Promise<Tunnel> {
    const options: TunnelOptions = { 
      port,
      subdomain: process.env.TUNNELER_NAME || `skillama-${uniqid(6)}`,
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
