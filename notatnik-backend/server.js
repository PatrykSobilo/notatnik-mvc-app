import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './db/database.js';
import { initializeDatabase } from './db/init.js';
import apiRoutes from './routes/index.js';
import { apiLogger, validateJSON, requestSizeLimit, sanitizeInput } from './middleware/validation.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('combined'));
// Konfiguracja CORS z dynamicznym dopuszczeniem produkcyjnego originu (FRONTEND_ORIGIN)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  process.env.FRONTEND_ORIGIN // np. http://157.230.20.16 lub docelowa domena
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Brak origin (np. curl) – zezwól
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed: ' + origin), false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(validateJSON);
app.use(requestSizeLimit);
app.use(sanitizeInput);
app.use(apiLogger);
app.get('/', (req, res) => {
  res.json({
    message: '🗒️ Notatnik Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRoutes);

app.get('/health', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: 'OK',
      database: dbStatus ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Version / build metadata endpoint
const BUILD_TIME = new Date().toISOString();
app.get('/version', (req, res) => {
  res.json({
    commit: process.env.COMMIT_SHA || 'dev',
    buildTime: BUILD_TIME,
    node: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

app.use((error, req, res, next) => {
  console.error('❌ Błąd serwera:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

const startServer = async () => {
  try {
    console.log('🚀 Uruchamianie serwera...');
    
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Nie można połączyć się z bazą danych');
      process.exit(1);
    }
    
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🌟 Serwer działa na porcie ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Błąd podczas uruchamiania serwera:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  console.log('\n🛑 Otrzymano sygnał SIGINT, zamykanie serwera...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Otrzymano sygnał SIGTERM, zamykanie serwera...');
  process.exit(0);
});

startServer();
