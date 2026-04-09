import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, mergeMap, Observable } from "rxjs";
import { MessageSavedEvent } from "./events/message-saved.event";
import { MessageAnalyzedEvent } from "./events/message-analyzed.event";
import { ChatMessageSentEvent } from "./events/chat-message-sent.event";
import { getMessageStrategy } from "@modules/message/strategies/strategy.registry";
import { MessageType } from "@modules/message/message.enum";
import { AnalyzeMessageCommand } from "@modules/analysis/sentiment/commands/analyze-message.command";
import {
  SaveChatMessageCommand,
  BroadcastChatMessageCommand,
  UpdateSentimentIndicatorCommand
} from "./commands";

@Injectable()
export class ChatSaga {
  @Saga()
  savedMessage = (event$: Observable<any>): Observable<ICommand> => {
    return event$.pipe(
      ofType(ChatMessageSentEvent),
      map((event) => new SaveChatMessageCommand(event.payload))
    )
  }
  @Saga()
  analyzeMessage = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(MessageSavedEvent),
      mergeMap(({ message }) => [
        new AnalyzeMessageCommand(
          message.id,
          message.content,
          message?.chat?.id
        ),
        new BroadcastChatMessageCommand(
          message.id,
          getMessageStrategy(message.type ?? MessageType.TEXT).toBroadcastFields(message),
          message.chat?.id
        )
      ])
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