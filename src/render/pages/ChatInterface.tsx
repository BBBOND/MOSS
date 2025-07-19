import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from '@/render/components/MarkdownRenderer';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  stats?: ChatStats;
}

interface ChatStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  timeTaken: number;
  tokensPerSecond: number;
}

interface SessionStats {
  totalMessages: number;
  totalTokens: number;
  totalTime: number;
  averageTokensPerSecond: number;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelStatus, setModelStatus] = useState({
    isLoaded: false,
    modelPath: undefined as string | undefined
  });
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalMessages: 0,
    totalTokens: 0,
    totalTime: 0,
    averageTokensPerSecond: 0
  });
  const [showStats, setShowStats] = useState(false);
  const [enableMarkdown, setEnableMarkdown] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 格式化耗时
  const formatTime = (ms: number) => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else {
      return `${(ms / 1000).toFixed(1)}s`;
    }
  };

  // 格式化token数
  const formatTokens = (tokens: number) => {
    if (tokens < 1000) {
      return tokens.toString();
    } else {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
  };

  // 更新会话统计
  const updateSessionStats = (stats: ChatStats) => {
    setSessionStats(prev => {
      const newTotalMessages = prev.totalMessages + 1;
      const newTotalTokens = prev.totalTokens + stats.totalTokens;
      const newTotalTime = prev.totalTime + stats.timeTaken;
      const newAverageTokensPerSecond = newTotalTokens / (newTotalTime / 1000);

      return {
        totalMessages: newTotalMessages,
        totalTokens: newTotalTokens,
        totalTime: newTotalTime,
        averageTokensPerSecond: parseFloat(newAverageTokensPerSecond.toFixed(2))
      };
    });
  };

  // 加载模型状态
  const loadModelStatus = async () => {
    try {
      const status = await window.electronAPI.model.getModelStatus();
      setModelStatus({
        isLoaded: status.isLoaded,
        modelPath: status.modelPath
      });
    } catch (error) {
      console.error('加载模型状态失败:', error);
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !modelStatus.isLoaded) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const result = await window.electronAPI.model.chatWithModel(userMessage.content);
      
      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.response,
          timestamp: new Date(),
          stats: result.stats
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // 更新会话统计
        if (result.stats) {
          updateSessionStats(result.stats);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `错误: ${result.error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '发送消息时发生错误，请稍后重试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
    setSessionStats({
      totalMessages: 0,
      totalTokens: 0,
      totalTime: 0,
      averageTokensPerSecond: 0
    });
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间戳
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 渲染消息内容
  const renderMessageContent = (message: Message) => {
    if (message.type === 'assistant' && enableMarkdown) {
      return <MarkdownRenderer content={message.content} />;
    } else {
      return (
        <div style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {message.content}
        </div>
      );
    }
  };

  useEffect(() => {
    loadModelStatus();
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 定期检查模型状态
    const interval = setInterval(loadModelStatus, 5000);
    
    // 监听生成事件
    window.electronAPI.model.onChatGenerationStart(() => {
      setIsGenerating(true);
    });

    window.electronAPI.model.onChatGenerationComplete((stats) => {
      setIsGenerating(false);
    });

    window.electronAPI.model.onChatGenerationError(() => {
      setIsGenerating(false);
    });

    return () => {
      clearInterval(interval);
      window.electronAPI.model.removeChatEventListeners();
    };
  }, []);

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      overflow: 'hidden'
    }}>
      {/* 头部 */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        flex: '0 0 auto',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <h1 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: 'clamp(1.5rem, 4vw, 2rem)'
            }}>
              💬 与 MOSS 对话
            </h1>
            <div style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', 
              color: '#666',
              wordBreak: 'break-word',
              lineHeight: '1.4'
            }}>
              {modelStatus.isLoaded ? (
                <span style={{ color: '#4caf50' }}>
                  ✓ 模型已加载: {modelStatus.modelPath}
                </span>
              ) : (
                <span style={{ color: '#f44336' }}>
                  ✗ 未加载模型，请先到模型管理页面加载模型
                </span>
              )}
            </div>
          </div>
          
          {/* 统计面板 */}
          {sessionStats.totalMessages > 0 && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f0f9ff',
              border: '1px solid #e0f2fe',
              borderRadius: '10px',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              minWidth: '220px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => setShowStats(!showStats)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                color: '#0f766e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 会话统计 <span style={{ fontSize: '0.8em' }}>{showStats ? '▼' : '▶'}</span>
              </div>
              <div style={{ color: '#374151', lineHeight: '1.4' }}>
                💬 消息: {sessionStats.totalMessages} | 🎯 Token: {formatTokens(sessionStats.totalTokens)}
              </div>
              {showStats && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  color: '#4b5563',
                  borderTop: '1px solid #bfdbfe',
                  paddingTop: '0.75rem',
                  lineHeight: '1.5'
                }}>
                  <div>⏱️ 总耗时: {formatTime(sessionStats.totalTime)}</div>
                  <div>🚀 平均速度: {sessionStats.averageTokensPerSecond.toFixed(1)} tokens/s</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleClearChat}
            disabled={messages.length === 0}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: messages.length === 0 ? '#d1d5db' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: messages.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }
            }}
            onMouseOut={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }
            }}
          >
            🗑️ 清空对话
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: showStats ? '#3b82f6' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = showStats ? '#2563eb' : '#4b5563';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = showStats ? '#3b82f6' : '#6b7280';
            }}
          >
            📊 {showStats ? '隐藏' : '显示'}统计
          </button>

          <button
            onClick={() => setEnableMarkdown(!enableMarkdown)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: enableMarkdown ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = enableMarkdown ? '#059669' : '#4b5563';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = enableMarkdown ? '#10b981' : '#6b7280';
            }}
          >
            📝 Markdown {enableMarkdown ? '开' : '关'}
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div style={{
        flex: '1 1 0',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        overflowY: 'auto',
        minHeight: '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            marginTop: '2rem',
            padding: '1rem'
          }}>
            <p style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              margin: '0 0 0.5rem 0'
            }}>
              开始与 AI 对话吧！
            </p>
            <p style={{ 
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              margin: '0 0 0.5rem 0'
            }}>
              {modelStatus.isLoaded ? '输入消息并按回车发送' : '请先加载模型'}
            </p>
            <div style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              color: '#999',
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#f0f7ff',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>💡 支持的 Markdown 格式：</p>
              <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                <li>**粗体文本** 和 *斜体文本*</li>
                <li>`代码片段` 和 ```代码块```</li>
                <li>### 标题 和 &gt; 引用</li>
                <li>- 列表项 和 1. 编号列表</li>
                <li>| 表格 | 格式 |</li>
                <li>[链接](URL) 和 ~~删除线~~</li>
              </ul>
            </div>
          </div>
                ) : (
          <div style={{ flex: '1 1 auto', overflow: 'visible' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: 'min(70%, 600px)',
                  borderRadius: '12px',
                  backgroundColor: message.type === 'user' ? '#3b82f6' : '#ffffff',
                  color: message.type === 'user' ? 'white' : '#1f2937',
                  border: message.type === 'assistant' ? '1px solid #e5e7eb' : 'none',
                  overflow: 'hidden',
                  boxShadow: message.type === 'assistant' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{
                    padding: '0.875rem 1rem',
                    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                    lineHeight: '1.5'
                  }}>
                    {renderMessageContent(message)}
                  </div>
                  
                  {/* 消息底部信息 */}
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderTop: message.type === 'assistant' ? '1px solid #f3f4f6' : '1px solid rgba(255,255,255,0.2)',
                    fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                    opacity: 0.8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    
                    {/* AI消息的统计信息 */}
                    {message.type === 'assistant' && message.stats && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        flexWrap: 'wrap',
                        fontSize: 'clamp(0.65rem, 1.6vw, 0.75rem)'
                      }}>
                        <span title="总Token数">
                          📊 {formatTokens(message.stats.totalTokens)}
                        </span>
                        <span title="耗时">
                          ⏱️ {formatTime(message.stats.timeTaken)}
                        </span>
                        <span title="生成速度">
                          🚀 {message.stats.tokensPerSecond.toFixed(1)}/s
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(isLoading || isGenerating) && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '1rem'
          }}>
            <div style={{
              padding: '0.875rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>🤖 MOSS 正在思考中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        flex: '0 0 auto',
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          alignItems: 'flex-end',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={modelStatus.isLoaded ? "输入消息... (Shift+Enter 换行，Enter 发送)" : "请先加载模型"}
            disabled={!modelStatus.isLoaded || isLoading}
            style={{
              flex: 1,
              padding: '0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              resize: 'vertical',
              minHeight: '48px',
              maxHeight: '120px',
              fontFamily: 'inherit',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              lineHeight: '1.5',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !modelStatus.isLoaded}
            style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: !inputMessage.trim() || isLoading || !modelStatus.isLoaded ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !inputMessage.trim() || isLoading || !modelStatus.isLoaded ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
              minHeight: '48px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              if (!(!inputMessage.trim() || isLoading || !modelStatus.isLoaded)) {
                e.currentTarget.style.backgroundColor = '#059669';
              }
            }}
            onMouseOut={(e) => {
              if (!(!inputMessage.trim() || isLoading || !modelStatus.isLoaded)) {
                e.currentTarget.style.backgroundColor = '#10b981';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                发送中...
              </>
            ) : (
              <>
                ✈️ 发送
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* CSS动画 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatInterface; 