import AppShell from "../../components/AppShell";
import AvatarProfile from "../../components/AvatarProfile";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Player card • Neo 2070">
      <div className="space-y-4">
        <AvatarProfile />
        <a
          href="/auth/logout"
          className="future-button-ghost block w-full px-4 py-3 text-center text-sm font-medium"
        >
          Log Out
        </a>
      </div>
    </AppShell>
  );
}
