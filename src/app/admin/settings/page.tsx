"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/hooks/useAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";

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
        toast.success("Settings saved successfully");
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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings</p>
        </div>

        <form onSubmit={saveSettings} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-violet-500" />
                Branding
              </CardTitle>
              <CardDescription>Customize your platform branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  placeholder="https://..."
                  value={settings.logoUrl}
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
              <CardDescription>Configure platform features and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CDN Base URL</Label>
                <Input
                  placeholder="https://cdn.example.com"
                  value={settings.cdnBaseUrl}
                  onChange={(e) => setSettings({ ...settings, cdnBaseUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Watermark Enabled</Label>
                  <p className="text-sm text-muted-foreground">Add watermark to videos</p>
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
    </AdminLayout>
  );
}