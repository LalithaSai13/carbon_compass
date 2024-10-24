import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return (
        <ReactMarkdown
            components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold my-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold my-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-medium my-2" {...props} />,
                p: ({ node, ...props }) => <p className="my-2 text-gray-700" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                em: ({ node, ...props }) => <em className="italic" {...props} />,
                // Add more components as needed
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
