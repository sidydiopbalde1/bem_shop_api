import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [LoyaltyModule, MailModule],
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
