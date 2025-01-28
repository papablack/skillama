import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import localtunnel, { Tunnel } from 'localtunnel';
import { v1 as uniqid } from 'uuid';

type TunnelOptions = { port: number, subdomain: string };

@Injectable()
export class TunnelerService implements OnModuleInit, OnModuleDestroy {
  private tunnel: Tunnel;
  private port: number;
  private tunnelerName: string;

  public constructor(private configService: ConfigService){}

  async onModuleInit() {
    this.port = this.configService.get<number>('port');
    this.tunnelerName = this.configService.get<string>('tunneler_name');
    
    // this.tunnel = await this.startTunneling(this.port, this.tunnelerName);
  }

  async onModuleDestroy() {
    if (this.tunnel) {
      this.tunnel.close();
    }
  }

  private async startTunneling(port: number, tunnelerName: string = null): Promise<Tunnel> {
    const options: TunnelOptions = { 
      port,
      subdomain: tunnelerName || `skillama-${uniqid()}`,
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
}