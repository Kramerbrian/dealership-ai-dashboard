import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json, urlencoded } from 'express';
import { healthRouter } from './utils/health';
import { analyticsRouter } from './routes/analytics';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(json({ limit: '1mb' }));
app.use(urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/api/analytics', analyticsRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
