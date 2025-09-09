import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Ersag Dropshipping Platform API is running!';
  }
}