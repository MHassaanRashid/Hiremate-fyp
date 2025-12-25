"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import CandidateLayout from "@/layouts/CandidateLayout";
import { SettingsSidebar, type SettingsTabKey } from "@/components/settings/SettingsSidebar";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { SaveIndicator, type SaveState } from "@/components/settings/SaveIndicator";
import { ConfirmationModal } from "@/components/settings/ConfirmationModal";
import {
  getPrivacySettings,
  updatePrivacySettings,
  getNotificationSettings,
  updateNotificationSettings,
  getApplicationPreferences,
  updateApplicationPreferences,
  requestAccountDeletion,
  type PrivacySettings,
  type NotificationSettings,
  type ApplicationPreferences,
} from "@/lib/api/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Bell,
  SlidersHorizontal,
} from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function CandidateSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTabKey>("privacy");

  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [applicationPrefs, setApplicationPrefs] = useState<ApplicationPreferences | null>(null);

  const [privacySaveState, setPrivacySaveState] = useState<SaveState>("idle");
  const [notificationsSaveState, setNotificationsSaveState] = useState<SaveState>("idle");
  const [applicationsSaveState, setApplicationsSaveState] = useState<SaveState>("idle");



  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings
  useEffect(() => {
    const load = async () => {
      const token = getAccessToken();
      if (!user || !token) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const [privacyRes, notifRes, appRes] = await Promise.all([
          getPrivacySettings(token),
          getNotificationSettings(token),
          getApplicationPreferences(token),
        ]);
        setPrivacy(privacyRes);
        setNotifications(notifRes);
        setApplicationPrefs(appRes);
      } catch (err: any) {
        console.error("Failed to load settings", err);
        setError(err?.message || "Failed to load settings.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      load();
    }
  }, [authLoading, user]);



  const handlePrivacyChange = async (next: PrivacySettings) => {
    setPrivacy(next);
    const token = getAccessToken();
    if (!token) return;
    setPrivacySaveState("saving");
    try {
      await updatePrivacySettings(token, next);
      setPrivacySaveState("saved");
      setTimeout(() => setPrivacySaveState("idle"), 1500);
    } catch (err) {
      setPrivacySaveState("error");
    }
  };

  const handleNotificationsChange = async (next: NotificationSettings) => {
    setNotifications(next);
    const token = getAccessToken();
    if (!token) return;
    setNotificationsSaveState("saving");
    try {
      await updateNotificationSettings(token, next);
      setNotificationsSaveState("saved");
      setTimeout(() => setNotificationsSaveState("idle"), 1500);
    } catch (err) {
      setNotificationsSaveState("error");
    }
  };

  const handleApplicationsChange = async (next: ApplicationPreferences) => {
    setApplicationPrefs(next);
    const token = getAccessToken();
    if (!token) return;
    setApplicationsSaveState("saving");
    try {
      await updateApplicationPreferences(token, next);
      setApplicationsSaveState("saved");
      setTimeout(() => setApplicationsSaveState("idle"), 1500);
    } catch (err) {
      setApplicationsSaveState("error");
    }
  };

  const isLoaded = useMemo(
    () => !!privacy && !!notifications && !!applicationPrefs,
    [privacy, notifications, applicationPrefs]
  );

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative">
        <AnimatedBackground />
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 relative z-10">
          <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Account settings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your profile, security, privacy, and communication preferences.
              </p>
            </div>
            <Badge className="self-start bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Candidate portal
            </Badge>
          </header>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive" role="alert">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <SettingsSidebar active={activeTab} onChange={setActiveTab} />

            {/* Mobile tabs */}
            <div className="md:hidden w-full">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(
                  [
                    { key: "privacy", label: "Privacy" },
                    { key: "notifications", label: "Notifications" },
                    { key: "applications", label: "Applications" },
                    { key: "data", label: "Account" },
                  ] as { key: SettingsTabKey; label: string }[]
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${activeTab === t.key
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white/80 text-gray-700 border-blue-100"
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <main className="flex-1 w-full">
              {authLoading || !user || !isLoaded || isLoading ? (
                <SettingsSkeleton />
              ) : (
                <div className="space-y-6">
                  {activeTab === "privacy" && privacy && (
                    <PrivacySettingsTab
                      privacy={privacy}
                      onChange={handlePrivacyChange}
                      saveState={privacySaveState}
                    />
                  )}
                  {activeTab === "notifications" && notifications && (
                    <NotificationSettingsTab
                      settings={notifications}
                      onChange={handleNotificationsChange}
                      saveState={notificationsSaveState}
                    />
                  )}
                  {activeTab === "applications" && applicationPrefs && (
                    <ApplicationPreferencesTab
                      prefs={applicationPrefs}
                      onChange={handleApplicationsChange}
                      saveState={applicationsSaveState}
                    />
                  )}
                  {activeTab === "data" && (
                    <DataExportTab />
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}


interface PrivacyTabProps {
  privacy: PrivacySettings;
  onChange: (p: PrivacySettings) => void;
  saveState: SaveState;
}

function PrivacySettingsTab({ privacy, onChange, saveState }: PrivacyTabProps) {
  return (
    <section className="space-y-4" aria-label="Privacy and visibility settings">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Privacy & visibility</h2>
          <p className="text-xs text-muted-foreground">
            Control who can see your profile and how your data is shared.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-6">
        <div>
          <p className="text-xs font-semibold text-foreground">Profile visibility</p>
          <p className="text-[11px] text-muted-foreground mb-3">
            Choose how visible your profile is to employers and recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { key: "public", label: "Public", description: "Visible to everyone." },
              {
                key: "employers_only",
                label: "Employers only",
                description: "Only verified employers can view your profile.",
              },
              {
                key: "private",
                label: "Private",
                description: "Only you can see your profile.",
              },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange({ ...privacy, profile_visibility: opt.key as any })}
                className={`flex-1 rounded-xl border px-3 py-2 text-left text-xs ${privacy.profile_visibility === opt.key
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 bg-white text-gray-700"
                  }`}
              >
                <p className={cn("font-medium", privacy.profile_visibility === opt.key && "text-foreground")}>{opt.label}</p>
                <p className="text-[11px] opacity-80 mt-0.5">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <ToggleSwitch
            checked={privacy.share_profile_with_employers}
            onCheckedChange={(v) =>
              onChange({ ...privacy, share_profile_with_employers: v })
            }
            label="Share profile with employers"
            description="Allow employers on HireMate to view your profile when you apply."
          />
          <ToggleSwitch
            checked={privacy.share_resume_with_employers}
            onCheckedChange={(v) =>
              onChange({ ...privacy, share_resume_with_employers: v })
            }
            label="Share resume with employers"
            description="Include your uploaded resume when applying to jobs."
          />
          <ToggleSwitch
            checked={privacy.allow_contact_by_email}
            onCheckedChange={(v) =>
              onChange({ ...privacy, allow_contact_by_email: v })
            }
            label="Allow contact by email"
            description="Employers can contact you on your email address."
          />
          <ToggleSwitch
            checked={privacy.allow_contact_by_phone}
            onCheckedChange={(v) =>
              onChange({ ...privacy, allow_contact_by_phone: v })
            }
            label="Allow contact by phone"
            description="Employers can contact you on your phone number."
          />
          <ToggleSwitch
            checked={privacy.allow_third_party_sharing}
            onCheckedChange={(v) =>
              onChange({ ...privacy, allow_third_party_sharing: v })
            }
            label="Allow data sharing with trusted partners"
            description="Share anonymized profile data with trusted partners to improve matches."
          />
        </div>
      </div>
    </section>
  );
}

interface NotificationsTabProps {
  settings: NotificationSettings;
  onChange: (n: NotificationSettings) => void;
  saveState: SaveState;
}

function NotificationSettingsTab({ settings, onChange, saveState }: NotificationsTabProps) {
  return (
    <section className="space-y-4" aria-label="Notification preferences">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Notification preferences</h2>
          <p className="text-xs text-muted-foreground">
            Choose how and when HireMate keeps you updated.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-5">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Email notifications</h3>
            <p className="text-[11px] text-muted-foreground">Fine-tune which emails you receive.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <ToggleSwitch
            checked={settings.job_recommendations_email}
            onCheckedChange={(v) =>
              onChange({ ...settings, job_recommendations_email: v })
            }
            label="Job recommendations"
            description="Emails about new jobs that match your profile."
          />
          <ToggleSwitch
            checked={settings.application_updates_email}
            onCheckedChange={(v) =>
              onChange({ ...settings, application_updates_email: v })
            }
            label="Application status updates"
            description="Updates when employers review or update your applications."
          />
          <ToggleSwitch
            checked={settings.profile_views_email}
            onCheckedChange={(v) =>
              onChange({ ...settings, profile_views_email: v })
            }
            label="Profile views"
            description="Alerts when employers view your profile."
          />
          <ToggleSwitch
            checked={settings.interview_invitations_email}
            onCheckedChange={(v) =>
              onChange({ ...settings, interview_invitations_email: v })
            }
            label="Interview invitations"
            description="Emails when you're invited to interviews."
          />
          <ToggleSwitch
            checked={settings.marketing_email}
            onCheckedChange={(v) =>
              onChange({ ...settings, marketing_email: v })
            }
            label="Product updates & tips"
            description="Occasional emails about new features and best practices."
          />
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Push notifications</h3>
            <p className="text-[11px] text-muted-foreground">
              Enable browser or mobile push notifications.
            </p>
          </div>
        </div>
        <ToggleSwitch
          checked={settings.push_enabled}
          onCheckedChange={(v) => onChange({ ...settings, push_enabled: v })}
          label="Enable push notifications"
          description="Get quick alerts for time-sensitive updates."
        />

        <div className="pt-2 space-y-2">
          <p className="text-xs font-semibold text-foreground">Notification frequency</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { key: "immediate", label: "Immediate" },
              { key: "daily", label: "Daily digest" },
              { key: "weekly", label: "Weekly" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange({ ...settings, frequency: opt.key as any })}
                className={cn(
                  "rounded-full border px-3 py-1 transition-colors",settings.frequency === opt.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
                  )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ApplicationTabProps {
  prefs: ApplicationPreferences;
  onChange: (p: ApplicationPreferences) => void;
  saveState: SaveState;
}

function ApplicationPreferencesTab({ prefs, onChange, saveState }: ApplicationTabProps) {
  const toggleJobType = (value: string) => {
    const has = prefs.preferred_job_types.includes(value);
    const next = has
      ? prefs.preferred_job_types.filter((v) => v !== value)
      : [...prefs.preferred_job_types, value];
    onChange({ ...prefs, preferred_job_types: next });
  };

  return (
    <section className="space-y-4" aria-label="Application preferences">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Application preferences</h2>
          <p className="text-xs text-muted-foreground">
            Configure how you apply and what types of roles you&apos;re interested in.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Job preferences</h3>
            <p className="text-[11px] text-muted-foreground">We use this to personalize recommendations.</p>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Preferred job types</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { key: "full_time", label: "Full-time" },
                { key: "part_time", label: "Part-time" },
                { key: "contract", label: "Contract" },
                { key: "remote", label: "Remote" },
              ].map((opt) => {
                const active = prefs.preferred_job_types.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleJobType(opt.key)}
                    className={`rounded-full border px-3 py-1 ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-blue-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Minimum salary (annual)</label>
              <Input
                type="number"
                value={prefs.salary_min ?? ""}
                onChange={(e) =>
                  onChange({ ...prefs, salary_min: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="e.g. 60000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Maximum salary (annual)</label>
              <Input
                type="number"
                value={prefs.salary_max ?? ""}
                onChange={(e) =>
                  onChange({ ...prefs, salary_max: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="e.g. 120000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Preferred locations</label>
            <Textarea
              rows={2}
              value={prefs.preferred_locations.join(", ")}
              onChange={(e) =>
                onChange({
                  ...prefs,
                  preferred_locations: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Cities or regions (comma-separated)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Preferred industries</label>
            <Textarea
              rows={2}
              value={prefs.preferred_industries.join(", ")}
              onChange={(e) =>
                onChange({
                  ...prefs,
                  preferred_industries: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. Fintech, SaaS, E-commerce"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Preferred roles</label>
            <Textarea
              rows={2}
              value={prefs.preferred_roles.join(", ")}
              onChange={(e) =>
                onChange({
                  ...prefs,
                  preferred_roles: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. Frontend Engineer, Data Scientist"
            />
          </div>

          <ToggleSwitch
            checked={prefs.auto_fill_enabled}
            onCheckedChange={(v) => onChange({ ...prefs, auto_fill_enabled: v })}
            label="Enable auto-fill"
            description="Use your profile and resume to pre-fill application forms."
          />
        </div>
      </div>
    </section>
  );
}

function DataExportTab() {
  const handleAccountDeletion = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      await requestAccountDeletion(token);
      alert("Account deletion requested. Our team will review your request.");
    } catch (err) {
      alert("Failed to request deletion. Please try again later.");
    }
  };

  return (
    <section className="space-y-4" aria-label="Data and export settings">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Account Management</h2>
          <p className="text-xs text-gray-500">
            Manage your account and request deletion if needed.
          </p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl bg-destructive/5 border border-destructive/20 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-destructive">Danger zone</h3>
          <p className="text-[11px] text-muted-foreground">
            Request deletion of your HireMate account and associated data. This action is
            not reversible once processed.
          </p>
        </div>
        <ConfirmationModal
          triggerLabel="Request account deletion"
          title="Request account deletion"
          description="We will review and process your deletion request according to our data retention policy. Are you sure you want to continue?"
          confirmLabel="Request deletion"
          variant="danger"
          onConfirm={handleAccountDeletion}
        />
      </div>
    </section>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
