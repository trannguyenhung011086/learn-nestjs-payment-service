import { Inject, Module } from '@nestjs/common';
import { MongoClient, Db, Logger } from 'mongodb';

@Module({
  providers: [
    {
      provide: 'DATABASE_CLIENT',
      useFactory: () => ({ client: null }),
    },
    {
      provide: 'DATABASE_CONNECTION',
      inject: ['DATABASE_CLIENT'],
      useFactory: async (dbClient): Promise<Db> => {
        try {
          if (process.env.IS_TEST === 'true') {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongoServer = new MongoMemoryServer({
              binary: { version: 'latest' },
            });
            const mongoUri = await mongoServer.getUri();
            const client = await MongoClient.connect(mongoUri, {
              useUnifiedTopology: true,
            });

            dbClient.client = client;
            const db = client.db(await mongoServer.getDbName());

            return db;
          } else {
            Logger.setLevel('debug');
            const client = await MongoClient.connect(
              process.env.MONGO_DSN || 'mongodb://172.18.144.1',
              {
                useUnifiedTopology: true,
              },
            ).then((res) => {
              console.log('Mongodb connected');
              return res;
            });

            dbClient.client = client;
            const db = client.db('nestjsdb');

            return db;
          }
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: ['DATABASE_CONNECTION', 'DATABASE_CLIENT'],
})
export class DatabaseModule {
  constructor(
    @Inject('DATABASE_CLIENT') private dbClient: { client: MongoClient },
  ) {}

  async onModuleDestroy() {
    await this.dbClient.client.close();
  }
}
