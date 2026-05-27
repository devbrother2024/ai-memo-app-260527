'use client'

import Markdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
  className?: string
}

/** react-markdown hast node를 DOM에 전달하지 않도록 제거하는 헬퍼 */
function strip<T extends { node?: unknown }>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node: _,
  ...rest
}: T): Omit<T, 'node'> {
  return rest as Omit<T, 'node'>
}

const mdComponents: Components = {
  h1: (p) => (
    <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900" {...strip(p)} />
  ),
  h2: (p) => (
    <h2 className="text-xl font-bold mt-4 mb-2 text-gray-900" {...strip(p)} />
  ),
  h3: (p) => (
    <h3 className="text-lg font-semibold mt-3 mb-2 text-gray-900" {...strip(p)} />
  ),
  p: (p) => <p className="my-2 leading-relaxed" {...strip(p)} />,
  ul: (p) => <ul className="list-disc pl-5 my-2 space-y-1" {...strip(p)} />,
  ol: (p) => <ol className="list-decimal pl-5 my-2 space-y-1" {...strip(p)} />,
  li: (p) => <li className="leading-relaxed" {...strip(p)} />,
  a: ({ href, ...rest }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
      {...strip(rest)}
    />
  ),
  blockquote: (p) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-3 my-2 italic text-gray-600"
      {...strip(p)}
    />
  ),
  code: ({ className, children, ...rest }) => {
    const isBlock = /language-/.test(className ?? '')
    return isBlock ? (
      <code
        className="block bg-gray-900 text-gray-100 rounded-md p-3 text-xs overflow-x-auto"
        {...strip(rest)}
      >
        {children}
      </code>
    ) : (
      <code
        className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-xs"
        {...strip(rest)}
      >
        {children}
      </code>
    )
  },
  pre: (p) => <pre className="my-3" {...strip(p)} />,
  table: (p) => (
    <table
      className="my-3 w-full text-xs border border-gray-200"
      {...strip(p)}
    />
  ),
  th: (p) => (
    <th
      className="border border-gray-200 px-2 py-1 bg-gray-50 text-left"
      {...strip(p)}
    />
  ),
  td: (p) => <td className="border border-gray-200 px-2 py-1" {...strip(p)} />,
  hr: () => <hr className="my-4 border-gray-200" />,
  input: (p) => <input {...strip(p)} disabled className="mr-1 align-middle" />,
}

export default function MarkdownContent({
  content,
  className = '',
}: MarkdownContentProps) {
  return (
    <div className={`text-gray-700 text-sm leading-relaxed ${className}`}>
      <Markdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </Markdown>
    </div>
  )
}
