export default function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-[640px] mx-auto p-4 flex flex-col gap-4 text-neutral-300 text-[15px] leading-relaxed">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
      <p className="text-sm text-neutral-500">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <h2 className="text-lg font-semibold text-white mt-2">What this app does</h2>
      <p>
        PicklePoints keeps score for pickleball matches locally in your browser. It does not
        require an account, login, or any personal information to use.
      </p>

      <h2 className="text-lg font-semibold text-white mt-2">Live sync data</h2>
      <p>
        If you use the "Go live" feature, the current score, match settings, and any team or
        player names you've entered are sent to a Firebase Realtime Database and stored under a
        short, randomly generated room code so other devices can display the same score live.
        This data is not linked to your identity, isn't used for any purpose beyond displaying the
        live score, and is overwritten or cleared when you start a new game or stop sharing. Don't
        enter anything in the name fields you wouldn't want visible to anyone who has the room
        code.
      </p>

      <h2 className="text-lg font-semibold text-white mt-2">Advertising</h2>
      <p>
        This site may display ads served by Google AdSense. Google and its partners may use
        cookies or similar technologies to serve ads based on your prior visits to this or other
        websites. You can learn more about how Google uses data and manage your ad personalization
        settings at{' '}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 underline"
        >
          policies.google.com/technologies/partner-sites
        </a>{' '}
        and{' '}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:text-orange-300 underline"
        >
          adssettings.google.com
        </a>
        .
      </p>

      <h2 className="text-lg font-semibold text-white mt-2">Contact</h2>
      <p>
        Questions about this policy or the app in general can be sent to{' '}
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
