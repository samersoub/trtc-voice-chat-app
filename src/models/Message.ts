export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  type: "text" | "system";
  
  // Additional properties for chat history
  text?: string;
  senderName?: string;
  timestamp?: Date;
}