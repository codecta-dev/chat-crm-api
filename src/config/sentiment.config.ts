import { registerAs } from '@nestjs/config';

export default registerAs('sentiment', () => ({
  apiUrl: process.env.IA_URL || 'http://localhost:8000',
  endpoint: `${process.env.IA_URL || 'http://localhost:8000'}/analyze_message`,
}));