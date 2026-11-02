"use client";
import { Button } from "@/components/ui/button";
import type { WorkExperienceRecord, WorkPosition } from "@/lib/admin/work-experience";

const inputClass = "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
export function WorkExperienceSettings({ value, onChange }: { value: WorkExperienceRecord[]; onChange: (value: WorkExperienceRecord[]) => void }) {
  function updateEmployer(index: number, patch: Partial<WorkExperienceRecord>) { onChange(value.map((item, i) => i === index ? { ...item, ...patch } : item)); }
  function updatePosition(index: number, positionIndex: number, patch: Partial<WorkPosition>) { updateEmployer(index, { positions: value[index].positions.map((item, i) => i === positionIndex ? { ...item, ...patch } : item) }); }
  return <fieldset className="space-y-4 border-t pt-4"><legend className="text-sm font-semibold">Work experience</legend>
    {value.map((employer, index) => <section key={employer.id} className="space-y-3 rounded-md border p-3" aria-label={`Employer ${index + 1}`}>
      <label className="block text-sm font-medium">Company<input required maxLength={200} className={inputClass} value={employer.companyName} onChange={(event) => updateEmployer(index, { companyName: event.target.value })} /></label>
      <label className="block text-sm font-medium">Company website (HTTPS)<input type="url" maxLength={2048} className={inputClass} value={employer.companyWebsite ?? ""} onChange={(event) => updateEmployer(index, { companyWebsite: event.target.value })} /></label>
      <label className="block text-sm font-medium">Company logo URL (HTTPS)<input type="url" maxLength={2048} className={inputClass} value={employer.companyLogo ?? ""} onChange={(event) => updateEmployer(index, { companyLogo: event.target.value })} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!employer.isCurrentEmployer} onChange={(event) => updateEmployer(index, { isCurrentEmployer: event.target.checked })} />Current employer</label>
      {employer.positions.map((position, positionIndex) => <div key={position.id} className="space-y-3 rounded-md bg-muted/40 p-3">
        <label className="block text-sm font-medium">Position title<input required maxLength={200} className={inputClass} value={position.title} onChange={(event) => updatePosition(index, positionIndex, { title: event.target.value })} /></label>
        <label className="block text-sm font-medium">Employment type<input maxLength={100} className={inputClass} value={position.employmentType ?? ""} onChange={(event) => updatePosition(index, positionIndex, { employmentType: event.target.value })} /></label>
        <label className="block text-sm font-medium">Start (MM.YYYY or YYYY)<input required pattern="(0[1-9]|1[0-2])\.[0-9]{4}|[0-9]{4}" className={inputClass} value={position.employmentPeriod.start} onChange={(event) => updatePosition(index, positionIndex, { employmentPeriod: { ...position.employmentPeriod, start: event.target.value } })} /></label>
        <label className="block text-sm font-medium">End (optional; MM.YYYY or YYYY)<input pattern="(0[1-9]|1[0-2])\.[0-9]{4}|[0-9]{4}" className={inputClass} value={position.employmentPeriod.end ?? ""} onChange={(event) => updatePosition(index, positionIndex, { employmentPeriod: { start: position.employmentPeriod.start, ...(event.target.value ? { end: event.target.value } : {}) } })} /></label>
        <label className="block text-sm font-medium">Description<textarea maxLength={10000} rows={4} className={inputClass} value={position.description ?? ""} onChange={(event) => updatePosition(index, positionIndex, { description: event.target.value })} /></label>
        <label className="block text-sm font-medium">Skills (comma-separated)<input className={inputClass} defaultValue={(position.skills ?? []).join(", ")} onBlur={(event) => updatePosition(index, positionIndex, { skills: event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean) })} /></label>
        <Button type="button" variant="outline" onClick={() => updateEmployer(index, { positions: employer.positions.filter((_, i) => i !== positionIndex) })}>Remove position</Button>
      </div>)}
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => updateEmployer(index, { positions: [...employer.positions, { id: crypto.randomUUID(), title: "", employmentPeriod: { start: "" } }] })}>Add position</Button><Button type="button" variant="outline" onClick={() => onChange(value.filter((_, i) => i !== index))}>Remove employer</Button></div>
    </section>)}
    <Button type="button" variant="outline" onClick={() => onChange([...value, { id: crypto.randomUUID(), companyName: "", positions: [{ id: crypto.randomUUID(), title: "", employmentPeriod: { start: "" } }] }])}>Add employer</Button>
  </fieldset>;
}
