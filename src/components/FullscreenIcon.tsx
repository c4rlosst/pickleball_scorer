export default function FullscreenIcon({
  active,
  className,
}: {
  active: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {active ? (
        <>
          <path d="M9 4v3a2 2 0 0 1-2 2H4" />
          <path d="M20 9h-3a2 2 0 0 1-2-2V4" />
          <path d="M15 20v-3a2 2 0 0 1 2-2h3" />
          <path d="M4 15h3a2 2 0 0 1 2 2v3" />
        </>
      ) : (
        <>
          <path d="M4 9V6a2 2 0 0 1 2-2h3" />
          <path d="M15 4h3a2 2 0 0 1 2 2v3" />
          <path d="M20 15v3a2 2 0 0 1-2 2h-3" />
          <path d="M9 20H6a2 2 0 0 1-2-2v-3" />
        </>
      )}
    </svg>
  )
}
