export interface ChatRoom {
  id: string;
  name: string;
  isPrivate: boolean;
  hostId: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  description?: string;
  country?: string;
}