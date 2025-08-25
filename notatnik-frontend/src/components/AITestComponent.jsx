import React, { useState } from 'react';
import AIAPI from '../services/aiAPI';

function AITestComponent() {
  const [status, setStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [chatResult, setChatResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testStatus = async () => {
    setLoading(true);
    try {
      const result = await AIAPI.getStatus();
      setStatus(result);
      console.log('AI Status:', result);
    } catch (error) {
      setStatus({ error: error.message });
      console.error('Status Error:', error);
    }
    setLoading(false);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await AIAPI.testConnection();
      setTestResult(result);
      console.log('Test Result:', result);
    } catch (error) {
      setTestResult({ error: error.message });
      console.error('Test Error:', error);
    }
    setLoading(false);
  };

  const testChat = async () => {
    setLoading(true);
    try {
      const result = await AIAPI.sendMessage(
        'Problemy ze stresem',
        'Czuję się bardzo zestresowany w pracy i nie wiem jak sobie z tym poradzić',
        'Potrzebuję porady jak radzić sobie ze stresem'
      );
      setChatResult(result);
      console.log('Chat Result:', result);
    } catch (error) {
      setChatResult({ error: error.message });
      console.error('Chat Error:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #f5ba13', margin: '20px', borderRadius: '10px' }}>
      <h3>🧪 AI Test Component</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button onClick={testStatus} disabled={loading} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Test AI Status
        </button>
        <button onClick={testConnection} disabled={loading} style={{ marginRight: '10px', padding: '5px 10px' }}>
          Test Connection
        </button>
        <button onClick={testChat} disabled={loading} style={{ padding: '5px 10px' }}>
          Test Chat
        </button>
      </div>

      {loading && <p>⏳ Loading...</p>}

      {status && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h4>Status Result:</h4>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}

      {testResult && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7f3e7' }}>
          <h4>Test Result:</h4>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}

      {chatResult && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e7e7f3' }}>
          <h4>Chat Result:</h4>
          <pre>{JSON.stringify(chatResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default AITestComponent;
