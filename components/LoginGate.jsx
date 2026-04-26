export default function LoginGate() {
  return (
    <main className="flex flex-1 flex-col px-6 pb-10 pt-16 sm:pt-20">
      {/* Brand */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L4 14H20L12 3Z"
              fill="var(--accent)"
            />
            <path
              d="M12 11L8 17H16L12 11Z"
              fill="var(--accent)"
              opacity="0.5"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-white">
          Ascend
        </h1>
        <p className="mt-2 text-sm text-muted">
          Discipline is a team sport.
        </p>
      </div>

      {/* Auth actions */}
      <div className="space-y-2.5">
        <a
          href="/auth/login?screen_hint=signup"
          className="future-button block w-full px-4 py-3.5 text-center text-[15px]"
        >
          Get started
        </a>
        <a
          href="/auth/login"
          className="block w-full px-4 py-3.5 text-center text-[14px] font-medium text-muted transition hover:text-white"
        >
          I already have an account
        </a>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[11px] text-muted/70">
        By continuing you agree to our Terms and Privacy Policy
      </p>
    </main>
  );
}
