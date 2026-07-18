const API_URL = process.env.EXPO_PUBLIC_API_URL;

function endpoint(path: string) {
  if (!API_URL) throw new Error('Configura EXPO_PUBLIC_API_URL para conectarte al servidor.');
  return `${API_URL.replace(/\/$/, '')}${path}`;
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(endpoint(path), {
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) throw new Error(`La solicitud falló (${response.status}).`);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Configura')) throw error;
    throw new Error('No fue posible conectar con el servidor simulado. Verifica la red y vuelve a intentarlo.');
  }
}
