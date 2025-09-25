import React, { useEffect, useRef } from 'react'

interface SlashMenuProps {
  items: { label: string; command: (ctx: any) => void }[]
  command: (item: any) => void
}

export const SlashMenu: React.FC<SlashMenuProps> = ({ items, command }) => {
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus()
    }
  }, [items])

  if (!items.length) return null

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-2 w-56">
      {items.map((item, i) => (
        <button
          key={i}
          ref={i === 0 ? firstButtonRef : null}
          className="w-full text-left px-3 py-1.5 rounded-md hover:bg-gray-100 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => command(item)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

