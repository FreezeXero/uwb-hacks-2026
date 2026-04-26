import AppShell from "../../components/AppShell";
import AvatarProfile from "../../components/AvatarProfile";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Player card and avatar">
      <AvatarProfile />
    </AppShell>
  );
}
