"use client";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Orbit,
  LayoutDashboard,
  MessagesSquare,
  Gem,
  ContactRound,
  FileText,
  Waypoints,
  BriefcaseBusiness,
  Settings,
  Search,
  ArrowUpRight,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceProvider, useWorkspace } from "./workspace";
import { Button } from "@/components/ui/button";
import { Tag } from "./shared";
const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/interview", label: "Your interview", icon: MessagesSquare },
  { href: "/discover", label: "Experience miner", icon: Gem },
  { href: "/profile", label: "Master profile", icon: ContactRound },
  { href: "/resume", label: "Résumé studio", icon: FileText },
  { href: "/career", label: "Career explorer", icon: Waypoints },
  { href: "/jobs", label: "Job matches", icon: BriefcaseBusiness },
];
function Nav() {
  const path = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {navigation.map((item, i) => (
        <SidebarMenuItem key={item.href}>
          {i === 4 && <div className="nav-section">YOUR NEXT CHAPTER</div>}
          <SidebarMenuButton
            className="nav-button"
            asChild
            isActive={
              path === item.href ||
              (item.href === "/dashboard" && path === "/") ||
              path.startsWith(item.href + "/")
            }
          >
            {/* Use document navigation here: the hosted client router can stall
                while the same destination loads correctly as a document. */}
            <a href={item.href} onClick={() => setOpenMobile(false)}>
              <item.icon size={19} />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
function Frame({ children }: { children: ReactNode }) {
  const { w, loading, error, mode, setMode, refresh, mutate, busy } =
    useWorkspace();
  const path = usePathname();
  const [search, setSearch] = useState(false);
  const current =
    navigation.find((n) => path === n.href || path.startsWith(n.href + "/"))
      ?.label ?? (path === "/settings" ? "Settings" : "Overview");
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearch((s) => !s);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle(
      "light",
      w?.profile.theme === "light",
    );
    document.documentElement.classList.toggle(
      "reduce-motion",
      w?.profile.motion === false,
    );
  }, [w?.profile.theme, w?.profile.motion]);
  return (
    <SidebarProvider
      style={{ "--sidebar-width": "15.25rem" } as React.CSSProperties}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar className="folio-sidebar">
        <SidebarHeader className="brand-area">
          <a className="brand" href="/dashboard">
            <span className="brand-icon">
              <Orbit size={26} />
            </span>
            folio<span className="brand-period">.</span>
          </a>
          <div className="brand-subtitle">YOUR CAREER, CONNECTED</div>
        </SidebarHeader>
        <SidebarContent className="nav-area">
          <div className="nav-section">WORKSPACE</div>
          <Nav />
          <div className="sidebar-coach">
            <div className="coach-orbit">
              <Orbit size={23} />
            </div>
            <h3>More than a résumé.</h3>
            <p>Discover the story behind your experience.</p>
            <a href="/interview">
              Let’s find it <ArrowUpRight size={16} />
            </a>
          </div>
        </SidebarContent>
        <SidebarFooter className="sidebar-bottom">
          <a href="/settings" className="settings-link">
            <Settings size={18} />
            Settings & privacy
          </a>
          <a href="/welcome" className="settings-link">
            <BookOpen size={18} />
            About Folio
          </a>
          <div className="user-block">
            <div className="avatar">
              {mode === "demo"
                ? "MC"
                : (w?.profile.name || "You").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>
                {mode === "demo"
                  ? "Maya Chen"
                  : w?.profile.name || "Your workspace"}
              </strong>
              <span>
                {mode === "demo"
                  ? "Fictional demo profile"
                  : "Personal profile"}
              </span>
            </div>
            <button
              aria-label="Switch profile"
              className="icon-button"
              disabled={busy}
              onClick={() => setMode(mode === "demo" ? "personal" : "demo")}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumbs">
            <SidebarTrigger className="mobile-trigger" />
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{current}</strong>
          </div>
          <div className="header-tools">
            <button className="search-button" onClick={() => setSearch(true)}>
              <Search size={16} />
              <span>Jump to...</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button theme-button"
              aria-label="Toggle color theme"
              disabled={!w || busy}
              onClick={() =>
                w &&
                void mutate({
                  type: "profile",
                  profile: {
                    ...w.profile,
                    theme: w.profile.theme === "dark" ? "light" : "dark",
                  },
                }).catch(() => {})
              }
            >
              {w?.profile.theme === "light" ? (
                <Moon size={17} />
              ) : (
                <Sun size={17} />
              )}
            </button>
            <a className="header-resume" href="/resume">
              Open résumé <ArrowUpRight size={15} />
            </a>
          </div>
        </header>
        <div className="demo-ribbon">
          <div>
            <Tag tone="mint">
              {mode === "demo" ? "DEMO WORKSPACE" : "PERSONAL WORKSPACE"}
            </Tag>
            <span>
              {mode === "demo"
                ? "Meet Maya. Explore what her experience can become."
                : "Your answers and drafts are private to your account."}
            </span>
          </div>
          <button
            disabled={busy}
            onClick={() => {
              setMode(mode === "demo" ? "personal" : "demo");
              if (mode === "demo") window.location.assign("/onboarding");
            }}
          >
            {mode === "demo" ? "Start my own profile" : "Explore the demo"}
            <ArrowRight size={14} />
          </button>
        </div>
        <main id="main-content" className="page-content">
          {loading ? (
            <div className="loading-page" aria-label="Loading workspace">
              <Skeleton className="h-9 w-72" />
              <Skeleton className="mt-8 h-80 w-full" />
              <div className="grid grid-cols-2 gap-5 mt-5">
                <Skeleton className="h-52" />
                <Skeleton className="h-52" />
              </div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <ShieldCheck size={32} />
              <h1>Your workspace is waiting</h1>
              <p>{error}</p>
              <div className="button-row">
                <Button onClick={refresh}>Try again</Button>
                <a
                  className="primary link-button"
                  href="/signin"
                >
                  Sign in / Sign up
                </a>
              </div>
            </div>
          ) : (
            <Fragment key={mode}>{children}</Fragment>
          )}
        </main>
        <footer className="app-footer">
          <span>
            <ShieldCheck size={13} />
            Your story. Your facts. Your control.
          </span>
          <span>Made for the next chapter.</span>
        </footer>
      </div>
      <CommandDialog open={search} onOpenChange={setSearch}>
        <CommandInput placeholder="Where would you like to go?" />
        <CommandList>
          <CommandEmpty>No matching pages.</CommandEmpty>
          <CommandGroup heading="Workspace">
            {[
              ...navigation,
              {
                href: "/settings",
                label: "Settings & privacy",
                icon: Settings,
              },
            ].map((n) => (
              <CommandItem
                key={n.href}
                onSelect={() => {
                  setSearch(false);
                  window.location.assign(n.href);
                }}
              >
                <n.icon size={17} />
                {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      <Toaster
        position="bottom-right"
        richColors
        theme={w?.profile.theme ?? "dark"}
      />
    </SidebarProvider>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path === "/signin" || path === "/signup") return <>{children}</>;
  return (
    <WorkspaceProvider>
      <Frame>{children}</Frame>
    </WorkspaceProvider>
  );
}
