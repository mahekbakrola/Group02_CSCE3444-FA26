"use client";
import { newId } from "@/lib/engine/id";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWorkspace } from "./workspace";
import { Pick, Primary } from "./shared";
import type { Entity, EntityKind } from "@/lib/engine/model";
import { toast } from "sonner";
export function EntityEditor({
  open,
  onClose,
  entity,
  kind = "experience",
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  entity?: Entity;
  kind?: EntityKind;
  onCreated?: (id: string) => void;
}) {
  const { mutate, busy } = useWorkspace();
  const [title, setTitle] = useState(entity?.title ?? "");
  const [subtitle, setSubtitle] = useState(entity?.subtitle ?? "");
  const [dates, setDates] = useState(entity?.dates ?? "");
  const [type, setType] = useState<EntityKind>(entity?.kind ?? kind);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const id = entity?.id ?? newId();
    try {
      await mutate({
        type: "entity",
        entity: { id, title: title.trim(), subtitle, dates, kind: type },
      });
      toast.success(entity ? "Experience updated" : "Experience added");
      onClose();
      onCreated?.(id);
    } catch {}
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="folio-dialog">
        <DialogHeader>
          <DialogTitle>
            {entity ? "Edit experience" : "Add a piece of your story"}
          </DialogTitle>
          <DialogDescription>
            A project, responsibility, or small win is a good place to start.
          </DialogDescription>
        </DialogHeader>
        <form className="form-stack" onSubmit={save}>
          <div>
            <Label>Experience type</Label>
            <Pick
              label="Experience type"
              value={type}
              onChange={(v) => setType(v as EntityKind)}
              options={[
                { value: "experience", label: "Work experience" },
                { value: "project", label: "Project or lab" },
                {
                  value: "activity",
                  label: "Activity, award, or volunteering",
                },
                { value: "education", label: "Additional education" },
              ]}
            />
          </div>
          <div>
            <Label htmlFor="entity-title">Title or role</Label>
            <Input
              id="entity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus event finder"
              required
              maxLength={150}
            />
          </div>
          <div>
            <Label htmlFor="entity-subtitle">
              Organization or context (optional)
            </Label>
            <Input
              id="entity-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Personal project"
              maxLength={250}
            />
          </div>
          <div>
            <Label htmlFor="entity-dates">Dates (optional)</Label>
            <Input
              id="entity-dates"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              placeholder="e.g. Jan – May 2026"
              maxLength={250}
            />
          </div>
          <Primary type="submit" disabled={busy}>
            {busy ? "Saving..." : entity ? "Save changes" : "Add experience"}
          </Primary>
        </form>
      </DialogContent>
    </Dialog>
  );
}
