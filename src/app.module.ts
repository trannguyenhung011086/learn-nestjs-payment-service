import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UtilsService } from './utils/utils.service';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [AppController],
  providers: [
    {
      provide: 'ORDER_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDER_SERVICE_HOST') || 'localhost',
            port: configService.get('ORDER_SERVICE_PORT') || '3001',
          },
        }),
    },
    AppService,
    UtilsService,
  ],
})
export class AppModule {}
