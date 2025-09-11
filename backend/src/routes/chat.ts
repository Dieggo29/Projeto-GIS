import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Você é um especialista em pesca brasileira. ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ response: response.text() });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

export default router;