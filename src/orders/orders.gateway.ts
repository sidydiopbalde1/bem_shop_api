import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL ?? '*' }, namespace: '/orders' })
export class OrdersGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('subscribe_order')
  handleSubscribe(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order:${data.orderId}`);
    return { event: 'subscribed', orderId: data.orderId };
  }

  emitStatusUpdate(orderId: string, status: string) {
    this.server.to(`order:${orderId}`).emit('order_status_updated', { orderId, status });
  }
}
