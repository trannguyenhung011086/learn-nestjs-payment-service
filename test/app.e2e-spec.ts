import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { UtilsService } from './../src/utils/utils.service';
import { ObjectID } from 'mongodb';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([
          { name: 'PAYMENT_SERVICE', transport: Transport.TCP },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.connectMicroservice({ transport: Transport.TCP });
    await app.startAllMicroservicesAsync();
    await app.init();

    client = app.get('PAYMENT_SERVICE');
    await client.connect();
  });

  afterAll(async () => {
    client.close();
    await app.close();
  });

  it('handle created order', async () => {
    const userId = new ObjectID();
    const orderId = new ObjectID();
    const hash = new UtilsService().generateSignature(
      { userId, orderId },
      process.env.SECRET_SIG || '1234',
    );

    client.emit('order_created', {
      userId,
      orderId,
      amount: 200000,
      hash,
    });

    //TODO
  });
});
