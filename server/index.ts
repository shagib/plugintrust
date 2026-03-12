import express from 'express';
import cors from 'cors';
import pluginRoutes from './routes/plugins';

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use('/api/plugins', pluginRoutes);

// health check
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
