// /src/modules/chats/dto/chat-user.dto.ts

import { ChatStatus } from "../entities/chat.entity";

// Estructura simplificada de un mensaje para el frontend
export interface ChatMessageDto {
  sender: 'You' | 'Client' | 'System';
  content: string; // Usamos content en lugar de message
  timestamp: Date;
}

// Estructura principal para la lista de Chats en el frontend
export interface ChatUserDto {
  id: string;
  // Datos del Contacto
  fullName: string;
  phone: string;
  avatar: string; // URL del avatar (si tienes este campo en Contact)

  // Datos del Chat/Conversación
  status: ChatStatus;
  title: string; // Para mostrar un estado simple (ej: 'Online')

  // Último mensaje (solo uno para la vista de lista)
  lastMessage: ChatMessageDto;
}