import { MessageType } from "../message.enum";
import { DocumentMessageStrategy } from "./document.strategy";
import { ImageMessageStrategy } from "./image.strategy";
import { MessageStrategy } from "./message.strategy";
import { TextMessageStrategy } from "./text.strategy";

export const MESSAGE_STRATEGY_REGISTRY: Record<MessageType, MessageStrategy> = {
  [MessageType.TEXT]: new TextMessageStrategy(),
  [MessageType.IMAGE]: new ImageMessageStrategy(),
  [MessageType.DOCUMENT]: new DocumentMessageStrategy(),
};

export function getMessageStrategy(type: MessageType): MessageStrategy {
  const strategy = MESSAGE_STRATEGY_REGISTRY[type];

  if (!strategy) {
    throw new Error(`No strategy registered for message type: ${type}`);
  }

  return strategy;
}