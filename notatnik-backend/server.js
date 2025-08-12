import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './db/database.js';
import { initializeDatabase } from './db/init.js';
import apiRoutes from './routes/index.js';
import { apiLogger, validateJSON, requestSizeLimit, sanitizeInput } from './middleware/validation.js';

// Ładowanie zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Bezpieczeństwo
app.use(morgan('combined')); // Logowanie requestów
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(validateJSON); // Walidacja JSON
app.use(requestSizeLimit); // Limit rozmiaru requestów
app.use(sanitizeInput); // Sanityzacja danych wejściowych
app.use(apiLogger); // Logowanie API requestów

// Podstawowe endpoint'y
app.get('/', (req, res) => {
  res.json({
    message: '🗒️ Notatnik Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
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

// Obsługa błędów 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Globalny handler błędów
app.use((error, req, res, next) => {
  console.error('❌ Błąd serwera:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Funkcja startowa serwera
const startServer = async () => {
  try {
    console.log('🚀 Uruchamianie serwera...');
    
    // Test połączenia z bazą danych
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Nie można połączyć się z bazą danych');
      process.exit(1);
    }
    
    // Inicjalizacja bazy danych
    await initializeDatabase();
    
    // Uruchomienie serwera
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

// Obsługa zamykania aplikacji
process.on('SIGINT', () => {
  console.log('\n🛑 Otrzymano sygnał SIGINT, zamykanie serwera...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Otrzymano sygnał SIGTERM, zamykanie serwera...');
  process.exit(0);
});

// Uruchomienie serwera
startServer();
