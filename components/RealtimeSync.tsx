"use client";

import { useEffect } from "react";
import { useBlockNumber } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

export function RealtimeSync() {
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries();
    }
  }, [blockNumber, queryClient]);

  return null;
}
