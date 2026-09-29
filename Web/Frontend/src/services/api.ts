const API_URL = 'http://localhost:3000/api';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('argusToken');

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'Erro ao realizar requisição.';

    try {
      const data = await response.json();

      if (data.message) {
        message = data.message;
      }
    } catch {
    }

    throw new Error(message);
  }

  return response.json();
}