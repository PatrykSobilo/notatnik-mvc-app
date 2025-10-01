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
  process.env.FRONTEND_ORIGIN // np. https://sobit.uk
].filter(Boolean);

console.log('🔐 CORS allowed origins (initial):', allowedOrigins);

// Dodatkowa logika: jeśli w produkcji i origin odpowiada hostowi requestu (https) – dopuść (last resort)
function isOriginAllowed(origin, reqHost) {
  if (!origin) return true; // np. curl / serwerowy request
  if (allowedOrigins.includes(origin)) return true;
  // Jeżeli produkcja i origin jest "https://" + host (kanoniczny przypadek)
  if (process.env.NODE_ENV === 'production' && reqHost && origin === `https://${reqHost}`) {
    console.warn('CORS: dynamically allowing origin that matches host:', origin);
    allowedOrigins.push(origin); // cache
    return true;
  }
  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    // origin sprawdzony niżej w middleware który ma dostęp do req
    callback(null, true); // Tymczasowo przepuszczamy – faktyczna walidacja niżej (custom middleware)
  },
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization']
}));

// Właściwa walidacja origin (po wstępnym dodaniu nagłówków CORS – aby nie powodować 500 przy wczesnym błędzie)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin) return next();
  if (isOriginAllowed(origin, host)) return next();
  console.warn('🚫 CORS blocked origin:', origin, 'allowed:', allowedOrigins);
  return res.status(403).json({
    success: false,
    error: 'CORS: Origin not allowed',
    origin,
    allowedOrigins
  });
});
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
