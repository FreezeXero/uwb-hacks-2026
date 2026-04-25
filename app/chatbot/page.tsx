import AppShell from "../../components/AppShell";

export default function ChatbotPage() {
  return (
    <AppShell title="Chatbot" subtitle="AI co-pilot for daily planning">
      <section className="space-y-3">
        <div className="future-panel rounded-2xl p-4">
          <p className="text-sm text-muted">🤖 Robot Coach</p>
          <p className="mt-1 text-base text-white">
            "Want me to set 3 realistic goals based on your schedule today?"
          </p>
        </div>
        <button type="button" className="future-button w-full px-4 py-3 text-sm">
          Sync Mission Plan
        </button>
      </section>
    </AppShell>
  );
}
