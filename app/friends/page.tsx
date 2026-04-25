import AppShell from "../../components/AppShell";
import FriendsLeaderboard from "../../components/FriendsLeaderboard";

export default function FriendsPage() {
  return (
    <AppShell title="Friends" subtitle="Climb the ladder together">
      <FriendsLeaderboard />
    </AppShell>
  );
}
