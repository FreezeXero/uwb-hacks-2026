import AppShell from "../../components/AppShell";

export default function ChatPage() {
  return (
    <AppShell title="Chat" subtitle="Realtime squad comms">
      <section className="space-y-3">
        <article className="future-panel rounded-2xl p-4">
          <p className="text-sm text-muted">💬 Maya</p>
          <p className="mt-1 text-white">I just hit a 12-day streak 🔥</p>
        </article>
        <article className="future-panel rounded-2xl p-4">
          <p className="text-sm text-muted">💬 You</p>
          <p className="mt-1 text-white">Let&apos;s go! I&apos;m pushing for 10 days.</p>
        </article>
        <button type="button" className="future-button w-full px-4 py-3 text-sm">
          New Message
        </button>
      </section>
    </AppShell>
  );
}
