import { Module } from "@nestjs/common";
import { SystemController } from "../system/system.controller.js";
import { SystemService } from "../system/system.service.js";
import { GpuService } from "./gpu.service.js";
import { SystemGateway } from "./system.gateway.js";

@Module({
  controllers: [SystemController],
  providers: [SystemService,GpuService,SystemGateway]
})
export class SystemModule {}