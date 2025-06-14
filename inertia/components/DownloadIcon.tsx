import React from 'react'

export default function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* arrow */}
      <path d="M12 16l4-4h-3V4h-2v8H8l4 4z" />
      {/* bar */}
      <path d="M5 20h14v-2H5v2z" />
    </svg>
  )
}
