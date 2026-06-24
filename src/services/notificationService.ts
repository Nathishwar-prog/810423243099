import api from './api';

export async function fetchNotificationsFromServer() {
  const response = await api.get('/notifications');
  return response.data;
}

export async function markReadOnServer(id: string) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}

export async function deleteOnServer(id: string) {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
}
