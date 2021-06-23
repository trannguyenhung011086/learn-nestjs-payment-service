import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsService } from './utils/utils.service';

describe('AppController', () => {
  let appController: AppController;
  let spyAppService: AppService;
  let spyUtilsService: UtilsService;
  let spyOrderService: ClientProxy;

  beforeEach(async () => {
    const mockPayment = (status: string) => {
      return {
        userId: new ObjectID(),
        orderId: new ObjectID(),
        amount: 1000,
        status,
        createAt: new Date(),
        reason: 'test',
      };
    };
    const AppServiceProvider = {
      provide: AppService,
      useFactory: () => ({
        getPaymentResult: jest.fn().mockReturnValue('success'),
        confirmOrderPayment: jest.fn(() => mockPayment('confirmed')),
        declineOrderPayment: jest.fn(() => mockPayment('declined')),
        refundOrderPayment: jest.fn(() => mockPayment('refunded')),
      }),
    };
    const UtilsServiceProvider = {
      provide: UtilsService,
      useFactory: () => ({
        generateSignature: jest.fn(() => 'hash signature'),
        verifySignature: jest.fn(() => true),
      }),
    };
    const OrderServiceProvider = {
      provide: 'ORDER_SERVICE',
      useFactory: () => ({
        emit: jest.fn(() => 'emit event'),
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        AppServiceProvider,
        UtilsServiceProvider,
        OrderServiceProvider,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    spyAppService = app.get<AppService>(AppService);
    spyUtilsService = app.get<UtilsService>(UtilsService);
    spyOrderService = app.get<ClientProxy>('ORDER_SERVICE');
  });

  describe('root', () => {
    it('should call handleOrderCreated', async () => {
      await appController.handleOrderCreated({
        userId: new ObjectID().toString(),
        orderId: new ObjectID().toString(),
        hash: 'hash',
        amount: 1000,
        reason: 'test',
      });
      expect(spyAppService.confirmOrderPayment).toHaveBeenCalled();
      expect(spyUtilsService.verifySignature).toHaveBeenCalled();
      expect(spyOrderService.emit).toHaveBeenCalled();
    });

    it('should call handleOrderCancelled', async () => {
      await appController.handleOrderCancelled({
        userId: new ObjectID().toString(),
        orderId: new ObjectID().toString(),
        hash: 'hash',
        reason: 'test',
        refund: true,
      });
      expect(spyAppService.refundOrderPayment).toHaveBeenCalled();
      expect(spyUtilsService.verifySignature).toHaveBeenCalled();
    });
  });
});
