import pool from './db/database.js';

async function checkTables() {
  try {
    console.log('🔍 Sprawdzanie tabel w bazie danych...');
    
    // Sprawdź jakie tabele istnieją
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tabele w bazie danych:');
    if (tablesResult.rows.length === 0) {
      console.log('   Brak tabel w bazie danych');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    // Sprawdź strukturę tabeli notes jeśli istnieje
    try {
      const notesStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'notes'
        ORDER BY ordinal_position;
      `);
      
      if (notesStructure.rows.length > 0) {
        console.log('\n📝 Struktura tabeli "notes":');
        notesStructure.rows.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }
    } catch (err) {
      console.log('\n❌ Tabela "notes" nie istnieje');
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania tabel:', error);
  } finally {
    process.exit(0);
  }
}

checkTables();
