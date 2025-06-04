"use client";
import { useRealtimeData } from "./useRealTimeData";
import { getSessionPrompts } from "@/lib/supabase/services/prompts";
import type { Prompt } from "@/lib/supabase/types";
import { useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useProcessNewPrompts(sessionId: string) {
  const supabase = createClient();
  
  console.log('useProcessNewPrompts called with sessionId:', sessionId); // Add this

  const status = "pending"

  const fetchData = useCallback(() => {
    return getSessionPrompts(supabase, sessionId, status);
  }, [sessionId]);

  const { data: prompts, loading, error, refetch } = useRealtimeData<Prompt>({
    tableName: "prompts",
    fetchData: fetchData,
    filter: `session_id=eq.${sessionId}`,
    channelName: `prompts_session_${sessionId}`,
    minRefetchInterval: 500,
    eventType: "INSERT",
  });

  console.log('Hook state:', { prompts, loading, error }); // Add this

  useEffect(() => {
    console.log('useEffect triggered with prompts:', prompts); // Add this
    
    if (!prompts) {
      console.log('No prompts, returning early'); // Add this
      return;
    }

    console.log('Processing', prompts.length, 'prompts'); // Add this

    prompts.forEach(async (prompt) => {
      console.log('About to process prompt:', prompt.id); // Add this
      
      try {
        console.log('Making fetch request to /api/generate-image'); // Add this
        
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promptId: prompt.id }),
        });

        console.log('Fetch response:', res.status, res.ok); // Add this

        if (!res.ok) {
          const { error: errMsg } = await res.json();
          throw new Error(errMsg || `Status ${res.status}`);
        }
        
        const result = await res.json();
        console.log('API Success:', result); // Add this
      } catch (err) {
        console.error(`Failed to process prompt ${prompt.id}:`, err);
      }
    });
  }, [prompts]);

  return { prompts, loading, error, refetch };
}
