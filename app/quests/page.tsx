import AppShell from "../../components/AppShell";
import QuestList from "../../components/QuestList";

export default function QuestsPage() {
  return (
    <AppShell title="Quests" subtitle="Track daily goals and completions">
      <QuestList />
    </AppShell>
  );
}
