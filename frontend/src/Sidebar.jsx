import React from 'react';
import { MessageSquarePlus, History, Activity, ScanFace, Search } from 'lucide-react';

const Sidebar = ({ history, onSelectChat, onNewChat, isOnline }) => {
    return (
        <div className="sidebar">
            <button className="new-chat-btn" onClick={() => onNewChat('chat')}>
                <MessageSquarePlus size={18} style={{ marginRight: '8px' }} />
                New chat
            </button>

            <div className="tools-section">
                <div className="tool-item" onClick={() => onNewChat('facelab')}>
                    <ScanFace size={18} style={{ marginRight: '8px' }} />
                    Face Lab
                </div>
                <div className="tool-item" onClick={() => onNewChat('wan')}>
                    <Search size={18} style={{ marginRight: '8px' }} />
                    WAN Analysis
                </div>
            </div>

            <div className="history-list">
                {history.map((chat, index) => (
                    <div
                        key={index}
                        className="history-item"
                        onClick={() => onSelectChat(index)}
                    >
                        <History size={14} style={{ marginRight: '8px', opacity: 0.7 }} />
                        {chat.title}
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                    <Activity size={14} style={{ marginRight: '6px' }} />
                    {isOnline ? 'System Online' : 'System Offline'}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
