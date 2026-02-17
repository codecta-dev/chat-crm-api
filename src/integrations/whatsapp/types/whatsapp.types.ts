export type WhatsAppBaseMessage = {
  messagingProduct?: string;
  recipientType?: string;
  to?: string;
  type?: string;
};

export type WhatsAppTextMessage = WhatsAppBaseMessage & {
  text: { body: string };
};

export type WhatsAppImageMessage = WhatsAppBaseMessage & {
  type: "image";
  image: { link: string; caption?: string };
};

export type WhatsAppLocationMessage = WhatsAppBaseMessage & {
  type: "location";
  location: { latitude: string; longitude: string; name?: string; address?: string };
};

export type WhatsAppMessage =
  | WhatsAppTextMessage
  | WhatsAppImageMessage
  | WhatsAppLocationMessage;
