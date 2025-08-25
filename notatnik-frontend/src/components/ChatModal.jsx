import React, { useState, useEffect, useRef } from 'react';
import AIAPI from '../services/aiAPI.js';

function ChatModal({ note, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll do dołu po dodaniu nowej wiadomości
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ładowanie historii czatu po otwarciu modala
  useEffect(() => {
    if (isOpen && note?.id) {
      loadChatHistory();
    }
  }, [isOpen, note?.id]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pobierz sesję dla tej notatki
      const sessionResponse = await AIAPI.request(`/ai/sessions/note/${note.id}`);
      
      if (sessionResponse.data) {
        setSessionId(sessionResponse.data.id);
        
        // Pobierz wiadomości z sesji
        const messagesResponse = await AIAPI.request(`/ai/sessions/${sessionResponse.data.id}/messages`);
        setMessages(messagesResponse.data || []);
      } else {
        // Brak sesji - zaczynamy od czystej rozmowy
        setMessages([]);
        setSessionId(null);
      }
    } catch (error) {
      console.error('Błąd ładowania historii czatu:', error);
      setError('Nie udało się załadować historii czatu');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !note) return;

    const userMessage = newMessage.trim();
    setNewMessage('');
    setLoading(true);
    setError(null);

    try {
      // Dodaj wiadomość użytkownika do UI
      const tempUserMessage = {
        id: Date.now(),
        sender: 'user',
        message: userMessage,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempUserMessage]);

      // Wyślij do API z zapisem w historii
      const response = await AIAPI.sendMessagePersistent(
        note.id,
        note.title,
        note.content,
        userMessage
      );

      // Dodaj odpowiedź AI do UI
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: response.response,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Zapisz session ID jeśli go nie mamy
      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

    } catch (error) {
      console.error('Błąd wysyłania wiadomości:', error);
      setError('Nie udało się wysłać wiadomości. Spróbuj ponownie.');
      
      // Usuń wiadomość użytkownika z UI w przypadku błędu
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    
    if (window.confirm('Czy na pewno chcesz usunąć całą historię rozmowy?')) {
      try {
        await AIAPI.request(`/ai/sessions/${sessionId}`, { method: 'DELETE' });
        setMessages([]);
        setSessionId(null);
        setError(null);
      } catch (error) {
        console.error('Błąd usuwania sesji:', error);
        setError('Nie udało się usunąć historii rozmowy');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-title">
            <h3>🧠 AI Coach</h3>
            <p>Rozmowa o: <strong>{note?.title}</strong></p>
          </div>
          <div className="chat-controls">
            {sessionId && (
              <button 
                onClick={clearChat}
                className="clear-chat-btn"
                title="Usuń historię rozmowy"
              >
                🗑️
              </button>
            )}
            <button 
              onClick={onClose}
              className="close-chat-btn"
              title="Zamknij czat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {loading && messages.length === 0 && (
            <div className="chat-loading">
              <p>⏳ Ładowanie historii rozmowy...</p>
            </div>
          )}

          {messages.length === 0 && !loading && (
            <div className="chat-welcome">
              <p>👋 Cześć! Jestem AI Coach, Twoim wsparciem psychologicznym.</p>
              <p>Przeczytałem Twoją notatkę "<strong>{note?.title}</strong>" i jestem gotów pomóc.</p>
              <p>Jak się czujesz? O czym chciałbyś porozmawiać?</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-content">
                <div className="message-text">{msg.message}</div>
                <div className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {loading && messages.length > 0 && (
            <div className="chat-message ai-message">
              <div className="message-content">
                <div className="message-text typing">
                  <span>AI Coach pisze</span>
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="chat-error">
            <p>❌ {error}</p>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Input Area */}
        <div className="chat-input-area">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Napisz swoją wiadomość... (Enter - wyślij, Shift+Enter - nowa linia)"
            disabled={loading}
            rows={3}
            className="chat-input"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !newMessage.trim()}
            className="send-message-btn"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatModal;
