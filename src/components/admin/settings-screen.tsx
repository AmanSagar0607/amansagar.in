"use client";
import { Input as FormInput } from "@/components/ui/input";
import { Textarea as FormTextarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { saveContent } from "@/lib/admin/client";
import type { SiteSettings } from "@/lib/admin/site-settings";
import { defaultSiteSettings } from "@/lib/admin/site-settings";
import { WorkExperienceSettings } from "./work-experience-settings";
const inputClass =
  "border-input bg-background focus-visible:ring-ring mt-1 min-h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2";
const settingsTabs = ["General", "Profile", "About", "Experience", "Stack", "Social", "Homepage"] as const;
export function SettingsScreen({ initial }: { initial: SiteSettings }) {
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [activeTab, setActiveTab] = useState<string>("General");
  const pendingInvalid = useRef(false);
  function change<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setValidationError("");
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await saveContent("settings", settings, "site");
      setSettings(result.record);
      setSaved(true);
      if (!result.revalidated)
        toast.warning(
          "Settings saved, but public pages could not be refreshed.",
        );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5" onInvalidCapture={(event) => {
      const target = event.target as HTMLElement;
      const panel = target.closest<HTMLElement>("[data-settings-tab]");
      if (!panel) return;
      event.preventDefault();
      if (pendingInvalid.current) return;
      pendingInvalid.current = true;
      const field = target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const label = field.closest("label")?.textContent?.trim();
      setValidationError(`${label ? `${label}: ` : ""}${field.validationMessage || "Please check this field."}`);
      setActiveTab(panel.dataset.settingsTab ?? "General");
      window.setTimeout(() => { target.focus(); pendingInvalid.current = false; }, 0);
    }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your public profile and site content.
          </p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-500/50 px-4 py-3 text-sm text-red-500"
        >
          {error}
        </p>
      )}
      {validationError && (
        <p role="alert" className="rounded-md border border-red-500/50 px-4 py-3 text-sm text-red-500">
          {validationError}
        </p>
      )}
      {saved && (
        <p role="status" className="text-muted-foreground text-sm">
          Settings saved.
        </p>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl">
        <ScrollArea className="w-full pb-2">
          <TabsList aria-label="Settings sections" className="w-max">
            {settingsTabs.map((tab) => <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>)}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Card className="gap-0"><CardContent>
        <TabsContent forceMount value="General" hidden={activeTab !== "General"} data-settings-tab="General" className="space-y-4">
          <label className="block text-sm font-medium">
            Site title
            <FormInput
              required
              maxLength={120}
              className={inputClass}
              value={settings.siteTitle}
              onChange={(event) => change("siteTitle", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Site description
            <FormTextarea
              required
              maxLength={320}
              rows={4}
              className={inputClass}
              value={settings.siteDescription}
              onChange={(event) =>
                change("siteDescription", event.target.value)
              }
            />
          </label>
          </TabsContent>
          <TabsContent forceMount value="Profile" hidden={activeTab !== "Profile"} data-settings-tab="Profile" className="space-y-4">
          <label className="block text-sm font-medium">
            Profile tagline
            <FormInput required maxLength={500} className={inputClass} value={settings.profileTagline ?? defaultSiteSettings.profileTagline} onChange={(event) => change("profileTagline", event.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Profile role
            <FormInput required maxLength={500} className={inputClass} value={settings.profileRole ?? defaultSiteSettings.profileRole} onChange={(event) => change("profileRole", event.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Profile introduction
            <FormTextarea required maxLength={500} rows={4} className={inputClass} value={settings.profileBio ?? defaultSiteSettings.profileBio} onChange={(event) => change("profileBio", event.target.value)} />
          </label>
          {([
            ["profileFocus", "Focus"],
            ["profileLocation", "Location"],
            ["profileAvailability", "Availability"],
          ] as const).map(([key, label]) => <label key={key} className="block text-sm font-medium">{label}<FormInput required maxLength={500} className={inputClass} value={settings[key] ?? defaultSiteSettings[key]} onChange={(event) => change(key, event.target.value)} /></label>)}
          <label className="block text-sm font-medium">Featured project name<FormInput required maxLength={500} className={inputClass} value={settings.featuredProjectName ?? defaultSiteSettings.featuredProjectName} onChange={(event) => change("featuredProjectName", event.target.value)} /></label>
          <label className="block text-sm font-medium">Featured project URL (HTTPS)<FormInput required type="url" maxLength={2048} className={inputClass} value={settings.featuredProjectUrl ?? defaultSiteSettings.featuredProjectUrl} onChange={(event) => change("featuredProjectUrl", event.target.value)} /></label>
          <label className="block text-sm font-medium">Featured project description<FormTextarea required rows={2} maxLength={500} className={inputClass} value={settings.featuredProjectDescription ?? defaultSiteSettings.featuredProjectDescription} onChange={(event) => change("featuredProjectDescription", event.target.value)} /></label>
          <label className="block text-sm font-medium">
            Public contact email
            <FormInput
              required
              type="email"
              maxLength={320}
              className={inputClass}
              value={settings.contactEmail}
              onChange={(event) => change("contactEmail", event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Résumé URL
            <FormInput required type="url" maxLength={2048} className={inputClass} value={settings.resumeUrl ?? defaultSiteSettings.resumeUrl} onChange={(event) => change("resumeUrl", event.target.value)} />
          </label>
          </TabsContent>
          <TabsContent forceMount value="About" hidden={activeTab !== "About"} data-settings-tab="About" className="space-y-4">
          <label className="block text-sm font-medium">About page description<FormTextarea required maxLength={500} rows={3} className={inputClass} value={settings.aboutDescription ?? defaultSiteSettings.aboutDescription} onChange={(event) => change("aboutDescription", event.target.value)} /></label>
          <fieldset className="space-y-3 border-t pt-4"><legend className="text-sm font-semibold">About page paragraphs</legend>
            {(settings.aboutParagraphs ?? defaultSiteSettings.aboutParagraphs ?? []).map((paragraph, index) => <div key={index} className="space-y-2"><label className="block text-sm font-medium">Paragraph {index + 1}<FormTextarea required maxLength={5000} rows={4} className={inputClass} value={paragraph} onChange={(event) => { const paragraphs = [...(settings.aboutParagraphs ?? defaultSiteSettings.aboutParagraphs ?? [])]; paragraphs[index] = event.target.value; change("aboutParagraphs", paragraphs); }} /></label><Button type="button" variant="outline" onClick={() => change("aboutParagraphs", (settings.aboutParagraphs ?? defaultSiteSettings.aboutParagraphs ?? []).filter((_, i) => i !== index))}>Remove paragraph {index + 1}</Button></div>)}
            <Button type="button" variant="outline" onClick={() => change("aboutParagraphs", [...(settings.aboutParagraphs ?? defaultSiteSettings.aboutParagraphs ?? []), ""])}>Add paragraph</Button>
          </fieldset>
          </TabsContent>
          <TabsContent forceMount value="Experience" hidden={activeTab !== "Experience"} data-settings-tab="Experience" className="space-y-4">
          <WorkExperienceSettings value={settings.workExperience ?? defaultSiteSettings.workExperience ?? []} onChange={(value) => change("workExperience", value)} />
          </TabsContent>
          <TabsContent forceMount value="Stack" hidden={activeTab !== "Stack"} data-settings-tab="Stack" className="space-y-4">
          <fieldset className="space-y-4 border-t pt-4">
            <legend className="text-sm font-semibold">Technology stack</legend>
            {(settings.technologyStack ?? defaultSiteSettings.technologyStack ?? []).map((group, index) => <div key={index} className="space-y-2 rounded-md border p-3">
              <label className="block text-sm font-medium">Group name<FormInput required maxLength={100} className={inputClass} value={group.label} onChange={(event) => { const groups = [...(settings.technologyStack ?? defaultSiteSettings.technologyStack ?? [])]; groups[index] = { ...group, label: event.target.value }; change("technologyStack", groups); }} /></label>
              <label className="block text-sm font-medium">Technologies (one per line)<FormTextarea key={JSON.stringify(group.items)} rows={4} className={inputClass} defaultValue={group.items.join("\n")} onBlur={(event) => { const groups = [...(settings.technologyStack ?? defaultSiteSettings.technologyStack ?? [])]; groups[index] = { ...groups[index], items: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) }; change("technologyStack", groups); }} /></label>
              <Button type="button" variant="outline" onClick={() => change("technologyStack", (settings.technologyStack ?? defaultSiteSettings.technologyStack ?? []).filter((_, i) => i !== index))}>Remove {group.label || "group"}</Button>
            </div>)}
            <Button type="button" variant="outline" onClick={() => change("technologyStack", [...(settings.technologyStack ?? defaultSiteSettings.technologyStack ?? []), { label: "", items: [] }])}>Add technology group</Button>
          </fieldset>
          </TabsContent>
          <TabsContent forceMount value="Social" hidden={activeTab !== "Social"} data-settings-tab="Social" className="space-y-4">
          <fieldset className="space-y-4 border-t pt-4">
            <legend className="text-sm font-semibold">Social links</legend>
            {(settings.socialLinks ?? defaultSiteSettings.socialLinks ?? []).map((link, index) => (
              <div key={index} className="space-y-2 rounded-md border p-3">
                {(["label", "handle", "href"] as const).map((field) => (
                  <label key={field} className="block text-sm font-medium">
                    {field === "href" ? "HTTPS or email URL" : field === "label" ? "Label" : "Handle"}
                    <FormInput required={field !== "handle"} className={inputClass} value={link[field]} onChange={(event) => {
                      const links = [...(settings.socialLinks ?? defaultSiteSettings.socialLinks ?? [])];
                      links[index] = { ...links[index], [field]: event.target.value };
                      change("socialLinks", links);
                    }} />
                  </label>
                ))}
                <Button type="button" variant="outline" onClick={() => change("socialLinks", (settings.socialLinks ?? defaultSiteSettings.socialLinks ?? []).filter((_, position) => position !== index))}>Remove {link.label || "link"}</Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => change("socialLinks", [...(settings.socialLinks ?? defaultSiteSettings.socialLinks ?? []), { label: "", handle: "", href: "" }])}>Add social link</Button>
          </fieldset>
          </TabsContent>
          <TabsContent forceMount value="Homepage" hidden={activeTab !== "Homepage"} data-settings-tab="Homepage" className="space-y-4">
            <h2 className="font-medium">Homepage content</h2>
            {([ ["homepageProjectsTitle", "Projects heading"], ["homepageProjectsDescription", "Projects introduction"], ["homepageBlogTitle", "Blog heading"], ["homepageBlogDescription", "Blog introduction"] ] as const).map(([key, label]) => <label key={key} className="block text-sm font-medium">{label}<FormInput className={inputClass} maxLength={500} value={settings[key] ?? defaultSiteSettings[key] ?? ""} onChange={(event) => change(key, event.target.value)} /></label>)}
            <p className="text-muted-foreground text-sm">Pinned projects appear first on the homepage and Projects page. Use Projects → Website project order to arrange projects within each group. New projects start first unless you choose another order.</p>
            <label className="block text-sm font-medium">Release version<FormInput className={inputClass} pattern="[0-9]+\\.[0-9]+\\.[0-9]+" value={settings.releaseVersion ?? "1.0.0"} onChange={(event) => change("releaseVersion", event.target.value)} /></label>
            <div className="flex flex-wrap gap-2">{([ ["patch", 2], ["minor", 1], ["major", 0] ] as const).map(([label, index]) => <Button key={label} type="button" variant="outline" onClick={() => { const parts = (settings.releaseVersion ?? "1.0.0").split(".").map(Number); parts[index] += 1; for (let i = index + 1; i < 3; i++) parts[i] = 0; change("releaseVersion", parts.join(".")); }}>Bump {label}</Button>)}</div>
            <p className="text-muted-foreground text-xs">Release version is shown in admin only and is never included in public page metadata.</p>
          </TabsContent>
        </CardContent></Card>
      </Tabs>
    </form>
  );
}
