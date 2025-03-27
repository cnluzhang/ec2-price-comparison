import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import { apiRoutes } from './routes';
import { errorMiddleware } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';

// Initialize Express app
const app = express();
const port = config.port;

// Apply middlewares
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Apply API routes
app.use('/api', apiRoutes);

// Apply error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});