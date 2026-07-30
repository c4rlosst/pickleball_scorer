export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-[640px] mx-auto p-4 flex flex-col gap-4 text-neutral-300 text-[15px] leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-white">About PicklePoints</h1>

      <p>
        PicklePoints is a free, no-frills scorekeeping tool for pickleball games. It follows
        traditional side-out scoring rules for both singles and doubles, including the
        start-of-game exception in doubles and configurable win-by-two margins, so you don't have
        to keep score in your head or argue about whose serve it is.
      </p>

      <p>
        The app also supports live score sharing: one device (your phone, say) controls the score
        while any number of other devices — a tablet propped up courtside, a friend's phone — can
        watch the score update in real time by entering a short room code. No accounts, no
        sign-ups.
      </p>

      <p>
        This is an independent, small side project, not affiliated with any pickleball
        organization or governing body. If something looks wrong or you've got a feature request,
        feel free to reach out at{' '}
        <a
          href="mailto:carlosyminoza@gmail.com"
          className="text-orange-400 hover:text-orange-300 underline"
        >
          carlosyminoza@gmail.com
        </a>
        .
      </p>
    </div>
  )
}
