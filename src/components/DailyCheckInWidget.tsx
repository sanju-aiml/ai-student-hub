import React, { useEffect, useState } from 'react';
import { Flame, Calendar, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export default function DailyCheckInWidget() {
  const [streak, setStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('streak-updated', { detail: { streak } }));
  }, [streak]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        await fetchOrCreateStreak(user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Firebase auth anonymous sign-in restricted or disabled, falling back to local storage.", err);
          setUserId('local_user');
          setLoading(false);
          loadLocalFallback();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadLocalFallback = () => {
    const localStreak = localStorage.getItem('local_streak_count');
    const localLast = localStorage.getItem('local_streak_last_date');
    if (localStreak && localLast) {
      setStreak(parseInt(localStreak, 10));
      setLastCheckIn(localLast);
      setHasCheckedInToday(localLast === new Date().toISOString().split('T')[0]);
    }
  };

  const fetchOrCreateStreak = async (uid: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const docRef = doc(db, 'streaks', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const streakVal = data.streakCount || 0;
        const lastDate = data.lastCheckInDate || null;
        setStreak(streakVal);
        setLastCheckIn(lastDate);

        const todayStr = new Date().toISOString().split('T')[0];
        setHasCheckedInToday(lastDate === todayStr);
      } else {
        setStreak(0);
        setLastCheckIn(null);
        setHasCheckedInToday(false);
      }
    } catch (err) {
      console.warn("Firestore fetch failed, invoking local fallback:", err);
      loadLocalFallback();
      setErrorMsg("Cloud Sync Offline");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = 1;

    if (lastCheckIn) {
      const lastDateObj = new Date(lastCheckIn);
      const todayDateObj = new Date(todayStr);
      
      // Calculate day difference in UTC/Local safely
      const diffTime = todayDateObj.getTime() - lastDateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak = streak + 1;
      } else if (diffDays === 0) {
        newStreak = streak; // Same day click
      } else {
        newStreak = 1; // Streak broken
      }
    }

    const payload = {
      userId: userId || 'anonymous_fallback',
      streakCount: newStreak,
      lastCheckInDate: todayStr,
      updatedAt: new Date().toISOString()
    };

    setLoading(true);

    if (userId) {
      const path = `streaks/${userId}`;
      try {
        await setDoc(doc(db, 'streaks', userId), payload);
        setStreak(newStreak);
        setLastCheckIn(todayStr);
        setHasCheckedInToday(true);
        setErrorMsg(null);
        // Update local storage too
        localStorage.setItem('local_streak_count', newStreak.toString());
        localStorage.setItem('local_streak_last_date', todayStr);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, path);
        } catch (mappedErr) {
          console.error("Firestore Write failure caught:", mappedErr);
          // Fallback to local storage write
          localStorage.setItem('local_streak_count', newStreak.toString());
          localStorage.setItem('local_streak_last_date', todayStr);
          setStreak(newStreak);
          setLastCheckIn(todayStr);
          setHasCheckedInToday(true);
          setErrorMsg("Local Saved (Cloud Offline)");
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Local fallback execution
      localStorage.setItem('local_streak_count', newStreak.toString());
      localStorage.setItem('local_streak_last_date', todayStr);
      setStreak(newStreak);
      setLastCheckIn(todayStr);
      setHasCheckedInToday(true);
      setLoading(false);
    }
  };

  return (
    <div className="p-3.5 bg-zinc-900/40 dark:bg-zinc-950/60 border border-zinc-800/80 rounded-none font-mono text-xs text-zinc-300 space-y-3 shadow-md animate-fade-in" id="daily-check-in-widget">
      <div className="flex justify-between items-center border-b border-zinc-850 pb-2">
        <span className="text-[10px] font-bold text-accent-gold uppercase tracking-widest flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-accent-gold" />
          Daily Check-in
        </span>
        <div className="flex items-center gap-1 bg-accent-gold/10 border border-accent-gold/20 px-1.5 py-0.5" title="Consecutive day streak">
          <Flame className="h-3.5 w-3.5 text-accent-gold fill-accent-gold" />
          <span className="text-[11px] font-bold text-accent-gold">{streak}</span>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between text-zinc-400">
          <span>Current Streak:</span>
          <span className="font-bold text-zinc-200">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>Last Check-in:</span>
          <span className="font-bold text-zinc-300">{lastCheckIn || 'Never'}</span>
        </div>
      </div>

      {errorMsg && (
        <p className="text-[9px] text-zinc-500 uppercase leading-none select-none">
          ℹ {errorMsg}
        </p>
      )}

      {hasCheckedInToday ? (
        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1.5 text-center flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Claimed Today
        </div>
      ) : (
        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="w-full bg-accent-gold hover:bg-opacity-90 disabled:opacity-50 text-black py-1.5 font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 cursor-pointer transition"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Trophy className="h-3.5 w-3.5" />
              Check In Today
            </>
          )}
        </button>
      )}
    </div>
  );
}
