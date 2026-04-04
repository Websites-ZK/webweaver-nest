import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PresenceSession {
  user_id: string;
  page: string;
  joined_at: string;
}

const CHANNEL_NAME = "online-users";

let presenceChannel: RealtimeChannel | null = null;
let presenceKey: string | null = null;
let isSubscribed = false;
let currentPresence: PresenceSession | null = null;
let sessions: PresenceSession[] = [];

const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const setSessions = (nextSessions: PresenceSession[]) => {
  sessions = nextSessions;
  notifyListeners();
};

const readSessionsFromChannel = () => {
  if (!presenceChannel) {
    setSessions([]);
    return;
  }

  const state = presenceChannel.presenceState<PresenceSession>();
  const nextSessions = Object.values(state).flatMap((presences) =>
    presences.map((presence) => ({
      user_id: presence.user_id,
      page: presence.page,
      joined_at: presence.joined_at,
    })),
  );

  setSessions(nextSessions);
};

const resetPresenceChannel = () => {
  if (presenceChannel) {
    supabase.removeChannel(presenceChannel);
  }

  presenceChannel = null;
  presenceKey = null;
  isSubscribed = false;
  currentPresence = null;
  setSessions([]);
};

const trackCurrentPresence = async () => {
  if (!presenceChannel || !currentPresence || !isSubscribed) return;

  try {
    await presenceChannel.track(currentPresence);
  } catch (error) {
    console.error("Failed to track presence:", error);
  }
};

const ensurePresenceChannel = (nextPresenceKey: string) => {
  if (presenceChannel && presenceKey === nextPresenceKey) {
    return presenceChannel;
  }

  if (presenceChannel) {
    resetPresenceChannel();
  }

  presenceKey = nextPresenceKey;
  presenceChannel = supabase.channel(CHANNEL_NAME, {
    config: { presence: { key: nextPresenceKey } },
  });

  presenceChannel
    .on("presence", { event: "sync" }, readSessionsFromChannel)
    .on("presence", { event: "join" }, readSessionsFromChannel)
    .on("presence", { event: "leave" }, readSessionsFromChannel)
    .subscribe((status) => {
      isSubscribed = status === "SUBSCRIBED";

      if (status === "SUBSCRIBED") {
        void trackCurrentPresence();
        return;
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setSessions([]);
      }
    });

  return presenceChannel;
};

const subscribeToSessions = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSessionsSnapshot = () => sessions;

/**
 * Tracks the current user's presence on the "online-users" channel.
 * Mount once near the app root so every authenticated page visit is visible
 * to admin presence tracking.
 */
export const usePresence = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      resetPresenceChannel();
      return;
    }

    ensurePresenceChannel(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    currentPresence = {
      user_id: user.id,
      page: location.pathname,
      joined_at: new Date().toISOString(),
    };

    void trackCurrentPresence();
  }, [user?.id, location.pathname]);

  useEffect(() => {
    return () => {
      resetPresenceChannel();
    };
  }, []);
};

export const usePresenceSessions = () =>
  useSyncExternalStore(subscribeToSessions, getSessionsSnapshot, getSessionsSnapshot);
