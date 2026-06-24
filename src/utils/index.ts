import type { Notification, NotificationPriority } from '../types';

interface NetworkNotification {
  ID: string;
  Type: 'Placement' | 'Result' | 'Event';
  Message: string;
  Timestamp: string;
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function mapToNotification(item: NetworkNotification, readIds: Set<string>): Notification {
  const type = item.Type || 'Event';
  const msg = item.Message || '';
  const msgLower = msg.toLowerCase();
  
  let priority: NotificationPriority = 'Low';
  if (type === 'Placement' || msgLower.includes('hiring') || msgLower.includes('end-sem') || msgLower.includes('exam')) {
    priority = 'High';
  } else if (type === 'Result' || msgLower.includes('internal') || msgLower.includes('mid-sem')) {
    priority = 'Medium';
  }

  let title = `${type} Alert`;
  if (msgLower.includes('hiring')) {
    title = `${msg.replace(' hiring', '')} Recruitment`;
  } else if (msgLower === 'end-sem') {
    title = 'End Semester Examinations';
  } else if (msgLower === 'mid-sem') {
    title = 'Mid-Semester Examinations';
  } else if (msgLower === 'internal') {
    title = 'Internal Assessment Marks';
  } else if (msgLower === 'external') {
    title = 'External Reviews';
  } else if (msgLower === 'tech-fest') {
    title = 'Campus Tech Fest';
  } else if (msgLower === 'cult-fest') {
    title = 'Cultural Fest Registrations';
  } else if (msgLower === 'farewell') {
    title = 'Senior Graduation Farewell';
  }

  let timestamp = new Date().toISOString();
  if (item.Timestamp) {
    timestamp = new Date(item.Timestamp.replace(' ', 'T') + 'Z').toISOString();
  }

  return {
    id: item.ID,
    type,
    title,
    message: `Important update regarding ${msg}. Please check the student portal.`,
    timestamp,
    read: readIds.has(item.ID),
    priority
  };
}
