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

