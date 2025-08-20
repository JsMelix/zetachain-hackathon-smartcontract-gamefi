export type ChatMessage = { role: 'user' | 'model' | 'system'; content: string };

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8787';

export async function sendChat(messages: ChatMessage[], opts?: { system?: string; temperature?: number }) {
	const res = await fetch(`${API_BASE}/api/ai/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ messages, ...opts }),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: 'Unknown error' }));
		throw new Error(err.error || 'Solicitud IA fallida');
	}
	return (await res.json()) as { text: string };
}
