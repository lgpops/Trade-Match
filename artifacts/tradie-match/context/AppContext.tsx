import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SEED_PROFILES,
  type Gender,
  type SeedProfile,
} from "@/constants/seedProfiles";
import type { TradeKey } from "@/constants/trades";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export type Mode = "dating" | "mates";
export type ShowMe = "men" | "women" | "everyone";

export type UserProfile = {
  name: string;
  age: number;
  gender: Gender;
  trade: TradeKey;
  jobTitle?: string;
  yearsOnTools: number;
  suburb: string;
  bio: string;
  rig: string;
  weekendMove: string;
  brewOfChoice: string;
  mode: Mode;
  showMe: ShowMe;
};

export type Message = {
  id: string;
  matchId: string;
  text: string;
  fromMe: boolean;
  createdAt: number;
};

export type Match = {
  id: string;           // profile_id — used as a stable client-side key
  dbId: number | null;  // matches.id (bigint PK) — needed for messages FK
  profile: SeedProfile;
  matchedAt: number;
  lastReadAt: number;
  mode: Mode;
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
  updatePrefs: (prefs: Partial<Pick<UserProfile, "mode" | "showMe">>) => Promise<void>;
  resetUser: () => Promise<void>;
  decideOnProfile: (
    profileId: string,
    decision: Decision,
  ) => { matched: boolean; profile: SeedProfile | null };
  sendMessage: (matchId: string, text: string) => void;
  markMatchRead: (matchId: string) => void;
  unreadCount: number;
};

const AUTO_REPLIES_DATING = [
  "Oi how's it going",
  "Haha fair enough",
  "Yeah I'm keen",
  "Knock off in 20, what are you up to later",
  "I reckon we'd get on, you sound alright",
  "Coffee Saturday morning?",
  "Just finished site, smashed",
  "Tell me your worst tradie horror story",
];

const AUTO_REPLIES_MATES = [
  "Oi g'day, where you working this week?",
  "Fair enough mate",
  "Beers Friday?",
  "I'm at Bunnings now haha, what a sausage sizzle",
  "Got a job on Saturday if you want to sub",
  "Footy this weekend, you keen?",
  "Smoko on me next time",
  "What ute you driving these days",
];

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const uid = authUser?.id ?? null;

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Reset local state when auth user changes
  useEffect(() => {
    setReady(false);
    setUser(null);
    setDecisions({});
    setMatches([]);
    setMessages([]);

    if (!uid) {
      setReady(true);
      return;
    }

    (async () => {
      try {
        // Load profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle();

        if (profile) {
          setUser({
            name: profile.name,
            age: profile.age,
            gender: profile.gender as Gender,
            trade: profile.trade as TradeKey,
            jobTitle: profile.job_title ?? undefined,
            yearsOnTools: profile.years_on_tools,
            suburb: profile.suburb,
            bio: profile.bio,
            rig: profile.rig,
            weekendMove: profile.weekend_move,
            brewOfChoice: profile.brew_of_choice,
            mode: profile.mode as Mode,
            showMe: profile.show_me as ShowMe,
          });
        }

        // Load decisions
        const { data: decs } = await supabase
          .from("decisions")
          .select("profile_id, decision")
          .eq("user_id", uid);

        if (decs) {
          const decMap: Record<string, Decision> = {};
          for (const d of decs) decMap[d.profile_id] = d.decision as Decision;
          setDecisions(decMap);
        }

        // Load matches
        const { data: mts } = await supabase
          .from("matches")
          .select("*")
          .eq("user_id", uid)
          .order("matched_at", { ascending: false });

        if (mts) {
          const hydrated = mts
            .map((m) => {
              const sp = SEED_PROFILES.find((p) => p.id === m.profile_id);
              if (!sp) return null;
              return {
                id: m.profile_id,
                dbId: m.id as number,
                profile: sp,
                matchedAt: new Date(m.matched_at).getTime(),
                lastReadAt: m.last_read_at ? new Date(m.last_read_at).getTime() : 0,
                mode: (m.mode ?? "dating") as Mode,
              } satisfies Match;
            })
            .filter(Boolean) as Match[];
          setMatches(hydrated);
        }

        // Load messages — join to matches to resolve profile_id (our client-side matchId)
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, match_id, text, from_me, created_at, matches!inner(profile_id)")
          .eq("user_id", uid)
          .order("created_at", { ascending: true });

        if (msgs) {
          setMessages(
            msgs.map((m) => ({
              id: m.id,
              // Use profile_id as the client-side matchId so existing UI works
              matchId: (m.matches as unknown as { profile_id: string }).profile_id,
              text: m.text,
              fromMe: m.from_me,
              createdAt: new Date(m.created_at).getTime(),
            })),
          );
        }
      } catch (err) {
        console.error("AppContext load error", err);
      } finally {
        setReady(true);
      }
    })();
  }, [uid]);

  const saveUser = useCallback(
    async (next: UserProfile) => {
      if (!uid) return;
      setUser(next);
      await supabase.from("profiles").upsert({
        id: uid,
        name: next.name,
        age: next.age,
        gender: next.gender,
        trade: next.trade,
        job_title: next.jobTitle ?? null,
        years_on_tools: next.yearsOnTools,
        suburb: next.suburb,
        bio: next.bio,
        rig: next.rig,
        weekend_move: next.weekendMove,
        brew_of_choice: next.brewOfChoice,
        mode: next.mode,
        show_me: next.showMe,
      });
    },
    [uid],
  );

  const updatePrefs = useCallback<AppState["updatePrefs"]>(
    async (prefs) => {
      if (!uid || !user) return;
      const next = { ...user, ...prefs };
      setUser(next);
      await supabase
        .from("profiles")
        .update({ mode: next.mode, show_me: next.showMe })
        .eq("id", uid);
    },
    [uid, user],
  );

  const resetUser = useCallback(async () => {
    if (!uid) return;
    setUser(null);
    setDecisions({});
    setMatches([]);
    setMessages([]);
    await Promise.all([
      supabase.from("profiles").delete().eq("id", uid),
      supabase.from("decisions").delete().eq("user_id", uid),
      supabase.from("matches").delete().eq("user_id", uid),
      supabase.from("messages").delete().eq("user_id", uid),
    ]);
  }, [uid]);

  const decideOnProfile = useCallback<AppState["decideOnProfile"]>(
    (profileId, decision) => {
      if (!uid) return { matched: false, profile: null };
      const profile = SEED_PROFILES.find((p) => p.id === profileId) ?? null;
      const nextDecisions = { ...decisions, [profileId]: decision };
      setDecisions(nextDecisions);

      void supabase.from("decisions").upsert({
        user_id: uid,
        profile_id: profileId,
        decision,
      });

      if (decision === "like" && profile) {
        const isMatch = Math.random() < 0.7;
        if (isMatch) {
          const now = new Date().toISOString();
          const match: Match = {
            id: profile.id,
            dbId: null, // will be updated after DB insert resolves
            profile,
            matchedAt: Date.now(),
            lastReadAt: 0,
            mode: user?.mode ?? "dating",
          };
          const nextMatches = [match, ...matches.filter((m) => m.id !== profile.id)];
          setMatches(nextMatches);
          void (async () => {
            const { data } = await supabase
              .from("matches")
              .upsert(
                {
                  user_id: uid,
                  profile_id: profileId,
                  matched_at: now,
                  last_read_at: null,
                  mode: user?.mode ?? "dating",
                },
                { onConflict: "user_id,profile_id" },
              )
              .select("id")
              .single();
            if (data?.id) {
              setMatches((curr) =>
                curr.map((m) =>
                  m.id === profile.id ? { ...m, dbId: data.id as number } : m,
                ),
              );
            }
          })();
          return { matched: true, profile };
        }
      }
      return { matched: false, profile: null };
    },
    [uid, decisions, matches, user],
  );

  const sendMessage = useCallback<AppState["sendMessage"]>(
    (matchId, text) => {
      if (!uid) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const match = matches.find((m) => m.id === matchId);
      const dbMatchId = match?.dbId ?? null;

      const msg: Message = {
        id: newId(),
        matchId,
        text: trimmed,
        fromMe: true,
        createdAt: Date.now(),
      };
      setMessages((curr) => [...curr, msg]);

      // Only persist if we have the DB match id (FK constraint)
      if (dbMatchId !== null) {
        void supabase.from("messages").insert({
          id: msg.id,
          user_id: uid,
          match_id: dbMatchId,
          text: trimmed,
          from_me: true,
          created_at: new Date(msg.createdAt).toISOString(),
        });
      }

      const pool =
        match?.mode === "mates" ? AUTO_REPLIES_MATES : AUTO_REPLIES_DATING;
      const reply = pool[Math.floor(Math.random() * pool.length)]!;
      const delay = 1500 + Math.random() * 2500;

      setTimeout(() => {
        const replyMsg: Message = {
          id: newId(),
          matchId,
          text: reply,
          fromMe: false,
          createdAt: Date.now(),
        };
        setMessages((curr) => [...curr, replyMsg]);
        if (dbMatchId !== null) {
          void supabase.from("messages").insert({
            id: replyMsg.id,
            user_id: uid,
            match_id: dbMatchId,
            text: reply,
            from_me: false,
            created_at: new Date(replyMsg.createdAt).toISOString(),
          });
        }
      }, delay);
    },
    [uid, matches],
  );

  const markMatchRead = useCallback<AppState["markMatchRead"]>(
    (matchId) => {
      if (!uid) return;
      const now = new Date().toISOString();
      setMatches((curr) =>
        curr.map((m) =>
          m.id === matchId ? { ...m, lastReadAt: Date.now() } : m,
        ),
      );
      const match = matches.find((m) => m.id === matchId);
      if (match?.dbId != null) {
        void supabase
          .from("matches")
          .update({ last_read_at: now })
          .eq("id", match.dbId);
      }
    },
    [uid, matches],
  );

  const profiles = useMemo(() => {
    return SEED_PROFILES.filter((p) => {
      if (decisions[p.id]) return false;
      if (!user) return true;
      if (user.showMe === "men" && p.gender !== "male") return false;
      if (user.showMe === "women" && p.gender !== "female") return false;
      return true;
    });
  }, [decisions, user]);

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
    updatePrefs,
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
