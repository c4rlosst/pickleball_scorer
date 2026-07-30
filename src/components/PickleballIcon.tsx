export default function PickleballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <mask id="pickleball-holes">
        <rect width="100" height="100" fill="white" />
        {/* center + mid dots */}
        <circle cx="50" cy="49" r="9" fill="black" />
        <circle cx="35" cy="68" r="8" fill="black" />
        <circle cx="63" cy="66" r="8" fill="black" />
        {/* ring of oval holes, tangential to the rim */}
        <ellipse cx="50" cy="12" rx="11" ry="5.5" fill="black" transform="rotate(2 50 12)" />
        <ellipse cx="80" cy="22" rx="11" ry="5.5" fill="black" transform="rotate(45 80 22)" />
        <ellipse cx="90" cy="52" rx="11" ry="5.5" fill="black" transform="rotate(90 90 52)" />
        <ellipse cx="80" cy="80" rx="11" ry="5.5" fill="black" transform="rotate(135 80 80)" />
        <ellipse cx="49" cy="90" rx="11" ry="5.5" fill="black" transform="rotate(180 49 90)" />
        <ellipse cx="19" cy="80" rx="11" ry="5.5" fill="black" transform="rotate(-135 19 80)" />
        <ellipse cx="10" cy="49" rx="11" ry="5.5" fill="black" transform="rotate(90 10 49)" />
        <ellipse cx="20" cy="20" rx="11" ry="5.5" fill="black" transform="rotate(45 20 20)" />
      </mask>
      <circle cx="50" cy="50" r="47" fill="currentColor" mask="url(#pickleball-holes)" />
    </svg>
  )
}
