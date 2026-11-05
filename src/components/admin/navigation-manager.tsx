"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/ui/select";
import type { NavigationItem } from "@/lib/admin/site-settings";

export function NavigationManager({
  value,
  onChange,
}: {
  value: NavigationItem[];
  onChange: (value: NavigationItem[]) => void;
}) {
  function update(index: number, patch: Partial<NavigationItem>) {
    onChange(value.map((item, position) => position === index ? { ...item, ...patch } : item));
  }
  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function add() {
    onChange([...value, {
      id: `custom-${Date.now().toString(36)}`,
      label: "New link",
      href: "/",
      placement: "more",
      desktop: true,
      tablet: true,
      mobile: true,
    }]);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-sm font-semibold">Navigation links</legend>
      <p className="text-muted-foreground text-sm">Control link labels, destinations, order, desktop placement, and visibility on desktop, tablet, and mobile. Mobile and tablet links appear in the dock menu.</p>
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={item.id} className="min-w-0 space-y-3 rounded-lg border p-3">
            <div className="flex flex-wrap items-end gap-2">
              <label className="min-w-40 flex-1 text-sm font-medium">Label
                <Input className="mt-1" maxLength={60} value={item.label} onChange={(event) => update(index, { label: event.target.value })} />
              </label>
              <label className="min-w-48 flex-[2] text-sm font-medium">Link or URL
                <Input className="mt-1" maxLength={2048} value={item.href} onChange={(event) => update(index, { href: event.target.value })} placeholder="/about or https://…" />
              </label>
              <label className="min-w-32 text-sm font-medium">Desktop group
                <FormSelect className="mt-1" value={item.placement} onChange={(event) => update(index, { placement: event.target.value as NavigationItem["placement"] })}>
                  <option value="primary">Primary</option><option value="more">More menu</option>
                </FormSelect>
              </label>
              <div className="flex gap-1">
                <Button type="button" variant="outline" size="icon" aria-label={`Move ${item.label} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="size-4" /></Button>
                <Button type="button" variant="outline" size="icon" aria-label={`Move ${item.label} down`} disabled={index === value.length - 1} onClick={() => move(index, 1)}><ArrowDown className="size-4" /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${item.label}`} onClick={() => onChange(value.filter((_, position) => position !== index))}><Trash2 className="size-4" /></Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {(["desktop", "tablet", "mobile"] as const).map((device) => (
                <label key={device} className="flex min-h-9 items-center gap-2 text-sm capitalize">
                  <Checkbox checked={item[device]} onCheckedChange={(checked) => update(index, { [device]: checked === true })} />
                  Show on {device}
                </label>
              ))}
              <label className="flex min-h-9 items-center gap-2 text-sm">
                <Checkbox checked={item.external === true} onCheckedChange={(checked) => update(index, { external: checked === true })} />
                Open in new tab
              </label>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" onClick={add}><Plus className="size-4" />Add navigation link</Button>
    </fieldset>
  );
}
