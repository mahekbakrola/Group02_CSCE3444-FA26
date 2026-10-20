"use client";
import { newId } from "@/lib/engine/id";
import { useState } from "react";
import {
  Wrench,
  GraduationCap,
  Users,
  Code2,
  HeartHandshake,
  Trophy,
  Store,
  Video,
  GitBranch,
  FlaskConical,
  ArrowRight,
  Plus,
  Check,
  Lightbulb,
} from "lucide-react";
import { useWorkspace } from "./workspace";
import { PageHeading, Tag, Primary } from "./shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { EntityKind } from "@/lib/engine/model";
const prompts = [
  {
    title: "Fixed something",
    question: "Have you repaired a phone, computer, or piece of equipment?",
    icon: Wrench,
    kind: "experience",
    skill: "Problem solving",
    example: "I repaired laptops for neighbors.",
  },
  {
    title: "Built a project",
    question: "Made an app, website, game, script, or class project?",
    icon: Code2,
    kind: "project",
    skill: "Technical initiative",
    example: "I built a small app to track our group expenses.",
  },
  {
    title: "Helped someone learn",
    question: "Tutored a friend or explained something to classmates?",
    icon: GraduationCap,
    kind: "activity",
    skill: "Communication",
    example: "I helped classmates understand Python loops.",
  },
  {
    title: "Brought people together",
    question: "Helped run a club, event, study group, or community?",
    icon: Users,
    kind: "activity",
    skill: "Organization",
    example: "I organized weekly meetings for our coding club.",
  },
  {
    title: "Supported a business",
    question: "Helped customers, tracked inventory, or worked with family?",
    icon: Store,
    kind: "experience",
    skill: "Ownership",
    example: "I helped customers and tracked stock at our family store.",
  },
  {
    title: "Gave your time",
    question: "Volunteered, mentored, or supported a cause?",
    icon: HeartHandshake,
    kind: "activity",
    skill: "Responsibility",
    example: "I maintained a volunteer sign-up spreadsheet.",
  },
  {
    title: "Tried a challenge",
    question: "Joined a hackathon, competition, or engineering challenge?",
    icon: Trophy,
    kind: "project",
    skill: "Collaboration",
    example: "I built the frontend in a weekend hackathon.",
  },
  {
    title: "Created for an audience",
    question: "Made content or managed a digital community?",
    icon: Video,
    kind: "activity",
    skill: "Creative communication",
    example: "I edited educational videos for a student community.",
  },
  {
    title: "Contributed in the open",
    question: "Fixed a bug, improved documentation, or collaborated on GitHub?",
    icon: GitBranch,
    kind: "project",
    skill: "Technical collaboration",
    example: "I improved setup documentation in an open-source project.",
  },
  {
    title: "Asked a research question",
    question: "Collected data, ran an experiment, or worked in a lab?",
    icon: FlaskConical,
    kind: "project",
    skill: "Analytical thinking",
    example: "I analyzed sensor measurements in our engineering lab.",
  },
];
export function Discover() {
  const { w, mutate, busy } = useWorkspace();
  const [selected, setSelected] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  if (!w) return null;
  const item = selected === null ? null : prompts[selected];
  async function save() {
    if (!item) return;
    const id = newId();
    try {
      await mutate({
        type: "capture",
        entity: {
          id,
          kind: item.kind as EntityKind,
          title: title.trim() || item.title,
          subtitle: "Discovered experience",
          dates: "",
        },
        text: story,
      });
      toast.success("A new piece of your story, captured.");
      setSelected(null);
      window.location.assign(`/interview?entity=${encodeURIComponent(id)}`);
    } catch {}
  }
  return (
    <>
      <PageHeading
        eyebrow="EXPERIENCE MINER"
        title="There’s a story in the small things."
        description="You may have more experience than you realize. Which of these feels familiar?"
      />
      <div className="discovery-intro">
        <div>
          <Tag tone="mint">START ANYWHERE</Tag>
          <h2>
            It doesn’t need to <br />
            have been <em>on a payroll.</em>
          </h2>
        </div>
        <p>
          A class project, a favor for a friend, or a responsibility you took on
          can reveal skills worth talking about. We’ll ask the right follow-ups
          to find out.
        </p>
      </div>
      <div className="discovery-grid">
        {prompts.map((p, i) => (
          <button
            className="discovery-card"
            key={p.title}
            onClick={() => {
              setSelected(i);
              setStory("");
              setTitle("");
            }}
          >
            <div className="discovery-card-top">
              <p.icon size={25} />
              <Plus size={17} />
            </div>
            <h3>{p.title}</h3>
            <p>{p.question}</p>
            <span>Could reveal: {p.skill}</span>
          </button>
        ))}
      </div>
      <div className="discovery-bottom">
        <Lightbulb size={21} />
        <div>
          <h3>Nothing here yet? That’s a starting point too.</h3>
          <p>
            Explore a career path and pick a small learning project to build
            your first evidence.
          </p>
        </div>
        <a className="text-link" href="/career">
          Find a project
          <ArrowRight size={16} />
        </a>
      </div>
      <Dialog
        open={item !== null}
        onOpenChange={(v) => !v && setSelected(null)}
      >
        <DialogContent className="folio-dialog">
          <DialogHeader>
            <DialogTitle>{item?.title}</DialogTitle>
            <DialogDescription>
              {item?.question} We’ll use this as a starting point and ask about
              your own contribution next.
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="discovery-title">Give it a short title</Label>
          <Input
            id="discovery-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Community laptop repairs"
            maxLength={150}
          />
          <Label htmlFor="discovery-story">What did you do?</Label>
          <Textarea
            id="discovery-story"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={item?.example}
            maxLength={1800}
          />
          <div className="privacy-note">
            <Check size={16} />
            <span>
              Describe only what happened. No need to make it sound impressive.
            </span>
          </div>
          <Primary
            disabled={busy || story.trim().length < 2}
            onClick={() => void save()}
          >
            {busy ? "Saving..." : "Capture this experience"}
            <ArrowRight size={16} />
          </Primary>
        </DialogContent>
      </Dialog>
    </>
  );
}
