import pool from './database.js';

// SQL do tworzenia tabeli użytkowników
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

// SQL do modyfikacji tabeli notatek - dodanie user_id
const addUserIdToNotes = `
  ALTER TABLE notes 
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
`;

// SQL do tworzenia indeksów
const createUserIndexes = `
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
`;

// Funkcja do inicjalizacji systemu użytkowników
export const initializeUsersSystem = async () => {
  try {
    console.log('👥 Inicjalizacja systemu użytkowników...');
    
    // Tworzenie tabeli użytkowników
    await pool.query(createUsersTable);
    console.log('✅ Tabela "users" została utworzona lub już istnieje');
    
    // Dodanie user_id do tabeli notatek
    await pool.query(addUserIdToNotes);
    console.log('✅ Kolumna "user_id" została dodana do tabeli "notes"');
    
    // Tworzenie indeksów
    await pool.query(createUserIndexes);
    console.log('✅ Indeksy użytkowników zostały utworzone');
    
    console.log('🎉 System użytkowników został zainicjalizowany pomyślnie!');
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas inicjalizacji systemu użytkowników:', error);
    return false;
  }
};

// Funkcja do tworzenia testowego użytkownika
export const createTestUser = async () => {
  try {
    // Sprawdź czy testowy użytkownik już istnieje
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', ['testuser']);
    
    if (existingUser.rows.length > 0) {
      console.log('👤 Testowy użytkownik już istnieje');
      return existingUser.rows[0].id;
    }
    
    // Utwórz testowego użytkownika (hasło: test123)
    const hashedPassword = '$2b$10$rOHpH/z6mVaH4i0KKZg7JOqzTQ1yYGP4YFcGJ8K9bqMj8x1o.G1LO'; // test123
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      ['testuser', 'test@example.com', hashedPassword]
    );
    
    console.log('👤 Utworzono testowego użytkownika (username: testuser, password: test123)');
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia testowego użytkownika:', error);
    return null;
  }
};

// Funkcja do przypisania istniejących notatek do testowego użytkownika
export const assignExistingNotesToUser = async (userId) => {
  try {
    const result = await pool.query(
      'UPDATE notes SET user_id = $1 WHERE user_id IS NULL',
      [userId]
    );
    
    console.log(`📝 Przypisano ${result.rowCount} notatek do użytkownika`);
    return true;
  } catch (error) {
    console.error('❌ Błąd podczas przypisywania notatek:', error);
    return false;
  }
};
