export class MessageAnalyzedEvent {
  constructor(
    public readonly messageId: string,
    public readonly sentimentAnalyzeId: string,
    public readonly probabilities: {
      pos: number,
      neu: number,
      neg: number,
    },
    public readonly label?: string,
    public readonly chatId?: string
  ) { }
}