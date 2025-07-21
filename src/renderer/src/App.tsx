import React, { useState } from 'react';
import ModelManager from '@renderer/pages/ModelManager';
import ChatInterface from '@renderer/pages/ChatInterface';

type Page = 'model' | 'chat';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('model');

  const renderPage = () => {
    switch (currentPage) {
      case 'model':
        return <ModelManager />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <ModelManager />;
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* 导航栏 */}
      <nav style={{
        padding: 'clamp(0.75rem, 1.5vw, 1rem) clamp(1rem, 2vw, 1.5rem)',
        backgroundColor: '#1e293b',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🤖 MOSS AI助手
        </h1>
        <div style={{
          display: 'flex',
          gap: 'clamp(0.5rem, 1vw, 1rem)',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setCurrentPage('model')}
            style={{
              padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem)',
              backgroundColor: currentPage === 'model' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: currentPage === 'model' ? 'none' : '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 'clamp(0.8rem, 1.3vw, 0.9rem)',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              if (currentPage !== 'model') {
                e.currentTarget.style.backgroundColor = '#475569';
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== 'model') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            📁 模型管理
          </button>
          <button
            onClick={() => setCurrentPage('chat')}
            style={{
              padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 1.5vw, 1rem)',
              backgroundColor: currentPage === 'chat' ? '#3b82f6' : 'transparent',
              color: 'white',
              border: currentPage === 'chat' ? 'none' : '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 'clamp(0.8rem, 1.3vw, 0.9rem)',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              if (currentPage !== 'chat') {
                e.currentTarget.style.backgroundColor = '#475569';
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== 'chat') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            💬 AI 对话
          </button>
        </div>
      </nav>

      {/* 页面内容 */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto',
        backgroundColor: '#f8fafc'
      }}>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;