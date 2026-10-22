
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import * as si from 'systeminformation';

@Injectable()
export class SystemService {
  async getOverview() {
    try {
      const [cpu, load, memory, os, uptime] = await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.mem(),
        si.osInfo(),
        si.time(),
      ]);

      return {
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed,
          usage: Number(load.currentLoad.toFixed(2)),
        },
        memory: {
          total: memory.total,
          used: memory.active,
          free: memory.available,
          usage: Number(
            ((memory.active / memory.total) * 100).toFixed(2),
          ),
        },
        os: {
          platform: os.platform,
          distro: os.distro,
          release: os.release,
          arch: os.arch,
        },
        system: {
          uptime: uptime.uptime,
        },
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'Unable to retrieve system information',
      );
    }
  }

  async getCpu() {
    const [cpu, load] = await Promise.all([
      si.cpu(),
      si.currentLoad(),
    ]);

    return {
      manufacturer: cpu.manufacturer,
      brand: cpu.brand,
      cores: cpu.cores,
      physicalCores: cpu.physicalCores,
      speed: cpu.speed,
      usage: Number(load.currentLoad.toFixed(2)),
      perCore: load.cpus.map((core, index) => ({
        core: index + 1,
        usage: Number(core.load.toFixed(2)),
      })),
    };
  }

  async getMemory() {
    const memory = await si.mem();

    return {
      total: memory.total,
      used: memory.active,
      free: memory.available,
      usage: Number(
        ((memory.active / memory.total) * 100).toFixed(2),
      ),
    };
  }

  async getDisks() {
    const disks = await si.fsSize();

    return disks.map((disk) => ({
      filesystem: disk.fs,
      mount: disk.mount,
      type: disk.type,
      size: disk.size,
      used: disk.used,
      available: disk.size - disk.used,
      usage: disk.use,
    }));
  }

  async getProcesses() {
    const result = await si.processes();

    return {
      total: result.all,
      running: result.running,
      blocked: result.blocked,
      list: result.list
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 30)
        .map((process) => ({
          pid: process.pid,
          name: process.name,
          cpu: process.cpu,
          memory: process.mem,
          state: process.state,
        })),
    };
  }

  async getNetwork() {
    const [interfaces, stats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
    ]);

    return {
      interfaces,
      stats: stats.map((item) => ({
        interface: item.iface,
        rxBytes: item.rx_bytes,
        txBytes: item.tx_bytes,
        rxSec: item.rx_sec,
        txSec: item.tx_sec,
      })),
    };
  }
}
