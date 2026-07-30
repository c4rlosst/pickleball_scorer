export default function PickleballIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* handle */}
      <rect x="38" y="52" width="14" height="30" rx="6" fill="#8a5a2b" />
      {/* paddle face */}
      <rect x="16" y="6" width="56" height="60" rx="26" fill="#2b2b2b" stroke="#6b6b6b" strokeWidth="3" />
      {/* ball */}
      <circle cx="70" cy="72" r="20" fill="#ffe600" stroke="#d9c400" strokeWidth="2" />
      <circle cx="62" cy="64" r="2.2" fill="#d9c400" />
      <circle cx="72" cy="60" r="2.2" fill="#d9c400" />
      <circle cx="80" cy="68" r="2.2" fill="#d9c400" />
      <circle cx="78" cy="80" r="2.2" fill="#d9c400" />
      <circle cx="66" cy="82" r="2.2" fill="#d9c400" />
      <circle cx="60" cy="74" r="2.2" fill="#d9c400" />
      <circle cx="70" cy="72" r="2.2" fill="#d9c400" />
    </svg>
  )
}
