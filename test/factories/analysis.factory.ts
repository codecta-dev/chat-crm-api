import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { DataSource, EntityManager } from 'typeorm';
import { MessageFactory } from './message.factory';
import { Analysis } from '@modules/analysis/analysis.entity';
import { AnalysisType } from '@modules/analysis/analysis.enum';

type AnalysisTransientParams = {
  manager?: DataSource | EntityManager;
};

export const AnalysisFactory = Factory.define<Analysis, AnalysisTransientParams>(
  ({ onCreate, params, associations, transientParams }) => {
    onCreate(async (analysis) => {
      const manager = transientParams.manager;

      if (manager) {
        const repository = manager.getRepository(Analysis);
        return await repository.save(analysis);
      }
      return analysis;
    });

    const analysis = new Analysis();
    analysis.type = faker.helpers.enumValue(AnalysisType);
    analysis.model = faker.helpers.arrayElement([
      'gpt-4',
      'gpt-3.5-turbo',
      'claude-3',
      'sentiment-analyzer-v1'
    ]);
    analysis.summary = {
      confidence: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      keywords: faker.helpers.arrayElements(
        ['urgent', 'complaint', 'question', 'feedback', 'support'],
        { min: 1, max: 3 }
      ),
      processedAt: faker.date.recent().toISOString()
    };

    analysis.message = associations.message ?? MessageFactory.build({
      createdAt: params.createdAt,
    });

    return analysis;
  }
);