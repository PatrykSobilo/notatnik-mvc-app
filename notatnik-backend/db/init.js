import pool from './database.js';

// SQL do tworzenia tabeli notatek
const createNotesTable = `
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

// SQL do tworzenia indeksów dla lepszej wydajności
const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
  CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
`;

// Funkcja do inicjalizacji bazy danych
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Inicjalizacja bazy danych...');
    
    // Tworzenie tabeli notatek
    await pool.query(createNotesTable);
    console.log('✅ Tabela "notes" została utworzona lub już istnieje');
    
    // Tworzenie indeksów
    await pool.query(createIndexes);
    console.log('✅ Indeksy zostały utworzone');
    
    console.log('🎉 Baza danych została zainicjalizowana pomyślnie!');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas inicjalizacji bazy danych:', error);
    return false;
  }
};

// Funkcja do czyszczenia bazy danych (pomocna podczas developmentu)
export const clearDatabase = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS notes CASCADE;');
    console.log('🗑️ Tabela "notes" została usunięta');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia bazy danych:', error);
    return false;
  }
};
