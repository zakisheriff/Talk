import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar.jsx';
import Chat from './Chat.jsx';
import './styles.css';
import { checkHealth } from './api';

import FaceLab from './FaceLab.jsx';
import WanAnalysis from './WanAnalysis.jsx';

function App() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'facelab', 'wan'

  // Poll backend health
  useEffect(() => {
    const check = async () => {
      const online = await checkHealth();
      setIsOnline(online);
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  // Save history whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  const handleNewChat = (view = 'chat') => {
    if (view === 'chat') {
      setMessages([]);
      setCurrentChatId(null);
    }
    setCurrentView(view);
  };

  const handleSelectChat = (index) => {
    const chat = history[index];
    if (chat) {
      setMessages(chat.messages || []);
      setCurrentChatId(index);
      setCurrentView('chat');
    }
  };

  // Save current chat to history when messages change
  useEffect(() => {
    if (currentView === 'chat' && messages.length > 0) {
      if (currentChatId === null) {
        // Create new chat entry
        const newChat = {
          title: messages[0].content.substring(0, 30) + "...",
          messages: messages,
          timestamp: new Date().toISOString()
        };
        const newHistory = [newChat, ...history];
        setHistory(newHistory);
        setCurrentChatId(0); // It's now the first item
      } else {
        // Update existing chat
        const updatedHistory = [...history];
        updatedHistory[currentChatId] = {
          ...updatedHistory[currentChatId],
          messages: messages
        };
        setHistory(updatedHistory);
      }
    }
  }, [messages, currentChatId, currentView]);

  return (
    <div className="app">
      <Sidebar
        history={history}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isOnline={isOnline}
      />
      {currentView === 'chat' && (
        <Chat
          messages={messages}
          setMessages={setMessages}
        />
      )}
      {currentView === 'facelab' && <FaceLab />}
      {currentView === 'wan' && <WanAnalysis />}
    </div>
  );
}

export default App;
