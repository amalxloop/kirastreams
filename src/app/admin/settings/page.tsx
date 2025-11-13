"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const { admin, loading: authLoading } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    platformName: "KiraStreams",
    logoUrl: "",
    primaryColor: "#8b5cf6",
    cdnBaseUrl: "",
    watermarkEnabled: false,
    theme: "dark",
  });

  useEffect(() => {
    if (admin) fetchSettings();
  }, [admin]);

  async function fetchSettings() {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings saved successfully! Reload the homepage to see changes.");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Website Settings</h1>
          <p className="text-muted-foreground">Customize your platform appearance and settings</p>
        </div>
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview Site
          </Button>
        </Link>
      </div>

      <form onSubmit={saveSettings} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-violet-500" />
              Branding & Appearance
            </CardTitle>
            <CardDescription>Customize your platform name, logo, and colors (changes apply site-wide)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform Name</Label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  placeholder="KiraStreams"
                />
                <p className="text-xs text-muted-foreground">Appears in header, footer, and page titles</p>
              </div>
              <div className="space-y-2">
                <Label>Primary Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    placeholder="#8b5cf6"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Used for buttons and accents</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                placeholder="https://example.com/logo.png"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Replaces the default logo in header (leave empty for default)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
            <CardDescription>Configure platform features and technical settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CDN Base URL</Label>
              <Input
                placeholder="https://cdn.example.com"
                value={settings.cdnBaseUrl}
                onChange={(e) => setSettings({ ...settings, cdnBaseUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Base URL for content delivery network</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Watermark Enabled</Label>
                <p className="text-sm text-muted-foreground">Add watermark to video content</p>
              </div>
              <Switch
                checked={settings.watermarkEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, watermarkEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}