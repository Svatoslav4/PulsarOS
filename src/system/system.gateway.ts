import {OnModuleDestroy,} from '@nestjs/common';
import {WebSocketGateway,WebSocketServer,} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SystemService } from './system.service.js';
import { GpuService } from './gpu.service.js';

@WebSocketGateway({
  namespace: '/system',
  cors: {
    origin: '*',
  },
})
export class SystemGateway implements OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private timer?: ReturnType<typeof setInterval>;
  private isCollecting = false;

  constructor(
    private readonly systemService: SystemService,
    private readonly gpuService: GpuService,
  ) {}

  afterInit() {
    this.timer = setInterval(() => {
      void this.broadcastMetrics();
    }, 2000);

    void this.broadcastMetrics();
  }

  private async broadcastMetrics() {
    if (this.isCollecting) return;

    this.isCollecting = true;

    try {
      const [overview, cpu, gpu] = await Promise.all([
        this.systemService.getOverview(),
        this.systemService.getCpu(),
        this.gpuService.getGpu().catch(() => ({
          available: false,
          gpus: [],
          updatedAt: new Date().toISOString(),
        })),
      ]);

      this.server.emit('metrics', {
        overview,
        cpu,
        gpu,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      this.server.emit('metrics:error', {
        message: 'Unable to collect system metrics',
      });
    } finally {
      this.isCollecting = false;
    }
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
