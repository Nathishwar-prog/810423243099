export type NotificationType = 'Placement' | 'Result' | 'Event';
export type NotificationPriority = 'High' | 'Medium' | 'Low';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: NotificationPriority;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}
