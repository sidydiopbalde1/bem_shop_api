import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderMailData {
  orderId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryType: string;
  address?: string;
  createdAt: Date;
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  async sendOrderConfirmationToClient(data: OrderMailData): Promise<void> {
    try {
      await this.mailer.sendMail({
        to: data.clientEmail,
        subject: `Confirmation de votre commande #${data.orderId.slice(0, 8).toUpperCase()}`,
        template: 'order-confirmation',
        context: {
          ...data,
          orderId: data.orderId.slice(0, 8).toUpperCase(),
          totalAmountFormatted: data.totalAmount.toLocaleString('fr-FR'),
          deliveryLabel: data.deliveryType === 'CAMPUS' ? 'Livraison sur campus' : 'Livraison à domicile',
          frontendUrl: this.config.get<string>('FRONTEND_URL', 'http://localhost:3001'),
        },
      });
      this.logger.log(`Email de confirmation envoyé à ${data.clientEmail} pour la commande ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Échec envoi email confirmation client: ${error.message}`);
    }
  }

  async sendOrderNotificationToAdmin(data: OrderMailData): Promise<void> {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL non configuré, notification admin ignorée');
      return;
    }

    try {
      await this.mailer.sendMail({
        to: adminEmail,
        subject: `Nouvelle commande #${data.orderId.slice(0, 8).toUpperCase()} reçue`,
        template: 'order-notification-admin',
        context: {
          ...data,
          orderId: data.orderId.slice(0, 8).toUpperCase(),
          totalAmountFormatted: data.totalAmount.toLocaleString('fr-FR'),
          deliveryLabel: data.deliveryType === 'CAMPUS' ? 'Livraison sur campus' : 'Livraison à domicile',
          frontendUrl: this.config.get<string>('FRONTEND_URL', 'http://localhost:3001'),
        },
      });
      this.logger.log(`Notification admin envoyée à ${adminEmail} pour la commande ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Échec envoi notification admin: ${error.message}`);
    }
  }

  async sendOrderStatusUpdateToClient(
    clientEmail: string,
    clientFirstName: string,
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<void> {
    try {
      const statusLabel = ORDER_STATUS_LABELS[newStatus] ?? newStatus;
      await this.mailer.sendMail({
        to: clientEmail,
        subject: `Mise à jour de votre commande #${orderId.slice(0, 8).toUpperCase()} — ${statusLabel}`,
        template: 'order-status-update',
        context: {
          clientFirstName,
          orderId: orderId.slice(0, 8).toUpperCase(),
          fullOrderId: orderId,
          statusLabel,
          status: newStatus,
          isCancelled: newStatus === 'CANCELLED',
          isDelivered: newStatus === 'DELIVERED',
          updatedAt: new Date(),
          frontendUrl: this.config.get<string>('FRONTEND_URL', 'http://localhost:3001'),
        },
      });
      this.logger.log(`Email statut "${newStatus}" envoyé à ${clientEmail} pour la commande ${orderId}`);
    } catch (error) {
      this.logger.error(`Échec envoi email mise à jour statut: ${error.message}`);
    }
  }

  async sendOrderStatusUpdateToAdmin(
    orderId: string,
    clientFirstName: string,
    clientLastName: string,
    clientEmail: string,
    newStatus: OrderStatus,
  ): Promise<void> {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    if (!adminEmail) return;

    try {
      const statusLabel = ORDER_STATUS_LABELS[newStatus] ?? newStatus;
      await this.mailer.sendMail({
        to: adminEmail,
        subject: `Commande #${orderId.slice(0, 8).toUpperCase()} — nouveau statut : ${statusLabel}`,
        template: 'order-status-update-admin',
        context: {
          orderId: orderId.slice(0, 8).toUpperCase(),
          fullOrderId: orderId,
          clientFirstName,
          clientLastName,
          clientEmail,
          statusLabel,
          status: newStatus,
          updatedAt: new Date(),
          frontendUrl: this.config.get<string>('FRONTEND_URL', 'http://localhost:3001'),
        },
      });
      this.logger.log(`Notification admin statut "${newStatus}" pour la commande ${orderId}`);
    } catch (error) {
      this.logger.error(`Échec envoi notification admin statut: ${error.message}`);
    }
  }
}
