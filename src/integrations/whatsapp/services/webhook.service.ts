
import { Injectable } from "@nestjs/common";

@Injectable()
export class WebhookService {
  constructor(
    // private readonly logger: PinoLogger,
    // private readonly configService: WhatsAppConfigService,
    // private readonly contactService: ContactsService,
    // private readonly chatService: ChatsService,
    // private readonly userService: UsersService,
    // private readonly whatsappGateway: WhatsappGateway,
    // private readonly notificationService: NotificationsService,
    // @InjectRepository(Message)
    // private readonly messageRepo: Repository<Message>,
    // @InjectQueue('sentiment')
    // private readonly sentimentQueue: Queue,
  ) { }

  // async handleIncomingMessage(payload: WhatsappNotification) {
  //   const { entry, object } = payload
  //   this.logger.debug(`Received webhook: \n${JSON.stringify(payload, null, 2)}`);
  //   if (object !== 'whatsapp_business_account') return;

  //   for (const data of entry) {
  //     const { company } = await this.configService.findByBusinessId(data.id); // id == Company.businessId

  //     this.logger.debug(`Processing webhook for company: ${data.id})`);

  //     for (const change of data.changes ?? []) {

  //       for (const status of change.value.statuses ?? []) {
  //         this.logger.debug(`Webhook status: ${JSON.stringify(status)}`);

  //         for (const error of status.errors ?? []) {
  //           this.whatsappGateway.server.emit('error-event', {
  //             type: error.title ?? 'webhook_status_error',
  //             message: error.error_data.details || 'WhatsApp Webhook Status Error',
  //             hasAction: true,
  //             to: status.recipient_id
  //           });
  //         }
  //       }

  //       for (const message of change.value.messages ?? []) {
  //         const senderWaId = message.from;
  //         const contact = change.value.contacts?.find(c => c.wa_id === senderWaId);
  //         void this.processMessage(message, contact, company.id);
  //       }
  //     }
  //   }
  // }

  // async processMessage(
  //   message: WhatsappNotificationMessage,
  //   notifyContact: WhatsappNotificationContact | undefined,
  //   companyId: string
  // ) {
  //   const { from: phoneNumber, type } = message;

  //   const contact = await this.contactService.findOrCreateByPhone(
  //     phoneNumber,
  //     companyId,
  //     notifyContact
  //   );

  //   const agent = await this.userService.findAvailableAgent(companyId);
  //   const chat = await this.chatService.findOrCreateByContact(
  //     agent.id,
  //     contact.id,
  //   );

  //   let savedMsg: Message | null = null;

  //   const msg: Partial<Message> = {
  //     waId: message.id,
  //     chat: chat,
  //     contact: chat.contact,
  //     agent: chat.assignedAgent,
  //     direction: MessageDirection.IN,
  //     status: MessageStatus.RECEIVED,
  //     senderType: MessageSenderType.CLIENT,
  //   };

  //   switch (type) {
  //     case 'text':
  //       if (message.text?.body) {
  //         msg.body = message.text.body;
  //         this.logger.debug(`Saving message from ${phoneNumber}: ${msg.body}`);
  //         savedMsg = await this.messageRepo.save(msg);

  //         this.logger.debug(`Emitting to agent ${JSON.stringify(chat)} message from ${phoneNumber}: ${msg.body}`);
  //       }
  //       break;
  //   }

  //   if (savedMsg) {
  //     // This is replace with modules/analysis/sentiment - WIP
  //     // await this.sentimentQueue.add('analyze', savedMsg); 
  //     void this.chatService.updateLastMessage(chat.id, savedMsg.id);
  //     const room = this.whatsappGateway.server.sockets.adapter?.rooms?.get(chat.id);
  //     this.logger.debug("Rooms: ", room);
  //     const clientsInRoom = room ? room?.size : 0;
  //     if (clientsInRoom === 0) {
  //       const { createdAt: time, ...rest } = await this.notificationService.create(
  //         `New Message from ${contact.username}`,
  //         savedMsg.body
  //       )

  //       this.whatsappGateway.server.to(`company_${companyId}`).emit('new-notification', {
  //         time,
  //         ...rest
  //       });
  //     }

  //     this.whatsappGateway.server.to(chat.id).emit('new-message', savedMsg);
  //   }
  // }
}