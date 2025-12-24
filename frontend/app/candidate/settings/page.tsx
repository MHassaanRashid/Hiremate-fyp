"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import CandidateLayout from "@/layouts/CandidateLayout";
import { SettingsSidebar, type SettingsTabKey } from "@/components/settings/SettingsSidebar";
import { ToggleSwitch } from "@/components/settings/ToggleSwitch";
import { PasswordStrengthMeter } from "@/components/settings/PasswordStrengthMeter";
import { SaveIndicator, type SaveState } from "@/components/settings/SaveIndicator";
import { FileUploadWithPreview } from "@/components/settings/FileUploadWithPreview";
import { ConfirmationModal } from "@/components/settings/ConfirmationModal";
import { SecuritySessionsList } from "@/components/settings/SecuritySessionsList";
import {
  getProfileSettings,
  updateProfileSettings,
  updatePassword,
  getPrivacySettings,
  updatePrivacySettings,
  getNotificationSettings,
  updateNotificationSettings,
  getApplicationPreferences,
  updateApplicationPreferences,
  exportPersonalData,
  requestAccountDeletion,
  type ProfileSettingsResponse,
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
  Mail,
  Phone,
  MapPin,
  Globe2,
  Linkedin,
  Github,
  ShieldCheck,
  Lock,
  Bell,
  SlidersHorizontal,
  Database,
  ArrowDownToLine,
  User,
} from "lucide-react";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function CandidateSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTabKey>("profile");

  const [profile, setProfile] = useState<ProfileSettingsResponse | null>(null);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null);
  const [applicationPrefs, setApplicationPrefs] = useState<ApplicationPreferences | null>(null);

  const [profileSaveState, setProfileSaveState] = useState<SaveState>("idle");
  const [privacySaveState, setPrivacySaveState] = useState<SaveState>("idle");
  const [notificationsSaveState, setNotificationsSaveState] = useState<SaveState>("idle");
  const [applicationsSaveState, setApplicationsSaveState] = useState<SaveState>("idle");

  const [passwordState, setPasswordState] = useState<{
    current: string;
    next: string;
    confirm: string;
    saving: boolean;
    error?: string;
    success?: string;
  }>({ current: "", next: "", confirm: "", saving: false });

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
        const [profileRes, privacyRes, notifRes, appRes] = await Promise.all([
          getProfileSettings(token),
          getPrivacySettings(token),
          getNotificationSettings(token),
          getApplicationPreferences(token),
        ]);
        setProfile(profileRes);
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

  // Debounced auto-save for profile
  useEffect(() => {
    if (!profile) return;
    const token = getAccessToken();
    if (!token) return;

    setProfileSaveState("saving");
    const timeout = setTimeout(async () => {
      try {
        await updateProfileSettings(token, profile);
        setProfileSaveState("saved");
        setTimeout(() => setProfileSaveState("idle"), 1500);
      } catch (err) {
        setProfileSaveState("error");
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [profile?.full_name, profile?.phone, profile?.location, profile?.links, profile?.avatar_url]);

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
    () => !!profile && !!privacy && !!notifications && !!applicationPrefs,
    [profile, privacy, notifications, applicationPrefs]
  );

  // Auth guard
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="w-14 h-14 border-t-4 border-primary border-solid rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <CandidateLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
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
                    { key: "profile", label: "Profile" },
                    { key: "security", label: "Security" },
                    { key: "privacy", label: "Privacy" },
                    { key: "notifications", label: "Notifications" },
                    { key: "applications", label: "Applications" },
                    { key: "data", label: "Data" },
                  ] as { key: SettingsTabKey; label: string }[]
                ).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                      activeTab === t.key
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <main className="flex-1 w-full relative">
              {!isLoaded || isLoading ? (
                <SettingsSkeleton />
              ) : (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  {activeTab === "profile" && profile && (
                    <ProfileSettingsTab
                      profile={profile}
                      onChange={setProfile}
                      saveState={profileSaveState}
                    />
                  )}
                  {activeTab === "security" && profile && (
                    <SecuritySettingsTab
                      sessions={profile.sessions}
                      passwordState={passwordState}
                      setPasswordState={setPasswordState}
                    />
                  )}
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

// -------- Tabs content components ---------

interface ProfileTabProps {
  profile: ProfileSettingsResponse;
  onChange: (p: ProfileSettingsResponse) => void;
  saveState: SaveState;
}

function ProfileSettingsTab({ profile, onChange, saveState }: ProfileTabProps) {
  return (
    <section className="space-y-4" aria-label="Profile settings">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Profile settings</h2>
          <p className="text-xs text-muted-foreground">
            Update your personal information and how employers see you.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-6">
        <FileUploadWithPreview
          initialUrl={profile.avatar_url || null}
          onFileSelected={async () => {
            // Upload to storage could be wired here; for now we just update preview & auto-save
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Full name</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={profile.full_name || ""}
                onChange={(e) => onChange({ ...profile, full_name: e.target.value })}
                placeholder="Your full name"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => onChange({ ...profile, email: e.target.value })}
                className="pl-9 bg-muted/50 cursor-not-allowed"
                placeholder="you@example.com"
                disabled
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Phone</label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={profile.phone || ""}
                onChange={(e) => onChange({ ...profile, phone: e.target.value })}
                className="pl-9"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Location</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={profile.location || ""}
                onChange={(e) => onChange({ ...profile, location: e.target.value })}
                className="pl-9"
                placeholder="City, Country or Remote"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-semibold text-foreground border-b border-border pb-2">Professional links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Portfolio / website</label>
            <div className="relative">
              <Globe2 className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={profile.links?.portfolio || ""}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    links: { ...profile.links, portfolio: e.target.value },
                  })
                }
                className="pl-9"
                placeholder="https://your-portfolio.com"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">LinkedIn</label>
            <div className="relative">
              <Linkedin className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={profile.links?.linkedin || ""}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    links: { ...profile.links, linkedin: e.target.value },
                  })
                }
                className="pl-9"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">GitHub</label>
            <div className="relative">
              <Github className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={profile.links?.github || ""}
                onChange={(e) =>
                  onChange({
                    ...profile,
                    links: { ...profile.links, github: e.target.value },
                  })
                }
                className="pl-9"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface SecurityTabProps {
  sessions?: ProfileSettingsResponse["sessions"];
  passwordState: {
    current: string;
    next: string;
    confirm: string;
    saving: boolean;
    error?: string;
    success?: string;
  };
  setPasswordState: (s: SecurityTabProps["passwordState"]) => void;
}

function SecuritySettingsTab({ sessions, passwordState, setPasswordState }: SecurityTabProps) {
  const token = getAccessToken();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!passwordState.next || passwordState.next !== passwordState.confirm) {
      setPasswordState({ ...passwordState, error: "Passwords do not match", success: undefined });
      return;
    }

    try {
      setPasswordState({ ...passwordState, saving: true, error: undefined, success: undefined });
      await updatePassword(token, {
        current_password: passwordState.current,
        new_password: passwordState.next,
      });
      setPasswordState({ current: "", next: "", confirm: "", saving: false, success: "Password updated" });
    } catch (err: any) {
      setPasswordState({
        ...passwordState,
        saving: false,
        error: err?.message || "Failed to update password",
        success: undefined,
      });
    }
  };

  return (
    <section className="space-y-4" aria-label="Account security settings">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Account security</h2>
          <p className="text-xs text-muted-foreground">
            Keep your account secure with a strong password and login activity monitoring.
          </p>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Change password</h3>
            <p className="text-[11px] text-muted-foreground">Use at least 8 characters with numbers and symbols.</p>
          </div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Current password</label>
            <Input
              type="password"
              value={passwordState.current}
              onChange={(e) =>
                setPasswordState({ ...passwordState, current: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">New password</label>
            <Input
              type="password"
              value={passwordState.next}
              onChange={(e) =>
                setPasswordState({ ...passwordState, next: e.target.value })
              }
              required
            />
            <PasswordStrengthMeter password={passwordState.next} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Confirm new password</label>
            <Input
              type="password"
              value={passwordState.confirm}
              onChange={(e) =>
                setPasswordState({ ...passwordState, confirm: e.target.value })
              }
              required
            />
          </div>
          <div className="md:col-span-3 flex items-center justify-between pt-2">
            <div className="text-xs text-destructive min-h-[1rem]">
              {passwordState.error && <span>{passwordState.error}</span>}
              {passwordState.success && (
                <span className="text-emerald-600">{passwordState.success}</span>
              )}
            </div>
            <Button
              type="submit"
              disabled={passwordState.saving}
              className="text-xs px-4 h-8"
              size="sm"
            >
              {passwordState.saving ? "Updating..." : "Update password"}
            </Button>
          </div>
        </form>
      </div>

      {/* Two-factor placeholder + sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Two-factor authentication</h3>
              <p className="text-[11px] text-muted-foreground">
                Add an extra layer of security. Coming soon.
              </p>
            </div>
          </div>
          <Button
            type="button"
            disabled
            variant="outline"
            className="w-full text-xs h-8 cursor-not-allowed bg-muted/50"
          >
            Set up two-factor authentication
          </Button>
        </div>
        <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-foreground">Login activity</h3>
              <p className="text-[11px] text-muted-foreground">Recent sessions and sign-ins.</p>
            </div>
          </div>
          <SecuritySessionsList sessions={sessions} />
        </div>
      </div>
    </section>
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
                className={cn(
                  "flex-1 rounded-xl border px-4 py-3 text-left text-xs transition-colors",
                  privacy.profile_visibility === opt.key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                )}
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
                  "rounded-full border px-3 py-1 transition-colors",
                  settings.frequency === opt.key
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
                    className={cn(
                      "rounded-full border px-3 py-1 transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    )}
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
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setIsExporting(true);
      setExportError(null);
      const data = await exportPersonalData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "hiremate-personal-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setExportError(err?.message || "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

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
          <h2 className="text-sm font-semibold text-foreground">Data & export</h2>
          <p className="text-xs text-muted-foreground">
            Download your data or request deletion in line with privacy regulations.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Download your data</h3>
            <p className="text-[11px] text-muted-foreground">
              Export a copy of your profile, resume, applications, interviews, and settings.
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="text-xs h-8 px-4 inline-flex items-center gap-1.5"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          {isExporting ? "Preparing export..." : "Download JSON"}
        </Button>
        {exportError && (
          <p className="text-[11px] text-destructive mt-1">{exportError}</p>
        )}
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
