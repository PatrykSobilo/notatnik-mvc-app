import { initializeUsersSystem, createTestUser, assignExistingNotesToUser } from './db/init-users.js';

async function setupUsersSystem() {
  try {
    console.log('🚀 Konfiguracja systemu użytkowników...\n');
    
    // Inicjalizuj tabele i strukturę
    const success = await initializeUsersSystem();
    if (!success) {
      console.error('❌ Nie udało się zainicjalizować systemu użytkowników');
      process.exit(1);
    }
    
    // Utwórz testowego użytkownika
    const userId = await createTestUser();
    if (!userId) {
      console.error('❌ Nie udało się utworzyć testowego użytkownika');
      process.exit(1);
    }
    
    // Przypisz istniejące notatki do testowego użytkownika
    await assignExistingNotesToUser(userId);
    
    console.log('\n🎉 System użytkowników został skonfigurowany pomyślnie!');
    console.log('\n📋 Dane testowego użytkownika:');
    console.log('   Username: testuser');
    console.log('   Password: test123');
    console.log('   Email: test@example.com');
    
  } catch (error) {
    console.error('❌ Błąd podczas konfiguracji:', error);
  } finally {
    process.exit(0);
  }
}

setupUsersSystem();
