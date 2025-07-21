import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={className} style={{ lineHeight: '1.6' }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // 自定义代码块渲染
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return isInline ? (
              <code
                style={{
                  backgroundColor: 'rgba(175, 184, 193, 0.2)',
                  padding: '0.125rem 0.25rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.875em',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }}
                {...props}
              >
                {children}
              </code>
            ) : (
              <div style={{
                backgroundColor: '#f6f8fa',
                border: '1px solid #d1d9e0',
                borderRadius: '6px',
                margin: '1rem 0',
                overflow: 'hidden'
              }}>
                {match && (
                  <div style={{
                    backgroundColor: '#f1f3f4',
                    padding: '0.5rem 1rem',
                    borderBottom: '1px solid #d1d9e0',
                    fontSize: '0.75rem',
                    color: '#656d76',
                    fontWeight: '500'
                  }}>
                    {match[1]}
                  </div>
                )}
                <pre style={{
                  margin: '0',
                  padding: '1rem',
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  lineHeight: '1.45',
                  backgroundColor: 'transparent',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }}>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          
          // 自定义表格渲染
          table: ({ children }) => (
            <div style={{
              overflowX: 'auto',
              margin: '1rem 0',
              border: '1px solid #d1d9e0',
              borderRadius: '6px'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                {children}
              </table>
            </div>
          ),
          
          th: ({ children }) => (
            <th style={{
              padding: '0.75rem',
              textAlign: 'left',
              backgroundColor: '#f6f8fa',
              fontWeight: '600',
              borderBottom: '1px solid #d1d9e0'
            }}>
              {children}
            </th>
          ),
          
          td: ({ children }) => (
            <td style={{
              padding: '0.75rem',
              borderBottom: '1px solid #f1f3f4'
            }}>
              {children}
            </td>
          ),
          
          // 自定义列表渲染
          ul: ({ children }) => (
            <ul style={{
              paddingLeft: '1.5rem',
              margin: '0.5rem 0'
            }}>
              {children}
            </ul>
          ),
          
          ol: ({ children }) => (
            <ol style={{
              paddingLeft: '1.5rem',
              margin: '0.5rem 0'
            }}>
              {children}
            </ol>
          ),
          
          li: ({ children }) => (
            <li style={{
              marginBottom: '0.25rem'
            }}>
              {children}
            </li>
          ),
          
          // 自定义引用块渲染
          blockquote: ({ children }) => (
            <blockquote style={{
              borderLeft: '4px solid #d1d9e0',
              paddingLeft: '1rem',
              margin: '1rem 0',
              color: '#656d76',
              backgroundColor: '#f6f8fa',
              padding: '0.5rem 1rem',
              borderRadius: '0 6px 6px 0'
            }}>
              {children}
            </blockquote>
          ),
          
          // 自定义标题渲染
          h1: ({ children }) => (
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #d1d9e0'
            }}>
              {children}
            </h1>
          ),
          
          h2: ({ children }) => (
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
              paddingBottom: '0.25rem',
              borderBottom: '1px solid #f1f3f4'
            }}>
              {children}
            </h2>
          ),
          
          h3: ({ children }) => (
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              {children}
            </h3>
          ),
          
          h4: ({ children }) => (
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              {children}
            </h4>
          ),
          
          // 自定义段落渲染
          p: ({ children }) => (
            <p style={{
              margin: '0.5rem 0',
              lineHeight: '1.6'
            }}>
              {children}
            </p>
          ),
          
          // 自定义链接渲染
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#0366d6',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {children}
            </a>
          ),
          
          // 自定义强调渲染
          strong: ({ children }) => (
            <strong style={{
              fontWeight: '600'
            }}>
              {children}
            </strong>
          ),
          
          em: ({ children }) => (
            <em style={{
              fontStyle: 'italic'
            }}>
              {children}
            </em>
          ),
          
          // 自定义删除线渲染
          del: ({ children }) => (
            <del style={{
              textDecoration: 'line-through',
              color: '#656d76'
            }}>
              {children}
            </del>
          ),
          
          // 自定义水平线渲染
          hr: () => (
            <hr style={{
              border: 'none',
              borderTop: '1px solid #d1d9e0',
              margin: '1.5rem 0'
            }} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 