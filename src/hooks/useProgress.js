import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "backend-roadmap-progress-v1";

function readProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function useProgress() {
  const [done, setDone] = useState(readProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      // Storage may be unavailable (private mode); progress is a nice-to-have.
    }
  }, [done]);

  const toggle = useCallback((id) => {
    setDone((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  const reset = useCallback(() => setDone([]), []);

  return { done, toggle, reset };
}
