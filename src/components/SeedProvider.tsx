import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

// This triggers seed on first load if no data exists
export function SeedProvider() {
  // We use the sports query to detect if seeded
  const sports = useQuery(api.sports.list);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (sports !== undefined && sports.length === 0 && !hasTriggered.current) {
      hasTriggered.current = true;
      // Trigger seed via HTTP endpoint or internal function
      // For now, we rely on the seed being called after deploy
    }
  }, [sports]);

  return null;
}
