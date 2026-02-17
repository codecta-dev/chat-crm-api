import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ChatAssignments } from "./entities";
import { ReasonAssignment } from "./chat.enum";

@Injectable()
export class ChatRepository {
  constructor(
    private readonly dataSource: DataSource,
  ) { }

  assign(chatId: string, agentId: string, reason?: ReasonAssignment) {
    return this.dataSource.getRepository(ChatAssignments).save({
      chat: { id: chatId },
      agent: { id: agentId },
      reason,
    })
  }

  /**
   * Finds all agent assignments linked to a given chat.
   * 
   * @param chatId - Unique identifier of the chat (foreign key in ChatAssignments).
   * @returns Promise resolving to an array of raw objects containing agent IDs.
   */
  findAssigments(chatId: string) {
    return this.dataSource
      .getRepository(ChatAssignments)
      .createQueryBuilder('assignment')
      .leftJoin('assignment.agent', 'agent')
      .select('agent.id', 'id')
      .where('assignment.chat_id = :chatId', { chatId })
      .getRawMany<{ id: string }>()
  }

  async listChatsAssignments(agentId: string) {
    const query: {
      chatId: string,
      messageId: string,
      messageContent: string,
      messageCreated: string,
      clientId: string,
      clientUsername: string,
      clientPhone: string,
    }[] = await this.dataSource.sql`
      SELECT
          ch.id AS chatId,
          ch.last_message_id AS messageId,
          me.content AS messageContent,
          ch.last_message_at AS messageCreated,
          co.id AS clientId,
          co.username AS clientUsername,
          co.phone_number AS clientPhone
      FROM
          chats ch
      LEFT JOIN chat_assignments ch_a ON
          ch.id = ch_a.chat_id
      LEFT JOIN messages me ON
          me.message_id = ch.last_message_id
      LEFT JOIN contacts co ON
          co.id = ch.client_id
      WHERE
          ch_a.agent_id = ${agentId} AND ch.status NOT IN('closed', 'archived')
    `;

    return query;
  }
}