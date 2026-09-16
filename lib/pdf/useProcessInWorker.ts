"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useProcessInWorker() {
  const workerRef = useRef<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const worker = new Worker("/workers/pdfWorker.js");
        workerRef.current = worker;
        setIsWorkerReady(true);

        return () => {
          worker.terminate();
          workerRef.current = null;
        };
      } catch (err) {
        console.warn("Web Worker could not be initialized:", err);
      }
    }
  }, []);

  const runTask = useCallback(
    <T = any, R = any>(type: string, payload: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Web Worker is not available"));
          return;
        }

        const taskId = `${type}_${Date.now()}_${Math.random()}`;

        const handleMessage = (e: MessageEvent) => {
          if (e.data && e.data.id === taskId) {
            workerRef.current?.removeEventListener("message", handleMessage);
            if (e.data.status === "SUCCESS") {
              resolve(e.data.result);
            } else {
              reject(new Error(e.data.error || "Worker operation failed"));
            }
          }
        };

        workerRef.current.addEventListener("message", handleMessage);
        workerRef.current.postMessage({ id: taskId, type, payload });
      });
    },
    []
  );

  return { isWorkerReady, runTask };
}
