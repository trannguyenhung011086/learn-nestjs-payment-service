import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UtilsService {
  generateSignature(payload: unknown, secretKey: string) {
    const timestamp = Date.now();
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    const hash = crypto
      .createHmac('SHA256', secretKey)
      .update(message)
      .digest('hex');
    return `ts=${timestamp},msg=${hash}`;
  }

  verifySignature(signature: string, payload: unknown, secretKey: string) {
    if (!signature) throw new Error('Missing Signature!');

    const parts = signature.split(',');
    const timestamp = parts[0].split('=')[1];

    if (
      new Date().getTime() - new Date(parseInt(timestamp)).getTime() >
      5 * 60 * 1000
    ) {
      throw new Error('Time expired!');
    }

    const hash = parts[1].split('=')[1];

    const message = `${timestamp}.${JSON.stringify(payload)}`;
    const expected = crypto
      .createHmac('SHA256', secretKey)
      .update(message)
      .digest('hex');

    if (process.env.APP_ENV !== 'production')
      console.log({ expected_hash: expected, actual_hash: hash });

    if (expected !== hash) throw new Error('Invalid Signature!');

    return true;
  }
}
