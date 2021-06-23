import { Test, TestingModule } from '@nestjs/testing';
import { Db, ObjectID } from 'mongodb';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;
  let connection: Db;

  beforeEach(async () => {
    const mockPayment = (status: string) => {
      return {
        userId: new ObjectID(),
        orderId: new ObjectID(),
        amount: 1000,
        status,
        createAt: new Date(),
      };
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: 'DATABASE_CONNECTION',
          useFactory: () => ({
            db: Db,
            collection: jest.fn().mockReturnThis(),
            insertOne: jest.fn().mockResolvedValue(mockPayment('confirmed')),
            updateOne: jest.fn(),
            findOne: jest.fn().mockResolvedValue(mockPayment('confirmed')),
          }),
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    connection = module.get('DATABASE_CONNECTION');
  });

  it('should call confirmOrderPayment', async () => {
    await service.confirmOrderPayment({
      userId: new ObjectID().toString(),
      orderId: new ObjectID().toString(),
      hash: 'hash',
      amount: 1000,
      reason: 'test',
    });
    expect(connection.collection('payments').insertOne).toHaveBeenCalled();
    expect(connection.collection('payments').findOne).toHaveBeenCalled();
  });
});
