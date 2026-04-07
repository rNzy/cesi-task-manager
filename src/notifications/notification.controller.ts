import { Body, Controller, Post, Query } from '@nestjs/common';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';
import { NotificationService, NotifyAllReport } from './notification.service';

class NotifyDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  userIds!: string[];
}

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /notifications/send?strategy=sequential|parallel|resilient
   * Body: { "userIds": ["user-1", "user-2", "user-fail", "user-4"] }
   */
  @Post('send')
  async send(
    @Body() dto: NotifyDto,
    @Query('strategy') strategy: string = 'resilient',
  ): Promise<NotifyAllReport> {
    switch (strategy) {
      case 'sequential':
        return this.notificationService.notifyAllSequential(dto.userIds);
      case 'parallel':
        return this.notificationService.notifyAllParallel(dto.userIds);
      case 'resilient':
      default:
        return this.notificationService.notifyAllResilient(dto.userIds);
    }
  }

  /**
   * POST /notifications/compare
   * Body: { "userIds": ["user-1", "user-2", "user-fail", "user-4", "user-5"] }
   *
   * Exécute les 3 stratégies et retourne un comparatif.
   */
  @Post('compare')
  async compare(@Body() dto: NotifyDto): Promise<{
    sequential: NotifyAllReport;
    parallel: NotifyAllReport;
    resilient: NotifyAllReport;
  }> {
    const sequential = await this.notificationService.notifyAllSequential(
      dto.userIds,
    );
    const parallel = await this.notificationService.notifyAllParallel(
      dto.userIds,
    );
    const resilient = await this.notificationService.notifyAllResilient(
      dto.userIds,
    );

    return { sequential, parallel, resilient };
  }
}
