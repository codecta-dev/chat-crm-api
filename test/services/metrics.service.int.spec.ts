import { AnalysisFactory, MessageFactory, SentimentAnalysisFactory, UserFactory } from "@factories";
import { MetricsService } from "@modules/metrics/metrics.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getDataSourceToken, TypeOrmModule } from "@nestjs/typeorm";
import { subDays, subMonths } from "date-fns";
import { getTestSQLiteConfig } from "../helpers/test-database.helper";
import { DataSource, QueryRunner } from "typeorm";
import { MetricsRepository } from "@modules/metrics/metrics.repository";
import { SentimentRepository } from "@modules/metrics/repositories/sentiment.repository";
import { SentimentLabel } from "@modules/analysis/sentiment/sentiment.enum";
import {
  Analysis, Chat, Company, Contact, User,
  SentimentAnalysis, WhatsAppConfig, Notification, Message
} from "@entities";
import { MessageSenderType } from "@modules/message/message.entity";

describe('Metrics Service - integration', () => {
  let module: TestingModule;
  let service: MetricsService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestSQLiteConfig([
          SentimentAnalysis, Analysis, Message, Chat, Contact,
          User, Company, Notification, WhatsAppConfig,
        ])),
        TypeOrmModule.forFeature([SentimentAnalysis])
      ],
      providers: [MetricsService, MetricsRepository, SentimentRepository]
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    dataSource = module.get<DataSource>(getDataSourceToken());

  }, 30000);

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    if (dataSource) await dataSource.destroy();
    if (module) await module.close();
  });

  async function setupAgentsAndMessages(
    dates: Array<{ date: Date; agentNum: 1 | 2 }>,
    label: SentimentLabel,
    scorePos: number,
    scoreNeu: number,
    scoreNeg: number,
  ) {
    const userFactory = UserFactory.transient({ manager: queryRunner.manager });

    const [agent1, agent2] = await Promise.all([
      userFactory.create({ username: 'agent1' }),
      userFactory.create({ username: 'agent2' }),
    ]);

    await Promise.all(
      dates.map(async ({ date, agentNum }) => {
        const message = await MessageFactory.transient({ manager: queryRunner.manager })
          .associations({ senderId: agentNum === 1 ? agent1.id : agent2.id })
          .create({ createdAt: date, senderType: MessageSenderType.AGENT });

        const analysis = await AnalysisFactory
          .transient({ manager: queryRunner.manager })
          .create({ message: { id: message.id } });

        await SentimentAnalysisFactory
          .transient({ manager: queryRunner.manager })
          .create({ analysis, label, scorePos, scoreNeu, scoreNeg });
      })
    );

    return { agent1, agent2 };
  }

  describe.each([
    {
      label: SentimentLabel.POSITIVE,
      scorePos: 0.9,
      scoreNeu: 0.05,
      scoreNeg: 0.05,
    },
    {
      label: SentimentLabel.NEUTRAL,
      scorePos: 0.2,
      scoreNeu: 0.7,
      scoreNeg: 0.1,
    },
    {
      label: SentimentLabel.NEGATIVE,
      scorePos: 0.1,
      scoreNeu: 0.2,
      scoreNeg: 0.7,
    },
  ])('with label $label', ({ label, scorePos, scoreNeu, scoreNeg }) => {

    it.each([
      {
        scenario: 'last 7 days',
        dates: [
          { date: subDays(new Date(), 2), agentNum: 1 as const },
          { date: subDays(new Date(), 4), agentNum: 1 as const },
          { date: subDays(new Date(), 6), agentNum: 2 as const },
        ],
        expectedAgent: 1,
        expectedTotal: 2,
      },
      {
        scenario: 'last 30 days',
        dates: [
          { date: subDays(new Date(), 5), agentNum: 1 as const },
          { date: subDays(new Date(), 10), agentNum: 1 as const },
          { date: subDays(new Date(), 15), agentNum: 2 as const },
          { date: subDays(new Date(), 25), agentNum: 1 as const },
        ],
        expectedAgent: 1,
        expectedTotal: 3,
      },
      {
        scenario: 'last 3 months',
        dates: [
          { date: subMonths(new Date(), 1), agentNum: 1 as const },
          { date: subMonths(new Date(), 2), agentNum: 2 as const },
          { date: subMonths(new Date(), 2), agentNum: 2 as const },
          { date: subMonths(new Date(), 3), agentNum: 2 as const },
        ],
        expectedAgent: 2,
        expectedTotal: 3,
      },
      {
        scenario: 'last 6 months',
        dates: [
          { date: subMonths(new Date(), 1), agentNum: 1 as const },
          { date: subMonths(new Date(), 2), agentNum: 1 as const },
          { date: subMonths(new Date(), 3), agentNum: 1 as const },
          { date: subMonths(new Date(), 4), agentNum: 2 as const },
          { date: subMonths(new Date(), 5), agentNum: 2 as const },
        ],
        expectedAgent: 1,
        expectedTotal: 3,
      },
    ])('should return top agents for $scenario', async ({ dates, expectedAgent, expectedTotal }) => {
      const { agent1, agent2 } = await setupAgentsAndMessages(
        dates,
        label,
        scorePos,
        scoreNeu,
        scoreNeg
      );

      const result = await service.getSentimentTop('agent', label);
      const expected = expectedAgent === 1 ? agent1 : agent2;

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].agent?.username).toBe(expected.username);
      expect(result[0].total).toBe(expectedTotal);
      expect(result[0].label).toBe(label);
    });
  });
});