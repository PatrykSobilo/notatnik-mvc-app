import pool from './database.js';

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

const createNotesTable = `
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

const createChatSessionsTable = `
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(note_id)
  );
`;

const createChatMessagesTable = `
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
  CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_note_id ON chat_sessions(note_id);
  CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
`;

export const initializeDatabase = async () => {
  try {
    console.log('🚀 Inicjalizacja bazy danych...');
    
    // Tworzymy tabele w odpowiedniej kolejności (z uwagi na foreign keys)
    await pool.query(createUsersTable);
    console.log('✅ Tabela "users" została utworzona lub już istnieje');
    
    await pool.query(createNotesTable);
    console.log('✅ Tabela "notes" została utworzona lub już istnieje');
    
    await pool.query(createChatSessionsTable);
    console.log('✅ Tabela "chat_sessions" została utworzona lub już istnieje');
    
    await pool.query(createChatMessagesTable);
    console.log('✅ Tabela "chat_messages" została utworzona lub już istnieje');
    
    await pool.query(createIndexes);
    console.log('✅ Indeksy zostały utworzone');
    
    console.log('🎉 Baza danych została zainicjalizowana pomyślnie!');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas inicjalizacji bazy danych:', error);
    return false;
  }
};

export const clearDatabase = async () => {
  try {
    // Usuwamy tabele w odwrotnej kolejności (z uwagi na foreign keys)
    await pool.query('DROP TABLE IF EXISTS chat_messages CASCADE;');
    console.log('🗑️ Tabela "chat_messages" została usunięta');
    
    await pool.query('DROP TABLE IF EXISTS chat_sessions CASCADE;');
    console.log('🗑️ Tabela "chat_sessions" została usunięta');
    
    await pool.query('DROP TABLE IF EXISTS notes CASCADE;');
    console.log('🗑️ Tabela "notes" została usunięta');
    
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('🗑️ Tabela "users" została usunięta');
    
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas czyszczenia bazy danych:', error);
    return false;
  }
};
