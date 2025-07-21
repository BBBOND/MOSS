import React, { useState, useEffect } from 'react';

interface ModelFile {
  name: string;
  path: string;
  size: number;
  directory?: string;
}

interface ModelStatus {
  isLoading: boolean;
  isLoaded: boolean;
  modelPath?: string;
  error?: string;
}

interface LoadingProgress {
  stage: string;
  progress: number;
}

const ModelManager: React.FC = () => {
  const [models, setModels] = useState<ModelFile[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelFile | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    isLoading: false,
    isLoaded: false
  });
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [modelsDirectory, setModelsDirectory] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 获取模型状态
  const fetchModelStatus = async () => {
    try {
      const status = await window.moss.model.getModelStatus();
      setModelStatus(status);
    } catch (error) {
      console.error('获取模型状态失败:', error);
    }
  };

  // 获取可用模型列表
  const fetchModels = async () => {
    setIsRefreshing(true);
    try {
      const modelList = await window.moss.model.getAvailableModels();
      setModels(modelList);
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 获取模型目录路径
  const fetchModelsDirectory = async () => {
    try {
      const directory = await window.moss.model.getModelsDirectory();
      setModelsDirectory(directory);
    } catch (error) {
      console.error('获取模型目录失败:', error);
    }
  };

  // 初始化
  useEffect(() => {
    fetchModels();
    fetchModelStatus();
    fetchModelsDirectory();

    // 监听模型加载进度
    window.moss.model.onModelLoadingProgress((progress) => {
      setLoadingProgress(progress);
    });

    return () => {
      window.moss.model.removeModelLoadingProgressListener();
    };
  }, []);

  // 选择模型文件
  const handleSelectModelFile = async () => {
    try {
      const result = await window.moss.model.selectModelFile();
      
      if (result.success && result.file) {
        // 将选中的文件设置为当前选中的模型
        setSelectedModel(result.file);
        console.log('选择的模型文件:', result.file);
      } else if (!result.cancelled && result.error) {
        alert(`选择文件失败: ${result.error}`);
      }
    } catch (error) {
      console.error('选择模型文件失败:', error);
      alert('选择模型文件时发生错误');
    }
  };

  // 加载模型
  const handleLoadModel = async (modelPath: string) => {
    try {
      setLoadingProgress({ stage: '准备加载...', progress: 0 });
      const result = await window.moss.model.loadModel(modelPath);
      
      if (result.success) {
        await fetchModelStatus();
        setLoadingProgress(null);
        alert('模型加载成功！');
      } else {
        setLoadingProgress(null);
        alert(`模型加载失败: ${result.error}`);
      }
    } catch (error) {
      setLoadingProgress(null);
      console.error('加载模型失败:', error);
      alert('加载模型时发生错误');
    }
  };

  // 卸载模型
  const handleUnloadModel = async () => {
    try {
      const result = await window.moss.model.unloadModel();
      if (result.success) {
        await fetchModelStatus();
        setSelectedModel(null);
        alert('模型卸载成功！');
      } else {
        alert(`模型卸载失败: ${result.error}`);
      }
    } catch (error) {
      console.error('卸载模型失败:', error);
      alert('卸载模型时发生错误');
    }
  };

  // 打开模型目录
  const handleOpenModelsDirectory = async () => {
    if (modelsDirectory) {
      try {
        const result = await window.moss.model.openDirectory(modelsDirectory);
        if (!result.success) {
          alert(`打开目录失败: ${result.error}\n\n目录路径: ${modelsDirectory}\n\n请手动打开此目录并将 .gguf 文件放入其中。`);
        }
      } catch (error) {
        console.error('打开目录失败:', error);
        alert(`默认模型目录路径: ${modelsDirectory}\n\n请手动打开此目录并将 .gguf 文件放入其中。`);
      }
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{
      padding: 'clamp(1rem, 2.5vw, 2rem)',
      height: '100%',
      backgroundColor: '#f8fafc',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(1rem, 2vw, 2rem)',
        height: '100%',
      }}>
        {/* 页面标题 */}
        <header style={{
          textAlign: 'center',
          marginBottom: 'clamp(1rem, 2vw, 2rem)',
        }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: '0 0 0.5rem 0',
          }}>
            🤖 MOSS 模型管理
          </h1>
          <p style={{
            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            color: '#64748b',
            margin: 0,
          }}>
            加载和管理本地 AI 模型
          </p>
        </header>

        {/* 模型状态卡片 */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 1rem 0',
          }}>
            📊 模型状态
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              padding: '0.75rem',
              backgroundColor: modelStatus.isLoaded ? '#dcfce7' : '#fef3c7',
              borderRadius: '8px',
              border: `1px solid ${modelStatus.isLoaded ? '#bbf7d0' : '#fed7aa'}`,
            }}>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                color: '#6b7280',
                marginBottom: '0.25rem',
              }}>
                状态
              </div>
              <div style={{
                fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                fontWeight: '600',
                color: modelStatus.isLoaded ? '#166534' : '#92400e',
              }}>
                {modelStatus.isLoading ? '🔄 加载中...' : 
                 modelStatus.isLoaded ? '✅ 已加载' : '⭕ 未加载'}
              </div>
            </div>

            {modelStatus.modelPath && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #dbeafe',
              }}>
                <div style={{
                  fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                  color: '#6b7280',
                  marginBottom: '0.25rem',
                }}>
                  当前模型
                </div>
                <div style={{
                  fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                  fontWeight: '600',
                  color: '#1d4ed8',
                  wordBreak: 'break-all',
                }}>
                  {modelStatus.modelPath.split('/').pop() || modelStatus.modelPath}
                </div>
              </div>
            )}
          </div>

          {/* 加载进度 */}
          {loadingProgress && (
            <div style={{
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
            }}>
              <div style={{
                fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                color: '#475569',
                marginBottom: '0.5rem',
              }}>
                {loadingProgress.stage}
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${loadingProgress.progress}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{
                fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                color: '#64748b',
                textAlign: 'right',
                marginTop: '0.25rem',
              }}>
                {loadingProgress.progress}%
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            {modelStatus.isLoaded && (
              <button
                onClick={handleUnloadModel}
                disabled={modelStatus.isLoading}
                style={{
                  padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: modelStatus.isLoading ? 0.6 : 1,
                }}
                onMouseOver={(e) => {
                  if (!modelStatus.isLoading) {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                  }
                }}
                onMouseOut={(e) => {
                  if (!modelStatus.isLoading) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
              >
                🗑️ 卸载模型
              </button>
            )}
          </div>
        </section>

        {/* 模型选择方式 */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 1rem 0',
          }}>
            🎯 选择模型
          </h2>

          {/* 方式一：从默认目录选择 */}
          <div style={{
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <h3 style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.125rem)',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 0.75rem 0',
            }}>
              📂 方式一：从默认目录选择
            </h3>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              alignItems: 'center',
            }}>
              <button
                onClick={fetchModels}
                disabled={isRefreshing}
                style={{
                  padding: 'clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem)',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isRefreshing ? 0.6 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isRefreshing) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isRefreshing) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {isRefreshing ? '🔄 刷新中...' : '🔄 刷新列表'}
              </button>

              <button
                onClick={handleOpenModelsDirectory}
                style={{
                  padding: 'clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem)',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#059669';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#10b981';
                }}
              >
                📁 打开模型目录
              </button>
            </div>

            {modelsDirectory && (
              <div style={{
                fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                color: '#6b7280',
                marginBottom: '1rem',
                padding: '0.5rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                wordBreak: 'break-all',
              }}>
                📍 默认目录: {modelsDirectory}
              </div>
            )}

            {/* 模型列表 */}
            {models.length > 0 ? (
              <div style={{
                display: 'grid',
                gap: '0.75rem',
              }}>
                {models.map((model, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{
                        fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '0.25rem',
                        wordBreak: 'break-all',
                      }}>
                        {model.name}
                      </div>
                      <div style={{
                        fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                        color: '#6b7280',
                      }}>
                        大小: {formatFileSize(model.size)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleLoadModel(model.path)}
                      disabled={modelStatus.isLoading || modelStatus.isLoaded}
                      style={{
                        padding: 'clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem)',
                        backgroundColor: modelStatus.isLoading || modelStatus.isLoaded ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                        fontWeight: '500',
                        cursor: modelStatus.isLoading || modelStatus.isLoaded ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                      onMouseOver={(e) => {
                        if (!modelStatus.isLoading && !modelStatus.isLoaded) {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!modelStatus.isLoading && !modelStatus.isLoaded) {
                          e.currentTarget.style.backgroundColor = '#3b82f6';
                        }
                      }}
                    >
                      🚀 加载
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  fontSize: 'clamp(1rem, 1.6vw, 1.125rem)',
                  marginBottom: '0.5rem',
                }}>
                  📁 默认目录中没有找到模型文件
                </div>
                <div style={{
                  fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                }}>
                  请将 .gguf 格式的模型文件放入默认目录 (~/.moss/models) 中
                </div>
              </div>
            )}
          </div>

          {/* 方式二：手动选择文件 */}
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}>
            <h3 style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.125rem)',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 0.75rem 0',
            }}>
              🎯 方式二：手动选择文件
            </h3>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              marginBottom: selectedModel ? '1rem' : '0',
            }}>
              <button
                onClick={handleSelectModelFile}
                style={{
                  padding: 'clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem)',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#8b5cf6';
                }}
              >
                📂 选择模型文件
              </button>
            </div>

            {/* 选中的文件信息 */}
            {selectedModel && (
              <div style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{
                      fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '0.25rem',
                      wordBreak: 'break-all',
                    }}>
                      {selectedModel.name}
                    </div>
                    <div style={{
                      fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}>
                      大小: {formatFileSize(selectedModel.size)}
                    </div>
                    {selectedModel.directory && (
                      <div style={{
                        fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)',
                        color: '#6b7280',
                        wordBreak: 'break-all',
                      }}>
                        路径: {selectedModel.directory}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleLoadModel(selectedModel.path)}
                    disabled={modelStatus.isLoading || modelStatus.isLoaded}
                    style={{
                      padding: 'clamp(0.5rem, 1vw, 0.625rem) clamp(1rem, 2vw, 1.25rem)',
                      backgroundColor: modelStatus.isLoading || modelStatus.isLoaded ? '#9ca3af' : '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: 'clamp(0.8rem, 1.3vw, 0.875rem)',
                      fontWeight: '500',
                      cursor: modelStatus.isLoading || modelStatus.isLoaded ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseOver={(e) => {
                      if (!modelStatus.isLoading && !modelStatus.isLoaded) {
                        e.currentTarget.style.backgroundColor = '#7c3aed';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!modelStatus.isLoading && !modelStatus.isLoaded) {
                        e.currentTarget.style.backgroundColor = '#8b5cf6';
                      }
                    }}
                  >
                    🚀 加载选中文件
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 使用说明 */}
        <section style={{
          backgroundColor: '#fefce8',
          borderRadius: '12px',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          border: '1px solid #fde047',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
            fontWeight: '600',
            color: '#92400e',
            margin: '0 0 1rem 0',
          }}>
            💡 使用说明
          </h2>
          <div style={{
            fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
            color: '#92400e',
            lineHeight: '1.6',
          }}>
            <p style={{ margin: '0 0 0.75rem 0' }}>
              <strong>方式一（推荐）：</strong>将 .gguf 格式的模型文件放入默认目录 (~/.moss/models)，然后从列表中选择加载
            </p>
            <p style={{ margin: '0 0 0.75rem 0' }}>
              <strong>方式二：</strong>使用文件选择器手动选择任意位置的模型文件
            </p>
            <p style={{ margin: 0 }}>
              <strong>支持格式：</strong>.gguf 和 .bin 格式的模型文件
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ModelManager; 