import { registerAs } from '@nestjs/config';

export const queueConfig = registerAs('queue', () => ({
  driver: process.env.QUEUE_DRIVER ?? 'in-process',
}));
