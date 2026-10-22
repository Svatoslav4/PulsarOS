
import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service.js';
import { GpuService } from './gpu.service.js';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService,private readonly gpuService: GpuService) {}

  @Get('overview')
  getOverview() {
    return this.systemService.getOverview();
  }

  @Get('cpu')
  getCpu() {
    return this.systemService.getCpu();
  }

  @Get('memory')
  getMemory() {
    return this.systemService.getMemory();
  }

  @Get('disks')
  getDisks() {
    return this.systemService.getDisks();
  }

  @Get('processes')
  getProcesses() {
    return this.systemService.getProcesses();
  }

  @Get('network')
  getNetwork() {
    return this.systemService.getNetwork();
  }

  @Get('gpu')
  getGpu() {
    return this.gpuService.getGpu()
  }
}
