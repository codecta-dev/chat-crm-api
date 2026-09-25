import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ChatMessagePayload } from '@modules/chats/chat.interface';
import { MessageService } from './message.services';

interface UpdateStatusData {
  id: string;
  status: string;
}

interface JobMap {
  saveMessage: { data: ChatMessagePayload; result: { messageId?: string } };
  updateStatus: {
    data: UpdateStatusData;
    result: { messageId?: string; status: string };
  };
}

type JobName = keyof JobMap;

type Handler<K extends JobName> = (
  data: JobMap[K]['data'],
) => Promise<JobMap[K]['result']>;
type HandlerMap = { [K in JobName]: Handler<K> };

@Processor('message')
export class MessageProcessor extends WorkerHost {
  constructor(private readonly service: MessageService) {
    super();
  }

  private readonly handlers: HandlerMap = {
    saveMessage: async ({ room: chatId, content, sender, mediaUrl }) => {
      const message = await this.service.saveMsg(
        chatId,
        content,
        sender,
        mediaUrl,
      );
      return { messageId: message?.id };
    },
    updateStatus: function (_data: UpdateStatusData) {
      throw new Error('Function not implemented.');
    },
  };

  async process(
    job: Job<JobMap[JobName]['data'], JobMap[JobName]['result'], JobName>,
  ): Promise<JobMap[JobName]['result']> {
    const handler = this.handlers[job.name];

    if (!handler) throw new Error(`Unknown job name: ${job.name}`);

    return (handler as Handler<typeof job.name>)(job.data);
  }
}
