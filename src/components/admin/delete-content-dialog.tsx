"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Confirms before calling the protected server deletion action. */
export function DeleteContentDialog({
  title,
  onDelete,
}: {
  title: string;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setError("");
    setPending(true);
    try {
      await onDelete();
      setOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not delete this content.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          setOpen(value);
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Delete {title}?</DialogTitle>
          <DialogDescription>
            This permanently deletes the record. Remove any related links first.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={remove}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
