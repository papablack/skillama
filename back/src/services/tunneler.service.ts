import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { tunneling } from '../inc/tunnel';
import { Tunnel } from 'localtunnel';

@Injectable()
export class TunnelerService implements OnModuleInit, OnModuleDestroy {
  private tunnel: Tunnel;

  async onModuleInit() {
    // Assuming your app runs on port 3000 by default
    const port = parseInt(process.env.PORT || '3000', 10);
    this.tunnel = await tunneling(port);
  }

  async onModuleDestroy() {
    if (this.tunnel) {
      await this.tunnel.close();
    }
  }
}