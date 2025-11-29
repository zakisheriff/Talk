import React, { useState, useRef, useEffect } from 'react';
import { chatStream, uploadFile } from './api';
import { FileText, Image as ImageIcon, User, Bot, Paperclip, Send, X, ArrowUp } from 'lucide-react';

const Chat = ({ messages, setMessages }) => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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
        if (!input.trim() && !selectedFile) return;

        const fileToUpload = selectedFile; // Capture reference
        const messageText = input;

        setLoading(true);
        setInput('');
        setSelectedFile(null);

        // 1. Optimistic UI Update
        let fileDataForUI = null;
        if (fileToUpload) {
            fileDataForUI = {
                name: fileToUpload.name,
                type: fileToUpload.type,
                url: URL.createObjectURL(fileToUpload),
                uploading: true
            };
        }

        const userMessage = {
            role: 'user',
            content: messageText,
            file: fileDataForUI
        };

        setMessages(prev => [...prev, userMessage]);

        // 2. Upload in Background
        let finalFileData = null;
        if (fileToUpload) {
            try {
                const data = await uploadFile(fileToUpload);
                finalFileData = {
                    ...fileDataForUI,
                    server_path: data.file_path,
                    uploading: false
                };

                // Update the message in UI to remove "Uploading..." status
                setMessages(prev => prev.map(msg =>
                    msg === userMessage ? { ...msg, file: finalFileData } : msg
                ));
            } catch (error) {
                alert("Failed to upload file.");
                setLoading(false);
                return;
            }
        }

        // 3. Create Placeholder for Assistant
        const assistantMessage = { role: 'assistant', content: '' };
        setMessages(prev => [...prev, assistantMessage]);

        // 4. Send Chat Request
        let fullResponse = "";
        const historyItem = {
            role: 'user',
            content: messageText,
            file: finalFileData
        };

        const history = [...messages, historyItem];
        const messageToSend = messageText.trim() || (finalFileData ? `I have uploaded ${finalFileData.name}. Analyze it.` : '');

        await chatStream(messageToSend, history, (chunk) => {
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

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
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

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
                    <div className="drag-message">Drop file to attach</div>
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
                            {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div className="message-content">
                            <div className="message-sender">
                                {msg.role === 'user' ? 'You' : 'Talk'}
                            </div>

                            {/* Render File Attachment if exists */}
                            {msg.file && (
                                <div className="message-attachment">
                                    <div className="attachment-icon">
                                        {msg.file.type.includes('pdf') ? <FileText size={24} /> : <ImageIcon size={24} />}
                                    </div>
                                    <div className="attachment-info">
                                        <div className="attachment-name">{msg.file.name}</div>
                                        <div className="attachment-type">
                                            {msg.file.uploading ? (
                                                <span className="uploading-text">Uploading...</span>
                                            ) : (
                                                msg.file.type.includes('pdf') ? 'PDF Document' : 'Image'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="message-text">
                                {msg.content}
                                {msg.role === 'assistant' && loading && index === messages.length - 1 && (
                                    <span className="cursor-ball"></span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <form onSubmit={handleSubmit} className="input-form">
                    {selectedFile && (
                        <div className="file-preview-pill">
                            <span className="file-icon">
                                {selectedFile.type.includes('pdf') ? <FileText size={16} /> : <ImageIcon size={16} />}
                            </span>
                            <span className="file-name">{selectedFile.name}</span>
                            <button type="button" className="remove-file-btn" onClick={removeSelectedFile}>
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        className="attach-btn"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Talk..."
                    />
                    <button type="submit" className="send-btn" disabled={loading || (!input.trim() && !selectedFile)}>
                        <ArrowUp size={20} />
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
