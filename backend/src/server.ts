import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://agenda-depilacao-brasilia.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`🚀 Servidor rodando na porta ${config.port}`);
  console.log(`📍 http://localhost:${config.port}`);
});