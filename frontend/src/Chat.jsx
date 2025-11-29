import React, { useState, useRef, useEffect } from 'react';
import { chatStream, uploadFile } from './api';

const Chat = ({ messages, setMessages }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Create a placeholder for the assistant message
        const assistantMessage = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMessage]);

        let fullResponse = "";

        await chatStream(input, (chunk) => {
            fullResponse += chunk;
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'assistant') {
                    lastMsg.content = fullResponse;
                }
                return newMessages;
            });
        });

        setLoading(false);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const data = await uploadFile(file);
        setLoading(false);

        alert(data.message || "File uploaded!");
    };

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setLoading(true);
            const data = await uploadFile(file);
            setLoading(false);
            alert(data.message || "File uploaded!");
        }
    };

    return (
        <div
            className={`chat-container ${isDragging ? 'dragging-chat' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="drag-overlay">
                    <div className="drag-message">Drop file to upload</div>
                </div>
            )}
            <div className="messages-area">
                {messages.length === 0 && (
                    <div className="welcome-screen">
                        <h1>Talk</h1>
                        <p>Your private, local AI companion.</p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.role}`}>
                        <div className="message-avatar">
                            {msg.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className="message-content">
                            <div className="message-sender">
                                {msg.role === 'user' ? 'You' : 'Talk'}
                            </div>
                            <div className="message-text">
                                {msg.content}
                                {msg.role === 'assistant' && loading && index === messages.length - 1 && (
                                    <span className="cursor">|</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <form onSubmit={handleSubmit} className="input-form">
                    <button
                        type="button"
                        className="attach-btn"
                        onClick={() => fileInputRef.current.click()}
                    >
                        +
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Talk..."
                    />
                    <button type="submit" className="send-btn" disabled={loading || !input.trim()}>
                        ↑
                    </button>
                </form>
                <div className="disclaimer">
                    Talk can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
};

export default Chat;
