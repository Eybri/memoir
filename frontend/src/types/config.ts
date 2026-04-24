export type DeliveryMode = 'one_big_reveal' | 'timed_drip' | 'geofenced';

export interface Config {
  _id: string;
  recipientName: string;
  revealDate: string;
  deliveryMode: DeliveryMode;
  isShared: boolean;
  sharedAt?: string;
  createdAt: string;
  updatedAt: string;
}
