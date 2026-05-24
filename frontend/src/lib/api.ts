import { Letter } from '@/types/letter';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchLetters(): Promise<Letter[]> {
  const response = await fetch(`${API_URL}/letters`);
  if (!response.ok) {
    throw new Error('Failed to fetch letters');
  }
  return response.json();
}

export async function createLetter(data: Partial<Letter>): Promise<Letter> {
  const response = await fetch(`${API_URL}/letters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create letter');
  }
  return response.json();
}

export async function updateLetter(id: string, data: Partial<Letter>): Promise<Letter> {
  const response = await fetch(`${API_URL}/letters/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update letter');
  }
  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
}

export async function signup(name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }
  return response.json();
}

// Photos API
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export async function fetchPhotos() {
  const response = await fetch(`${API_URL}/photos`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch photos');
  return response.json();
}

export async function createPhoto(data: { url: string; publicId: string }) {
  const response = await fetch(`${API_URL}/photos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create photo');
  return response.json();
}

export async function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/photos/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload photo');
  return response.json();
}

export async function deletePhoto(photoId: string) {
  const response = await fetch(`${API_URL}/photos/${photoId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete photo');
  return response.json();
}

export async function bulkDeletePhotos(photoIds: string[]) {
  const response = await fetch(`${API_URL}/photos/bulk-delete`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoIds }),
  });
  if (!response.ok) throw new Error('Failed to bulk delete photos');
  return response.json();
}

export async function addCaption(photoId: string, text: string) {
  const response = await fetch(`${API_URL}/photos/${photoId}/caption`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('Failed to add caption');
  return response.json();
}

export async function searchPhotos(query: string) {
  const response = await fetch(`${API_URL}/photos/search?q=${query}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to search photos');
  return response.json();
}

export async function fetchAlbums() {
  const response = await fetch(`${API_URL}/albums`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch albums');
  return response.json();
}

export async function createAlbum(title: string, coverPhotoUrl?: string, sharedWith?: string[]) {
  const response = await fetch(`${API_URL}/albums`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, coverPhotoUrl, sharedWith }),
  });
  if (!response.ok) throw new Error('Failed to create album');
  return response.json();
}

export async function updateAlbum(albumId: string, data: { title?: string; coverPhotoUrl?: string, sharedWith?: string[] }) {
  const response = await fetch(`${API_URL}/albums/${albumId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update album');
  return response.json();
}

export async function deleteAlbum(albumId: string) {
  const response = await fetch(`${API_URL}/albums/${albumId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete album');
  return response.json();
}

export async function updatePhotoAlbum(photoId: string, albumId: string | null) {
  const response = await fetch(`${API_URL}/photos/${photoId}/album`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ albumId }),
  });
  if (!response.ok) throw new Error('Failed to update photo album');
  return response.json();
}

export async function fetchAlbumById(albumId: string) {
  const response = await fetch(`${API_URL}/albums/${albumId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch album');
  return response.json();
}

// Milestones API
export interface Milestone {
  _id: string;
  userId: string;
  title: string;
  date: string;
  createdAt: string;
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const response = await fetch(`${API_URL}/milestones`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch milestones');
  return response.json();
}

export async function createMilestone(title: string, date: string): Promise<Milestone> {
  const response = await fetch(`${API_URL}/milestones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, date }),
  });
  if (!response.ok) throw new Error('Failed to create milestone');
  return response.json();
}

export async function deleteMilestone(milestoneId: string) {
  const response = await fetch(`${API_URL}/milestones/${milestoneId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete milestone');
  return response.json();
}

// Friends API
export interface UserBasic {
  _id: string;
  name: string;
  email: string;
}

export async function searchUsers(email: string): Promise<UserBasic[]> {
  const response = await fetch(`${API_URL}/users/search?email=${encodeURIComponent(email)}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to search users');
  return response.json();
}

export async function fetchFriends(): Promise<UserBasic[]> {
  const response = await fetch(`${API_URL}/users/friends`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch friends');
  return response.json();
}

export async function sendFriendRequest(receiverId: string) {
  const response = await fetch(`${API_URL}/users/friend-requests/${receiverId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to send request');
  }
  return response.json();
}

export async function fetchPendingRequests() {
  const response = await fetch(`${API_URL}/users/friend-requests/pending`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch pending requests');
  return response.json();
}

export async function fetchSentRequests() {
  const response = await fetch(`${API_URL}/users/friend-requests/sent`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch sent requests');
  return response.json();
}

export async function acceptFriendRequest(requestId: string) {
  const response = await fetch(`${API_URL}/users/friend-requests/${requestId}/accept`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to accept request');
  return response.json();
}

export async function rejectFriendRequest(requestId: string) {
  const response = await fetch(`${API_URL}/users/friend-requests/${requestId}/reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to reject request');
  return response.json();
}

export async function removeFriend(friendId: string): Promise<UserBasic[]> {
  const response = await fetch(`${API_URL}/users/friends/${friendId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to remove friend');
  return response.json();
}

// Notifications API
export interface Notification {
  _id: string;
  recipientId: string;
  senderId?: {
    _id: string;
    name: string;
    email: string;
  };
  type: 'friend_request_received' | 'friend_request_accepted' | 'album_shared' | 'photo_caption_added';
  isRead: boolean;
  message: string;
  relatedId?: string;
  metadata?: {
    albumTitle?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const token = localStorage.getItem('token');
  if (!token) return [];

  try {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.warn('Failed to fetch notifications:', response.status || response.statusText);
      return [];
    }
    return response.json();
  } catch (error) {
    console.warn('Network error fetching notifications:', error);
    return [];
  }
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to mark all notifications as read');
  return response.json();
}

export async function deleteNotification(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete notification');
  return response.json();
}
