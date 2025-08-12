import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token ważny przez 7 dni

// Rejestracja nowego użytkownika
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Walidacja danych wejściowych
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Wszystkie pola są wymagane'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Hasło musi mieć co najmniej 6 znaków'
      });
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Użytkownik o takiej nazwie lub emailu już istnieje'
      });
    }

    // Hash hasła
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Dodaj użytkownika do bazy
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // Utwórz JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Użytkownik został utworzony pomyślnie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({
      error: 'Błąd serwera podczas rejestracji'
    });
  }
};

// Logowanie użytkownika
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Walidacja danych wejściowych
    if (!username || !password) {
      return res.status(400).json({
        error: 'Nazwa użytkownika i hasło są wymagane'
      });
    }

    // Znajdź użytkownika w bazie
    const result = await pool.query(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Nieprawidłowa nazwa użytkownika lub hasło'
      });
    }

    const user = result.rows[0];

    // Sprawdź hasło
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Nieprawidłowa nazwa użytkownika lub hasło'
      });
    }

    // Utwórz JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Logowanie pomyślne',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({
      error: 'Błąd serwera podczas logowania'
    });
  }
};

// Sprawdzenie czy token jest ważny
export const verifyToken = async (req, res) => {
  try {
    const { userId } = req.user; // Dodane przez middleware auth

    // Pobierz dane użytkownika
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Użytkownik nie został znaleziony'
      });
    }

    const user = result.rows[0];

    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Błąd weryfikacji tokenu:', error);
    res.status(500).json({
      error: 'Błąd serwera podczas weryfikacji'
    });
  }
};

// Wylogowanie (po stronie klienta wystarczy usunąć token)
export const logout = (req, res) => {
  res.json({
    message: 'Wylogowanie pomyślne'
  });
};
