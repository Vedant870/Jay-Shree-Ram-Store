import express from 'express';
import cors from 'cors';
import apiRoutes from '../src/routes/api.js';
import { connectDB } from '../src/lib/database.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Support both path behaviors depending on platform URL rewriting
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Non-blocking DB connect on cold starts
connectDB().catch(() => {
  console.warn('MongoDB connection failed during Vercel function bootstrap.');
});

export default async function handler(req: express.Request, res: express.Response) {
  // Ensure each serverless invocation can retry DB connection
  await connectDB();
  return app(req, res);
}
