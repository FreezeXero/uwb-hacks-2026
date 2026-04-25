import AppShell from "../../components/AppShell";
import ChatbotInterface from "../../components/ChatbotInterface";

export default function ChatbotPage() {
  return (
    <AppShell title="Chatbot" subtitle="AI co-pilot for daily planning">
      <ChatbotInterface />
    </AppShell>
  );
}
