import {Injectable,ServiceUnavailableException,} from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

@Injectable()
export class GpuService {
  async getGpu() {
    try {
      const { stdout } = await execFileAsync(
        'nvidia-smi',
        [
          '--query-gpu=name,utilization.gpu,utilization.memory,temperature.gpu,memory.used,memory.total,power.draw',
          '--format=csv,noheader,nounits',
        ],
        { timeout: 5000, windowsHide: true },
      );

      const lines = stdout.trim().split(/\r?\n/).filter(Boolean);

      return {
        available: true,
        gpus: lines.map((line) => {
          const [
            name,
            usage,
            memoryUsage,
            temperature,
            memoryUsed,
            memoryTotal,
            power,
          ] = line.split(',').map((value) => value.trim());

          const numberOrNull = (value?: string) => {
            if (!value || !Number.isFinite(Number(value))) {
              return null;
            }

            return Number(value);
          };

          const used = numberOrNull(memoryUsed);
          const total = numberOrNull(memoryTotal);

          return {
            name,
            usagePercent: numberOrNull(usage),
            memoryUsagePercent: numberOrNull(memoryUsage),
            temperatureCelsius: numberOrNull(temperature),
            vramUsedMiB: used,
            vramTotalMiB: total,
            vramUsagePercent:
              used !== null && total !== null && total > 0
                ? Number(((used / total) * 100).toFixed(2))
                : null,
            powerWatts: numberOrNull(power),
          };
        }),
        updatedAt: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException(
        'NVIDIA GPU metrics are unavailable. Check the NVIDIA driver and nvidia-smi.',
      );
    }
  }
}
