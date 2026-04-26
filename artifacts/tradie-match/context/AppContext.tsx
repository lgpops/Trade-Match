import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { SEED_PROFILES, type SeedProfile } from "@/constants/seedProfiles";
import type { TradeKey } from "@/constants/trades";

export type UserProfile = {
  name: string;
  age: number;
  trade: TradeKey;
  yearsOnTools: number;
  suburb: string;
  bio: string;
  rig: string;
  weekendMove: string;
  brewOfChoice: string;
};

export type Message = {
  id: string;
  matchId: string;
  text: string;
  fromMe: boolean;
  createdAt: number;
};

export type Match = {
  id: string;
  profile: SeedProfile;
  matchedAt: number;
  lastReadAt: number;
};

type Decision = "like" | "pass";

type AppState = {
  ready: boolean;
  user: UserProfile | null;
  profiles: SeedProfile[];
  decisions: Record<string, Decision>;
  matches: Match[];
  messages: Message[];
  saveUser: (user: UserProfile) => Promise<void>;
  resetUser: () => Promise<void>;
  decideOnProfile: (
    profileId: string,
    decision: Decision,
  ) => { matched: boolean; profile: SeedProfile | null };
  sendMessage: (matchId: string, text: string) => void;
  markMatchRead: (matchId: string) => void;
  unreadCount: number;
};

const STORAGE_KEYS = {
  user: "tm.user.v1",
  decisions: "tm.decisions.v1",
  matches: "tm.matches.v1",
  messages: "tm.messages.v1",
};

const AUTO_REPLIES = [
  "Oi how's it going",
  "Haha fair enough",
  "Yeah I'm keen",
  "Knock off in 20, what are you up to later",
  "I reckon we'd get on, you sound alright",
  "Coffee Saturday morning?",
  "Just finished site, smashed",
  "Tell me your worst tradie horror story",
];

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [u, d, m, msgs] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.user),
          AsyncStorage.getItem(STORAGE_KEYS.decisions),
          AsyncStorage.getItem(STORAGE_KEYS.matches),
          AsyncStorage.getItem(STORAGE_KEYS.messages),
        ]);
        if (u) setUser(JSON.parse(u));
        if (d) setDecisions(JSON.parse(d));
        if (m) {
          const parsed: Match[] = JSON.parse(m);
          const hydrated = parsed
            .map((mm) => {
              const profile = SEED_PROFILES.find((p) => p.id === mm.profile.id);
              return profile ? { ...mm, profile } : null;
            })
            .filter(Boolean) as Match[];
          setMatches(hydrated);
        }
        if (msgs) setMessages(JSON.parse(msgs));
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persistDecisions = useCallback(async (next: Record<string, Decision>) => {
    await AsyncStorage.setItem(STORAGE_KEYS.decisions, JSON.stringify(next));
  }, []);

  const persistMatches = useCallback(async (next: Match[]) => {
    const serializable = next.map((m) => ({
      ...m,
      profile: { ...m.profile, photo: undefined },
    }));
    await AsyncStorage.setItem(STORAGE_KEYS.matches, JSON.stringify(serializable));
  }, []);

  const persistMessages = useCallback(async (next: Message[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(next));
  }, []);

  const saveUser = useCallback(async (next: UserProfile) => {
    setUser(next);
    await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(next));
  }, []);

  const resetUser = useCallback(async () => {
    setUser(null);
    setDecisions({});
    setMatches([]);
    setMessages([]);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.user),
      AsyncStorage.removeItem(STORAGE_KEYS.decisions),
      AsyncStorage.removeItem(STORAGE_KEYS.matches),
      AsyncStorage.removeItem(STORAGE_KEYS.messages),
    ]);
  }, []);

  const decideOnProfile = useCallback<AppState["decideOnProfile"]>(
    (profileId, decision) => {
      const profile = SEED_PROFILES.find((p) => p.id === profileId) ?? null;
      const nextDecisions = { ...decisions, [profileId]: decision };
      setDecisions(nextDecisions);
      void persistDecisions(nextDecisions);

      if (decision === "like" && profile) {
        const isMatch = Math.random() < 0.7;
        if (isMatch) {
          const match: Match = {
            id: profile.id,
            profile,
            matchedAt: Date.now(),
            lastReadAt: 0,
          };
          const nextMatches = [match, ...matches.filter((m) => m.id !== profile.id)];
          setMatches(nextMatches);
          void persistMatches(nextMatches);
          return { matched: true, profile };
        }
      }
      return { matched: false, profile: null };
    },
    [decisions, matches, persistDecisions, persistMatches],
  );

  const sendMessage = useCallback<AppState["sendMessage"]>(
    (matchId, text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const msg: Message = {
        id: newId(),
        matchId,
        text: trimmed,
        fromMe: true,
        createdAt: Date.now(),
      };
      const next = [...messages, msg];
      setMessages(next);
      void persistMessages(next);

      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]!;
      const delay = 1500 + Math.random() * 2500;
      setTimeout(() => {
        setMessages((curr) => {
          const replyMsg: Message = {
            id: newId(),
            matchId,
            text: reply,
            fromMe: false,
            createdAt: Date.now(),
          };
          const updated = [...curr, replyMsg];
          void persistMessages(updated);
          return updated;
        });
      }, delay);
    },
    [messages, persistMessages],
  );

  const markMatchRead = useCallback<AppState["markMatchRead"]>(
    (matchId) => {
      setMatches((curr) => {
        const next = curr.map((m) =>
          m.id === matchId ? { ...m, lastReadAt: Date.now() } : m,
        );
        void persistMatches(next);
        return next;
      });
    },
    [persistMatches],
  );

  const profiles = useMemo(
    () => SEED_PROFILES.filter((p) => !decisions[p.id]),
    [decisions],
  );

  const unreadCount = useMemo(() => {
    let count = 0;
    for (const m of matches) {
      const lastIncoming = messages
        .filter((msg) => msg.matchId === m.id && !msg.fromMe)
        .reduce((max, msg) => Math.max(max, msg.createdAt), 0);
      if (lastIncoming > m.lastReadAt) count += 1;
    }
    return count;
  }, [matches, messages]);

  const value: AppState = {
    ready,
    user,
    profiles,
    decisions,
    matches,
    messages,
    saveUser,
    resetUser,
    decideOnProfile,
    sendMessage,
    markMatchRead,
    unreadCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
