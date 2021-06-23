import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CancelOrderDto } from './dtos/cancelOrder.dto';
import { ProcessOrderDto } from './dtos/processOrder.dto';
import { Payment } from './interfaces/payment.interface';
import { UtilsService } from './utils/utils.service';

@Controller()
export class AppController {
  constructor(
    private appService: AppService,
    @Inject('ORDER_SERVICE')
    private readonly orderServiceClient: ClientProxy,
    private readonly utilsService: UtilsService,
  ) {}

  @EventPattern('order_created')
  async handleOrderCreated(order: ProcessOrderDto) {
    console.log('New order created...', order);

    const { userId, orderId, hash } = order;

    const isValid = this.utilsService.verifySignature(
      hash,
      { userId, orderId },
      process.env.SECRET_SIG || '1234',
    );
    if (!isValid) throw new Error('Invalid signature!');

    // random result process payment
    const randomResult = this.appService.getPaymentResult();
    console.log('Random payment result...', randomResult);

    let payment: Payment;
    if (randomResult === 'success') {
      payment = await this.appService.confirmOrderPayment(order);
    } else {
      payment = await this.appService.declineOrderPayment({
        ...order,
        reason: 'high_risk',
      });
    }

    console.log('Payment info...', payment);

    if (payment) {
      const hash = this.utilsService.generateSignature(
        { orderId, paymentId: payment._id },
        process.env.SECRET_SIG || '1234',
      );

      this.orderServiceClient.emit<any>('order_updated', {
        orderId,
        paymentId: payment._id,
        paymentStatus: payment.status,
        hash,
      });
    }

    return payment;
  }

  @EventPattern('order_cancelled')
  async handleOrderCancelled(order: CancelOrderDto) {
    console.log('Order cancelled...', order);

    const { userId, orderId, refund, hash } = order;

    const isValid = this.utilsService.verifySignature(
      hash,
      { userId, orderId },
      process.env.SECRET_SIG || '1234',
    );
    if (!isValid) throw new Error('Invalid signature!');

    // refund payment
    if (refund) {
      const payment = await this.appService.refundOrderPayment({
        ...order,
        reason: 'user_cancel',
      });

      console.log('Payment info...', payment);
    }
  }
}
