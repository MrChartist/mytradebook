 import { useState, useCallback, useEffect, useRef } from "react";
 import { supabase } from "@/integrations/supabase/client";
 
 export interface Instrument {
   security_id: string;
   exchange_segment: string;
   exchange: string;
   instrument_type: string;
   trading_symbol: string;
   display_name: string | null;
   underlying_symbol: string | null;
   expiry: string | null;
   strike: number | null;
   option_type: string | null;
   lot_size: number | null;
   tick_size: number | null;
 }
 
 interface UseInstrumentSearchOptions {
   exchange?: "ALL" | "NSE" | "NFO" | "MCX";
   instrumentType?: "ALL" | "EQ" | "FUT" | "OPT" | "INDEX" | "COMMODITY";
   limit?: number;
   debounceMs?: number;
 }
 
 const STORAGE_KEY_RECENT = "instrument_recent";
 const STORAGE_KEY_FAVORITES = "instrument_favorites";
 
 function getStoredItems(key: string): Instrument[] {
   try {
     const stored = localStorage.getItem(key);
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 function setStoredItems(key: string, items: Instrument[]) {
   try {
     localStorage.setItem(key, JSON.stringify(items.slice(0, 20)));
   } catch {}
 }
 
 export function useInstrumentSearch(options: UseInstrumentSearchOptions = {}) {
   const {
     exchange = "ALL",
     instrumentType = "ALL",
     limit = 50,
     debounceMs = 200,
   } = options;
 
   const [query, setQuery] = useState("");
   const [instruments, setInstruments] = useState<Instrument[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [recentInstruments, setRecentInstruments] = useState<Instrument[]>(() =>
     getStoredItems(STORAGE_KEY_RECENT)
   );
   const [favoriteInstruments, setFavoriteInstruments] = useState<Instrument[]>(() =>
     getStoredItems(STORAGE_KEY_FAVORITES)
   );
 
   const debounceRef = useRef<NodeJS.Timeout | null>(null);
   const abortRef = useRef<AbortController | null>(null);
 
   // Search instruments from database
   const searchInstruments = useCallback(
     async (searchQuery: string) => {
       // Cancel previous request
       if (abortRef.current) {
         abortRef.current.abort();
       }
       abortRef.current = new AbortController();
 
       setIsLoading(true);
       setError(null);
 
       try {
         // Query the database directly for speed
         let dbQuery = supabase
           .from("instrument_master")
           .select("*")
           .limit(limit);
 
         if (exchange !== "ALL") {
           dbQuery = dbQuery.eq("exchange", exchange);
         }
 
         if (instrumentType !== "ALL") {
           dbQuery = dbQuery.eq("instrument_type", instrumentType);
         }
 
          if (searchQuery.trim()) {
            const term = searchQuery.trim().toUpperCase().slice(0, 100);
            // Escape ILIKE special characters to prevent pattern injection
            const sanitized = term.replace(/[%_\\]/g, "\\$&");
            dbQuery = dbQuery.or(
              `trading_symbol.ilike.%${sanitized}%,display_name.ilike.%${sanitized}%`
            );
         }
 
         dbQuery = dbQuery.order("trading_symbol", { ascending: true });
 
         const { data, error: queryError } = await dbQuery;
 
         if (queryError) {
           throw queryError;
         }
 
         setInstruments((data as Instrument[]) || []);
       } catch (err) {
         if (err instanceof Error && err.name === "AbortError") {
           return;
         }
         console.error("Instrument search error:", err);
         setError(err instanceof Error ? err.message : "Search failed");
         setInstruments([]);
       } finally {
         setIsLoading(false);
       }
     },
     [exchange, instrumentType, limit]
   );
 
   // Debounced search effect
   useEffect(() => {
     if (debounceRef.current) {
       clearTimeout(debounceRef.current);
     }
 
     debounceRef.current = setTimeout(() => {
       searchInstruments(query);
     }, debounceMs);
 
     return () => {
       if (debounceRef.current) {
         clearTimeout(debounceRef.current);
       }
     };
   }, [query, searchInstruments, debounceMs]);
 
   // Initial load when filters change
   useEffect(() => {
     searchInstruments(query);
   }, [exchange, instrumentType]);
 
   // Add to recent
   const addToRecent = useCallback((instrument: Instrument) => {
     setRecentInstruments((prev) => {
       const filtered = prev.filter(
         (i) => i.security_id !== instrument.security_id
       );
       const updated = [instrument, ...filtered].slice(0, 10);
       setStoredItems(STORAGE_KEY_RECENT, updated);
       return updated;
     });
   }, []);
 
   // Toggle favorite
   const toggleFavorite = useCallback((instrument: Instrument) => {
     setFavoriteInstruments((prev) => {
       const exists = prev.some((i) => i.security_id === instrument.security_id);
       let updated: Instrument[];
       if (exists) {
         updated = prev.filter((i) => i.security_id !== instrument.security_id);
       } else {
         updated = [instrument, ...prev].slice(0, 20);
       }
       setStoredItems(STORAGE_KEY_FAVORITES, updated);
       return updated;
     });
   }, []);
 
   const isFavorite = useCallback(
     (securityId: string) => {
       return favoriteInstruments.some((i) => i.security_id === securityId);
     },
     [favoriteInstruments]
   );
 
   return {
     query,
     setQuery,
     instruments,
     isLoading,
     error,
     recentInstruments,
     favoriteInstruments,
     addToRecent,
     toggleFavorite,
     isFavorite,
     refresh: () => searchInstruments(query),
   };
 }