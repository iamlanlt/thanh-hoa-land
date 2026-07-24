"use client";

import { useEffect, useRef, useState } from "react";

export function useDebouncedQuery(
  currentQuery: string | undefined,
  onChange: (query: string | undefined) => void,
  delay = 350,
) {
  const [query, setQuery] = useState(currentQuery || "");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setQuery(currentQuery || "");
  }, [currentQuery]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery === (currentQuery || "")) return;
    const timeout = window.setTimeout(
      () => onChangeRef.current(normalizedQuery || undefined),
      delay,
    );
    return () => window.clearTimeout(timeout);
  }, [currentQuery, delay, query]);

  return [query, setQuery] as const;
}
