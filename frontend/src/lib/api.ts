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

