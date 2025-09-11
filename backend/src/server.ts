import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import rifasRoutes from './routes/rifas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/rifas', rifasRoutes);

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});