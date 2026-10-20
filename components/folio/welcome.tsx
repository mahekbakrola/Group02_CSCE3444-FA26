"use client";
import {
  ArrowRight,
  MessagesSquare,
  GitBranch,
  FileText,
  Compass,
  ShieldCheck,
} from "lucide-react";
import { Constellation } from "./constellation";
import { useWorkspace } from "./workspace";
import { Tag, Primary, Panel } from "./shared";
export function Welcome() {
  const { w, setMode } = useWorkspace();
  return (
    <>
      <section className="welcome-hero">
        <div>
          <Tag tone="mint">YOUR CAREER, CONNECTED</Tag>
          <h1>
            Your experience is <br />
            stronger than <br />
            <em>you think.</em>
          </h1>
          <p>
            Find the story in what you’ve done. Turn it into a résumé you can
            stand behind, and a clearer idea of where to go next.
          </p>
          <div className="button-row">
            <Primary
              onClick={() => {
                setMode("personal");
                window.location.assign("/onboarding");
              }}
            >
              Find my starting point
              <ArrowRight size={17} />
            </Primary>
            <a
              className="subtle-button"
              href="/dashboard"
              onClick={() => setMode("demo")}
            >
              Explore Maya’s demo
            </a>
          </div>
        </div>
        <div>
          <Constellation
            motion={w?.profile.motion ?? true}
            onSelect={(id) => window.location.assign(`/career/${id}`)}
          />
        </div>
      </section>
      <div className="welcome-steps">
        {[
          {
            i: MessagesSquare,
            title: "A better question",
            text: "A focused interview discovers details you might have forgotten.",
          },
          {
            i: GitBranch,
            title: "A connected story",
            text: "Your contributions, tools, and outcomes become a clear evidence ledger.",
          },
          {
            i: FileText,
            title: "A résumé that sounds like you",
            text: "Review every line, inspect its sources, and choose an uncomplicated template.",
          },
          {
            i: Compass,
            title: "A direction worth exploring",
            text: "Compare careers and job descriptions against real evidence and interests.",
          },
        ].map((s, i) => (
          <Panel key={s.title}>
            <span className="welcome-step-number">0{i + 1}</span>
            <s.i size={25} />
            <h2>{s.title}</h2>
            <p>{s.text}</p>
          </Panel>
        ))}
      </div>
      <section className="transformation-example">
        <div>
          <div className="eyebrow">FROM AN EVERYDAY TASK TO A USEFUL STORY</div>
          <h2>“I just fixed phones.”</h2>
          <p>
            What devices? What did you diagnose? Who did you help? Good
            follow-ups find the substance behind a short answer.
          </p>
        </div>
        <Panel>
          <Tag>AFTER CONFIRMING THE DETAILS</Tag>
          <blockquote>
            Diagnosed smartphone and laptop hardware and software issues and
            explained repair options to customers.
          </blockquote>
          <div className="tag-row">
            <Tag tone="mint">Troubleshooting</Tag>
            <Tag tone="mint">Communication</Tag>
          </div>
          <p>
            <ShieldCheck size={14} />
            No invented numbers. Just a clearer description of real work.
          </p>
        </Panel>
      </section>
    </>
  );
}
