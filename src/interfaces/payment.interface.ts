import { ObjectID } from 'mongodb';

export type Payment = {
  _id: ObjectID;
  id: string;
  orderId: ObjectID;
  userId: ObjectID;
  amount: number;
  status: 'confirmed' | 'declined' | 'refunded';
  createAt: Date;
  updatedAt: Date;
  reason?: string;
};
