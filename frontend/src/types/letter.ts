export type LetterType = 'text' | 'voice' | 'photo' | 'video' | 'audio';

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface Letter {
  _id: string;
  caption?: string;
  type: LetterType;
  mediaUrl: string;
  location?: Location;
  isOpened: boolean;
  hearted: boolean;
  reply?: string;
  createdAt: string;
  updatedAt: string;
}
