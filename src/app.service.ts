import { Inject, Injectable } from '@nestjs/common';
import { Db, ObjectID } from 'mongodb';
import { CancelOrderDto } from './dtos/cancelOrder.dto';
import { ProcessOrderDto } from './dtos/processOrder.dto';
import { Payment } from './interfaces/payment.interface';

@Injectable()
export class AppService {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private db: Db,
  ) {}

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
}
