import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Db, ObjectID } from 'mongodb';
import { CancelOrderDto } from './dtos/cancelOrder.dto';
import { ProcessOrderDto } from './dtos/processOrder.dto';
import { Payment } from './interfaces/payment.interface';

@Injectable()
export class AppService {
  constructor(
    @Inject('ORDER_SERVICE')
    private orderServiceClient: ClientProxy,
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {}

  getPaymentResult() {
    const result = ['success', 'fail'];
    const randomResult = result[Math.floor(Math.random() * result.length)];
    return randomResult as 'success' | 'fail';
  }

  async confirmOrderPayment(body: ProcessOrderDto): Promise<Payment> {
    const { userId, orderId, amount } = body;

    const paymentId = (
      await this.db.collection<Partial<Payment>>('payments').insertOne({
        userId: new ObjectID(userId),
        orderId: new ObjectID(orderId),
        amount,
        status: 'confirmed',
        createAt: new Date(),
      })
    ).insertedId;

    return await this.db
      .collection('payments')
      .findOne({ _id: new ObjectID(paymentId) });
  }

  async declineOrderPayment(body: ProcessOrderDto): Promise<Payment> {
    const { userId, orderId, amount, reason } = body;

    const paymentId = (
      await this.db.collection<Partial<Payment>>('payments').insertOne({
        userId: new ObjectID(userId),
        orderId: new ObjectID(orderId),
        amount,
        status: 'declined',
        createAt: new Date(),
        reason,
      })
    ).insertedId;

    return await this.db
      .collection('payments')
      .findOne({ _id: new ObjectID(paymentId) });
  }

  async refundOrderPayment(body: CancelOrderDto): Promise<Payment> {
    const { userId, orderId, reason } = body;

    await this.db.collection<Payment>('payments').updateOne(
      {
        userId: new ObjectID(userId),
        orderId: new ObjectID(orderId),
      },
      { $set: { status: 'refunded', reason } },
    );

    return await this.db.collection('payments').findOne({
      userId: new ObjectID(userId),
      orderId: new ObjectID(orderId),
    });
  }

  async getOrder(orderId: any) {
    const res = await this.orderServiceClient
      .send({ cmd: 'get_order' }, { orderId })
      .toPromise();

    console.log('Get order...', res);

    return res;
  }
}
