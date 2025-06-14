function TagBadge({ label }: { label: string }) {
  return (
    <span
      className="
    inline-flex items-center
    px-3 py-1
    rounded-md
    text-xs font-medium
    bg-sky-100 text-sky-700 border border-sky-300
    "
    >
      {label}
    </span>
  )
}
export default TagBadge
