import express, { Application, Request, Response } from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

app.use(errorHandler);

export default app;