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
  // Optional owner-selected background. Can be a preset key ("royal","nebula","galaxy") or a URL path.
  background?: string;
  // Moderators user ids
  moderators?: string[];
}