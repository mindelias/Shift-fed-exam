import { useState, useRef, useLayoutEffect } from 'react'

type Props = { text: string }

export function ExpandableText({ text }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const pRef = useRef<HTMLParagraphElement>(null)

  const clampStyle: React.CSSProperties = expanded
    ? {}
    : {
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }


  const checkOverflow = () => {
    const el = pRef.current
    if (!el) return

    const fullHeight = el.scrollHeight
    const visibleHeight = el.clientHeight
    setClamped(fullHeight - visibleHeight > 1)
  }

  useLayoutEffect(() => {

    requestAnimationFrame(checkOverflow)
    // Re-check whenever the viewport size changes
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [text])


  return (
    <>
      <p ref={pRef} style={clampStyle} className="text-sm text-sand-11 whitespace-pre-line mb-4">
        {text}
      </p>

      {clamped && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm text-sky-600 hover:underline"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </>
  )
}

