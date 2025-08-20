import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: true }));

const PORT = Number(process.env.SERVER_PORT || 8787);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!GEMINI_API_KEY) {
	console.warn('⚠️  GEMINI_API_KEY no está definido. Configura tu .env para habilitar la IA.');
}

app.post('/api/ai/chat', async (req, res) => {
	try {
		if (!GEMINI_API_KEY) {
			return res.status(500).json({ error: 'GEMINI_API_KEY no configurado en el servidor' });
		}
		const { messages, system, temperature } = req.body as {
			messages: Array<{ role: 'user' | 'model' | 'system'; content: string }>;
			system?: string;
			temperature?: number;
		};

		if (!messages || !Array.isArray(messages) || messages.length === 0) {
			return res.status(400).json({ error: 'messages es requerido' });
		}

		const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
		const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

		const promptParts: string[] = [];
		if (system) promptParts.push(`System: ${system}`);
		for (const m of messages) {
			const role = m.role === 'user' ? 'User' : m.role === 'model' ? 'Assistant' : 'System';
			promptParts.push(`${role}: ${m.content}`);
		}
		promptParts.push('Assistant:');

		const result = await model.generateContent({
			contents: [{ role: 'user', parts: [{ text: promptParts.join('\n') }] }],
			generationConfig: {
				temperature: typeof temperature === 'number' ? temperature : 0.7,
				maxOutputTokens: 1024,
			},
		});
		const text = result.response.text();
		return res.json({ text });
	} catch (err: any) {
		console.error('AI error:', err?.message || err);
		return res.status(500).json({ error: 'Error al procesar la solicitud de IA' });
	}
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
	console.log(`🤖 AI server escuchando en http://localhost:${PORT}`);
});
