import React, { useState } from 'react';
import { sendChat, type ChatMessage } from '../ai/gemini';

export const AIAssistant: React.FC = () => {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const onSend = async () => {
		if (!input.trim() || isLoading) return;
		const nextMessages = [...messages, { role: 'user', content: input.trim() } as ChatMessage];
		setMessages(nextMessages);
		setInput('');
		setIsLoading(true);
		setError(null);
		try {
			const { text } = await sendChat(nextMessages, {
				system: 'Eres un asistente del juego en ZetaChain. Responde en español, breve y útil.',
				temperature: 0.4,
			});
			setMessages([...nextMessages, { role: 'model', content: text }]);
		} catch (e: any) {
			setError(e?.message || 'Error inesperado');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-slate-900/60 p-4 rounded-lg border border-cyan-500/20 shadow-xl h-full flex flex-col">
			<h3 className="text-xl font-bold mb-2 text-white">Asistente IA</h3>
			<div className="flex-1 overflow-y-auto space-y-3 pr-1">
				{messages.length === 0 && (
					<p className="text-slate-400">Hazme preguntas sobre el juego, contratos y ZetaChain.</p>
				)}
				{messages.map((m, idx) => (
					<div key={idx} className={m.role === 'user' ? 'text-cyan-200' : 'text-slate-200'}>
						<span className="font-semibold mr-1">{m.role === 'user' ? 'Tú' : 'IA'}:</span>
						<span>{m.content}</span>
					</div>
				))}
			</div>
			{error && <div className="text-red-400 text-sm mt-2">{error}</div>}
			<div className="mt-3 flex gap-2">
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Escribe tu mensaje..."
					className="flex-1 px-3 py-2 rounded-md bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
					onKeyDown={(e) => {
						if (e.key === 'Enter') onSend();
					}}
				/>
				<button
					onClick={onSend}
					disabled={isLoading}
					className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 font-semibold"
				>
					{isLoading ? 'Enviando...' : 'Enviar'}
				</button>
			</div>
		</div>
	);
};
