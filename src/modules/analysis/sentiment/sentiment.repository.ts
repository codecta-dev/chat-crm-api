import { SentimentAnalysis } from "@entities";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { SentimentResponse } from "./sentiment.interface";
import { AnalysisType } from "../analysis.enum";

export class SentimentRepository {
  constructor(
    @InjectRepository(SentimentAnalysis)
    private readonly repo: Repository<SentimentAnalysis>,
    private readonly dataSource: DataSource,
  ) { }

  async save(
    { probabilities, label }: SentimentResponse,
    messageId: string,
    model: string = 'pysentiment',
    summary?: object
  ) {
    return await this.dataSource.transaction(async (manager) => {

      const sentimentAnalyze = this.repo.create({
        label,
        scorePos: probabilities.POS,
        scoreNeu: probabilities.NEU,
        scoreNeg: probabilities.NEG,
        analysis: {
          message: { id: messageId },
          model,
          summary,
          type: AnalysisType.SENTIMENT
        }
      })

      return await manager.save(sentimentAnalyze);
    })
  }
}