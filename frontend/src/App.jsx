/* eslint-disable react-hooks/purity */
/* eslint-disable no-unused-vars */
import React, { useMemo, useState } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  GitBranch,
  Copy,
  ArrowRight,
  Code2,
  BookOpen,
  Terminal,
  FileText,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Github,
  Rocket,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";

const sampleRepos = [
  "https://github.com/vercel/next.js",
  "https://github.com/expressjs/express",
  "https://github.com/prisma/prisma-examples",
  "https://github.com/supabase/supabase",
];

const featureCards = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Instant onboarding guide",
    desc: "RepoLens generates a clean, copy-ready guide: what it does, how to run it, and where to edit.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Architecture map (auto)",
    desc: "Find the important folders, entry points, routes, configs, DB layer — without spelunking for hours.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Repo risk detector",
    desc: "Flags missing .env.example, missing Docker, no tests, and common footguns.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Stack detection",
    desc: "Detects framework & key tools from package.json and conventions.",
  },
];

const miniChecklist = [
  { ok: true, label: "Detects tech stack + scripts" },
  { ok: true, label: "Explains where to start editing" },
  { ok: true, label: "Generates README-ready onboarding" },
  { ok: true, label: "Flags missing env/docker/tests" },
];

export default function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const randomSample = useMemo(
    () => sampleRepos[Math.floor(Math.random() * sampleRepos.length)],
    []
  );

  const isValidGithubUrl = (url) => {
    try {
      const u = new URL(url);
      return (
        u.hostname.includes("github.com") &&
        u.pathname.split("/").filter(Boolean).length >= 2
      );
    } catch {
      return false;
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied ✅");
    } catch {
      toast.error("Couldn't copy ❌");
    }
  };

  const handleAnalyze = async (overrideUrl) => {
    const finalUrl = (overrideUrl ?? repoUrl).trim();

    if (!finalUrl) {
      toast.error("Drop a GitHub repo link");
      return;
    }
    if (!isValidGithubUrl(finalUrl)) {
      toast.error("That doesn't look like a GitHub repo link");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: finalUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Backend failed");
      }

      const data = await res.json();
      setReport(data);

      toast.success("Analysis ready ✅");

      setTimeout(() => {
        const el = document.getElementById("preview");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      console.log(error);
      toast.error("Try again after a while");
    } finally {
      setLoading(false);
    }
  };

  const techStack = report?.detected?.stack?.length ? report.detected.stack : [];
  const framework = report?.detected?.framework || "Unknown";
  const runSteps = report?.runSteps?.length ? report.runSteps : [];
  const warnings = report?.warnings?.length ? report.warnings : [];
  const markdown =
    report?.generatedMarkdown ||
    `# RepoLens Report\n\nNo report yet. Paste a repo link and analyze.`;

  const score = report?.score ?? null;
  const important = report?.important ?? null;

  const scoreLabel =
    score === null
      ? "—"
      : score >= 90
        ? "Elite"
        : score >= 75
          ? "Good"
          : score >= 50
            ? "Risky"
            : "Pain";

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#070A12] text-white">
        {/* Background glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/30 via-fuchsia-500/20 to-cyan-500/30 blur-3xl" />
          <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 blur-3xl" />
          <div className="absolute left-[-180px] top-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-violet-500/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
        </div>

        {/* Navbar */}
        <header className="relative z-10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <GitBranch className="h-5 w-5 text-white/90" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight">
                    RepoLens
                  </span>
                  <Badge className="rounded-full bg-white/10 text-white ring-1 ring-white/10">
                    v0.1
                  </Badge>

                  {score !== null && (
                    <Badge className="rounded-full bg-white/10 text-white ring-1 ring-white/10">
                      <Star className="mr-1 h-3.5 w-3.5" />
                      {score}/100 • {scoreLabel}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-white/60">
                  Understand any repo in seconds.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-white/80 hover:bg-white/10 hover:text-white"
                onClick={() => {
                  const el = document.getElementById("preview");
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Preview
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    onClick={() =>
                      copyText(
                        `RepoLens — Understand any GitHub repo in 30 seconds.\n${window.location.href}`
                      )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy launch blurb
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-black/80 text-white border-white/10">
                  <p>Perfect for X / LinkedIn posts.</p>
                </TooltipContent>
              </Tooltip>

              {report?.repo?.url ? (
                <Button
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => window.open(report.repo.url, "_blank")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  Open Repo
                </Button>
              ) : (
                <Button
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => window.open("https://github.com", "_blank")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="relative z-10">
          <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
            <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built for devs who hate “where is the entry point?”
                </div>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Repo onboarding,
                  <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                    {" "}
                    instantly.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
                  RepoLens scans a GitHub repository and generates a clean
                  explanation:
                  <span className="text-white/90">
                    {" "}
                    what it is, how to run it, where things live, and what’s
                    missing.
                  </span>
                  <br />
                  No more 45-minute repo archaeology.
                </p>

                {/* Input */}
                <Card className="mt-6 border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                        <Input
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder={randomSample}
                          className="h-11 border-white/10 bg-black/30 pl-9 text-white placeholder:text-white/35 focus-visible:ring-2 focus-visible:ring-white/20"
                        />
                      </div>

                      <Button
                        onClick={() => handleAnalyze()}
                        disabled={loading}
                        className="h-11 bg-white text-black hover:bg-white/90"
                      >
                        {loading ? (
                          <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Analyze Repo
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
                      <Badge className="rounded-full bg-white/5 text-white/70 ring-1 ring-white/10">
                        Public repos
                      </Badge>
                      <Badge className="rounded-full bg-white/5 text-white/70 ring-1 ring-white/10">
                        JS/TS focused
                      </Badge>
                      <Badge className="rounded-full bg-white/5 text-white/70 ring-1 ring-white/10">
                        Copy-ready output
                      </Badge>
                      <span className="ml-1 inline-flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" />
                        No auth needed (MVP)
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Mini checklist */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {miniChecklist.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      {it.ok ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                      )}
                      <div className="text-sm text-white/75">{it.label}</div>
                    </div>
                  ))}
                </div>

                {/* Social proof row */}
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-white/55">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <Terminal className="h-3.5 w-3.5" />
                    Designed for real codebases
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <FileText className="h-3.5 w-3.5" />
                    Outputs markdown docs
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <Code2 className="h-3.5 w-3.5" />
                    Heuristic stack detection
                  </span>
                </div>
              </div>

              {/* Right / Live Report */}
              <div className="lg:sticky lg:top-6">
                <Card className="border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white/90">
                        {report ? "Live Report" : "Waiting for analysis…"}
                      </div>
                      <Badge className="rounded-full bg-black/30 text-white/70 ring-1 ring-white/10">
                        {report ? "real" : "idle"}
                      </Badge>
                    </div>

                    <Separator className="my-4 bg-white/10" />

                    {!report ? (
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                        Paste a repo link and hit{" "}
                        <span className="text-white">Analyze</span>.
                        <div className="mt-2 text-xs text-white/50">
                          Stack • Run steps • Warnings • README-ready output
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Stack */}
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <Layers className="h-4 w-4" />
                            Tech Stack
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge className="rounded-full bg-white/10 text-white ring-1 ring-white/10">
                              {framework}
                            </Badge>

                            {techStack.map((s) => (
                              <Badge
                                key={s}
                                className="rounded-full bg-white/10 text-white ring-1 ring-white/10"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-2 text-xs text-white/50">
                            package.json:{" "}
                            <span className="text-white/70">
                              {important?.packageJsonPath ?? "Not found"}
                            </span>
                          </div>

                          {techStack.length === 0 && (
                            <div className="mt-2 text-xs text-amber-200/80">
                              Stack might be empty because this repo isn’t JS/TS
                              OR package.json wasn’t found.
                            </div>
                          )}
                        </div>

                        {/* Run steps */}
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <Terminal className="h-4 w-4" />
                            Run locally
                          </div>

                          <div className="mt-3 space-y-2">
                            {runSteps.map((cmd, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                              >
                                <code className="text-xs text-white/85">
                                  {cmd}
                                </code>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 hover:bg-white/10"
                                  onClick={() => copyText(cmd)}
                                >
                                  <Copy className="h-4 w-4 text-white/70" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Warnings */}
                        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                          <div className="flex items-center gap-2 text-xs text-white/70">
                            <ShieldCheck className="h-4 w-4" />
                            Repo Doctor
                          </div>

                          <div className="mt-3 space-y-2">
                            {warnings.length === 0 ? (
                              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                                <div className="text-xs text-white/80">
                                  No major issues detected ✅
                                </div>
                              </div>
                            ) : (
                              warnings.map((w, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                                >
                                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-300" />
                                  <div className="text-xs text-white/80">
                                    {w}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <Button
                            className="h-11 bg-white text-black hover:bg-white/90"
                            onClick={() => copyText(markdown)}
                          >
                            <BookOpen className="mr-2 h-4 w-4" />
                            Copy Markdown
                          </Button>

                          <Button
                            variant="outline"
                            className="h-11 border-white/10 bg-white/5 text-white hover:bg-white/10"
                            onClick={() =>
                              copyText(JSON.stringify(report ?? {}, null, 2))
                            }
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy JSON
                          </Button>
                        </div>

                        <div className="text-center text-[11px] text-white/45">
                          Repo:{" "}
                          <span className="text-white/70">
                            {report?.repo?.owner}/{report?.repo?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Built for speed. Designed for clarity.
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-white/65">
                  RepoLens doesn’t try to be “AI magic”. It’s a practical repo
                  scanner that gives you the{" "}
                  <span className="text-white/85">
                    20% information that saves 80% time
                  </span>
                  .
                </p>
              </div>
              <Badge className="hidden sm:inline-flex rounded-full bg-white/5 text-white/70 ring-1 ring-white/10">
                Product Hunt ready ⚡
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((f, i) => (
                <Card
                  key={i}
                  className="group border-white/10 bg-white/5 transition hover:bg-white/7 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                        <div className="text-white/85">{f.icon}</div>
                      </div>
                      <div className="text-sm font-semibold text-white/90">
                        {f.title}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Preview Section */}
          <section id="preview" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <Card className="border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs text-white/70">
                      <Sparkles className="h-4 w-4" />
                      Output preview
                    </div>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">
                      Clean report. Copy it. Ship faster.
                    </h3>
                    <p className="mt-1 text-sm text-white/60">
                      Paste into README.md, Notion, or send to a teammate.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => {
                        setRepoUrl(randomSample);
                        toast.success("Sample repo loaded ✅");
                        setTimeout(() => handleAnalyze(randomSample), 80);
                      }}
                    >
                      Use sample repo
                    </Button>

                    <Button
                      className="bg-white text-black hover:bg-white/90"
                      onClick={() => handleAnalyze()}
                    >
                      Analyze now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-6 bg-white/10" />

                <Tabs defaultValue="markdown" className="w-full">
                  <TabsList className="bg-black/30 border border-white/10">
                    <TabsTrigger value="markdown">Markdown</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="markdown" className="mt-4">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                        <div className="text-xs text-white/60">
                          README-ready output
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-white/10"
                          onClick={() => copyText(markdown)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>

                      <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed text-white/80">
                        {markdown}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="mt-4">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                        <div className="text-xs text-white/60">
                          Structured report
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="hover:bg-white/10"
                          onClick={() =>
                            copyText(JSON.stringify(report ?? {}, null, 2))
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </Button>
                      </div>

                      <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed text-white/80">
                        {JSON.stringify(report ?? {}, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
            <Card className="border-white/10 bg-gradient-to-r from-white/10 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
              <CardContent className="p-6">
                <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs text-white/70">
                      <Zap className="h-4 w-4" />
                      Your next repo shouldn’t waste your time.
                    </div>
                    <div className="mt-2 text-xl font-semibold tracking-tight">
                      Ship faster. Onboard smarter. Stop guessing.
                    </div>
                    <div className="mt-1 text-sm text-white/60">
                      Paste a repo link, get clarity. That’s RepoLens.
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                      className="h-11 bg-white text-black hover:bg-white/90"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                      Try RepoLens
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="h-11 border-white/10 bg-white/5 text-white hover:bg-white/10"
                      onClick={() =>
                        copyText(
                          "RepoLens: Understand any GitHub repo in 30 seconds.\nBuilt for onboarding, codebase clarity, and faster shipping."
                        )
                      }
                    >
                      Copy pitch
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/45">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400/80" />
                    Built with React + Tailwind + shadcn/ui
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      No sign-in (MVP)
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      No repo write access
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center text-xs text-white/35">
              © {new Date().getFullYear()} RepoLens • Built by Souma • “Clarity is a
              feature.”
            </div>
          </footer>
        </main>
      </div>
    </TooltipProvider>
  );
}
