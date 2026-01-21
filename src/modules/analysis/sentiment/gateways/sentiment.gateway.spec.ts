import { Test, TestingModule } from '@nestjs/testing';
import { SentimentGateway } from './sentiment.gateway';

describe.skip('SentimentGateway', () => {
  let gateway: SentimentGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentimentGateway],
    }).compile();

    gateway = module.get<SentimentGateway>(SentimentGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
