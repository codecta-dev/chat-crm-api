import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { DataSource, EntityManager } from 'typeorm';
import { AnalysisFactory } from './analysis.factory';
import { SentimentAnalysis } from '@modules/analysis/sentiment/sentiment.entity';
import { SentimentLabel } from '@modules/analysis/sentiment/sentiment.enum';

type SentimentAnalysisTransientParams = {
  manager?: DataSource | EntityManager;
};

export const SentimentAnalysisFactory = Factory.define<
  SentimentAnalysis,
  SentimentAnalysisTransientParams
>(({ onCreate, params, associations, transientParams }) => {
  onCreate(async (sentimentAnalysis) => {
    const manager = transientParams.manager

    if (manager) {
      const repository = manager.getRepository(SentimentAnalysis);
      return await repository.save(sentimentAnalysis);
    }
    return sentimentAnalysis;
  });

  const sentimentAnalysis = new SentimentAnalysis();

  // Generated score between 1 prox.
  const scores = generateNormalizedScores();
  sentimentAnalysis.scorePos = scores.pos;
  sentimentAnalysis.scoreNeu = scores.neu;
  sentimentAnalysis.scoreNeg = scores.neg;

  switch (params.label) {
    case SentimentLabel.POSITIVE: sentimentAnalysis.scorePos = 1.0; break;
    case SentimentLabel.NEUTRAL: sentimentAnalysis.scoreNeu = 1.0; break;
    case SentimentLabel.NEGATIVE: sentimentAnalysis.scoreNeg = 1.0; break;
  }

  // Determined label sentiment
  sentimentAnalysis.label = params.label ?? determineLabelFromScores(scores);

  sentimentAnalysis.analysis = associations.analysis ?? AnalysisFactory
    .params({ createdAt: params.createdAt }).build();

  return sentimentAnalysis;
});

// Función helper para generar scores normalizados
function generateNormalizedScores() {
  const pos = parseFloat(faker.number.float({ min: 0, max: 1, fractionDigits: 4 }).toFixed(4));
  const neu = parseFloat(faker.number.float({ min: 0, max: 1 - pos, fractionDigits: 4 }).toFixed(4));
  const neg = parseFloat((1 - pos - neu).toFixed(4));

  return { pos, neu, neg };
}

function determineLabelFromScores(scores: { pos: number; neu: number; neg: number }): SentimentLabel {
  const max = Math.max(scores.pos, scores.neu, scores.neg);

  if (max === scores.pos) return SentimentLabel.POSITIVE;
  if (max === scores.neg) return SentimentLabel.NEGATIVE;
  return SentimentLabel.NEUTRAL;
}