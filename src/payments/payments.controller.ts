import {
  Controller, Post, Body,
  Headers, Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiHeader, ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitPaymentDto } from './dto/payment.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Initier un paiement', description: 'Crée ou récupère une session de paiement pour la commande spécifiée.' })
  @ApiResponse({ status: 201, description: 'Session de paiement créée', schema: { example: { id: 'pay_uuid', provider: 'STRIPE', status: 'PENDING', amount: 15000 } } })
  @ApiResponse({ status: 400, description: 'Commande introuvable ou déjà payée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  initiate(@GetUser('sub') userId: string, @Body() dto: InitPaymentDto) {
    return this.paymentsService.initiate(userId, dto);
  }

  @Public()
  @Post('webhooks/stripe')
  @ApiOperation({ summary: 'Webhook Stripe', description: 'Endpoint appelé par Stripe pour notifier les événements de paiement. Ne pas appeler manuellement.' })
  @ApiHeader({ name: 'stripe-signature', required: true, description: 'Signature HMAC fournie par Stripe' })
  @ApiResponse({ status: 200, description: 'Événement traité' })
  @ApiResponse({ status: 400, description: 'Signature invalide' })
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.paymentsService.handleStripeWebhook(req.rawBody!, sig);
  }
}
