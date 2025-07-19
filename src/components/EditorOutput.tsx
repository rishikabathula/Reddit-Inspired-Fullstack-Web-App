'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { FC } from 'react'

const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  { ssr: false }
)

interface EditorOutputProps {
  content: any
}

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  console.log('EditorOutput content:', content)

  const blocks = content?.blocks

  if (!Array.isArray(blocks)) {
    console.error('Invalid content format:', content)
    return <p className="text-sm text-muted-foreground">No valid content available.</p>
  }

  const renderers = {
    image: CustomImageRenderer,
    table: CustomTableRenderer,
    header: CustomHeaderRenderer,
    list: CustomListRenderer,
    linkTool: CustomLinkRenderer,
    code: CustomCodeRenderer,
  }

  const style = {
    paragraph: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  }

  return (
    <Output style={style} className="text-sm" renderers={renderers} data={content}/>
  )
}

function CustomImageRenderer({ data }: any) {
  let src = data?.file?.url
  console.log('Image URL:', src)

  // Convert to absolute URL if it's relative
  if (src && !src.startsWith('http')) {
    src = `${process.env.NEXT_PUBLIC_SITE_URL}${src}`
  }

  if (!src || !src.startsWith('http')) {
    return <div className="text-sm text-red-500">Failed to load image.</div>
  }

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image
        alt="editor image"
        className="object-contain"
        fill
        src={src}
        sizes="(max-width: 768px) 100vw, 700px"
      />
    </div>
  )
}

function CustomTableRenderer({ data }: any) {
  return (
    <table className="table-auto border border-gray-400">
      <tbody>
        {data.content.map((row: string[], rowIndex: number) => (
          <tr key={rowIndex}>
            {row.map((cell: string, colIndex: number) => (
              <td key={colIndex} className="border border-gray-300 px-2 py-1 text-sm">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CustomHeaderRenderer({ data }: any) {
  const Tag = `h${data.level}` as keyof JSX.IntrinsicElements
  return <Tag className="font-bold my-2">{data.text}</Tag>
}

function CustomListRenderer({ data }: any) {
  if (data.style === 'ordered') {
    return (
      <ol className="list-decimal list-inside">
        {data.items.map((item: string, idx: number) => (
          <li key={idx}>{item}</li>
        ))}
      </ol>
    )
  }
  return (
    <ul className="list-disc list-inside">
      {data.items.map((item: string, idx: number) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  )
}

function CustomLinkRenderer({ data }: any) {
  return (
    <a href={data.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
      {data.meta?.title || data.link}
    </a>
  )
}

function CustomCodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-900 text-white p-3 rounded-md text-sm overflow-auto my-2">
      <code>{data.code}</code>
    </pre>
  )
}

export default EditorOutput
