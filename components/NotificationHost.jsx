"use client";

import { useAppState } from "./AppStateProvider";
import PushNotificationBanner from "./PushNotificationBanner";

export default function NotificationHost() {
  const { activeNotification, dismissNotification } = useAppState();

  return (
    <PushNotificationBanner
      notification={activeNotification}
      onDismiss={dismissNotification}
    />
  );
}
