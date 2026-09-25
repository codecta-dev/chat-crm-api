import { z } from 'zod';

export const ChatSchema = z.object({
  id: z.number().optional(),
  title: z.string().optional(),
  contactId: z.uuid(),
  lastMessageId: z.number().optional(),
  createdAt: z.iso.datetime().optional(),
});

export const ChatMessageSchema = z.object({
  sender: z.string(),
  content: z.string(),
  timestamp: z.date(),
});

export const ChatListItemSchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  phone: z.string(),
  avatar: z.string().nullable(),
  status: z.enum(['open', 'pending', 'closed', 'archived']).default('open'),
  lastMessage: ChatMessageSchema,
});

export type ChatListItemDto = z.infer<typeof ChatListItemSchema>;
export type ChatType = z.infer<typeof ChatSchema>;