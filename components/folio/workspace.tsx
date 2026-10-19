"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { Workspace } from "@/lib/engine/model";
import type { Action } from "@/lib/validation";
import { fetchJson } from "@/lib/client-request";
type Mode = "demo" | "personal";
interface Context {
  w: Workspace | undefined;
  loading: boolean;
  error: string | null;
  busy: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  mutate: (a: Action) => Promise<Workspace>;
  refresh: () => void;
}
const Ctx = createContext<Context | null>(null);
function subscribeMode(cb: () => void) {
  window.addEventListener("folio-mode", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("folio-mode", cb);
    window.removeEventListener("storage", cb);
  };
}
let memoryMode: Mode = "personal";
function storedMode(): Mode {
  if (new URLSearchParams(window.location.search).get("workspace") === "personal") return "personal";
  try { return localStorage.getItem("folio-mode") === "demo" ? "demo" : "personal"; }
  catch { return memoryMode; }
}
function setStoredMode(m: Mode) {
  memoryMode = m;
  try { localStorage.setItem("folio-mode", m); } catch { /* In-memory mode still works when storage is blocked. */ }
  window.dispatchEvent(new Event("folio-mode"));
}
export function useWorkspace() {
  const c = useContext(Ctx);
  if (!c) throw Error("Workspace provider required");
  return c;
}
function DataProvider({ children }: { children: ReactNode }) {
  const saving = useRef(false);
  useEffect(() => {
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", restored);
    if (new URLSearchParams(window.location.search).get("workspace") === "personal") {
      setStoredMode("personal");
      const url = new URL(window.location.href);
      url.searchParams.delete("workspace");
      window.history.replaceState(window.history.state, "", url);
    }
    return () => window.removeEventListener("pageshow", restored);
  }, []);
  const mode = useSyncExternalStore(
    subscribeMode,
    storedMode,
    (): Mode => "personal",
  );
  const setMode = (next: Mode) => {
    if (saving.current) { toast.info("Wait for your save to finish before switching workspaces."); return; }
    setStoredMode(next);
  };
  const cache = useQueryClient();
  const query = useQuery<Workspace>({
    queryKey: ["workspace", mode],
    queryFn: () => fetchJson<Workspace>(`/api/workspace?mode=${mode}`),
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const mutation = useMutation({
    mutationFn: async ({ action, mode: saveMode }: { action: Action; mode: Mode }) => {
      const latest = cache.getQueryData<Workspace>(["workspace", saveMode]);
      if (!latest) throw Error("Wait for your profile to load.");
      return fetchJson<Workspace>("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: saveMode, revision: latest.revision, action }),
      }) as Promise<Workspace>;
    },
    onSuccess: (data: Workspace, variables) =>
      cache.setQueryData(["workspace", variables.mode], data),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Ctx.Provider
      value={{
        w: query.data,
        loading: query.isPending,
        error: query.error?.message ?? null,
        busy: mutation.isPending,
        mode,
        setMode,
        mutate: async (action) => {
          if (saving.current) {
            const error = Error("A save is already in progress. Wait for it to finish.");
            toast.error(error.message);
            throw error;
          }
          saving.current = true;
          try { return await mutation.mutateAsync({ action, mode }); }
          finally { saving.current = false; }
        },
        refresh: () => void query.refetch(),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
}
