import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule }      from './prisma/prisma.module';
import { AuthModule }        from './auth/auth.module';
import { ProductsModule }    from './products/products.module';
import { CartModule }        from './cart/cart.module';
import { OrdersModule }      from './orders/orders.module';
import { PaymentsModule }    from './payments/payments.module';
import { LoyaltyModule }     from './loyalty/loyalty.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { UsersModule }       from './users/users.module';
import { AnalyticsModule }   from './analytics/analytics.module';
import { UploadModule }      from './upload/upload.module';
import { CategoriesModule }  from './categories/categories.module';
import { JwtAuthGuard, RolesGuard } from './auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    LoyaltyModule,
    MarketplaceModule,
    UsersModule,
    AnalyticsModule,
    UploadModule,
    CategoriesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
