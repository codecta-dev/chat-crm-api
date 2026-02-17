import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from "rxjs";
import { MessageSavedEvent } from "./events/message-saved.event";
import { AnalyzeMessageCommand } from "@modules/analysis/sentiment/commands/analyze-message.command";
import { MessageAnalyzedEvent } from "./events/message-analyzed.event";
import { UpdateSentimentIndicatorCommand } from "./commands/update-sentiment-indicator.command";

@Injectable()
export class ChatSaga {
  @Saga()
  analyzeMessage = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(MessageSavedEvent),
      map(({ message }) => new AnalyzeMessageCommand(
        message.id,
        message.content,
        message?.chat?.id
      ))
    );
  };

  @Saga()
  updateSentiment = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(MessageAnalyzedEvent),
      map((event) => new UpdateSentimentIndicatorCommand(
        event.probabilities,
        event.chatId
      ))
    );
  };
}