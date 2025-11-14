"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Save, 
  Eye, 
  Palette, 
  Search, 
  Globe, 
  Bell, 
  Shield,
  MessageSquare
} from "lucide-react";
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
    siteTagline: "",
    seoDescription: "",
    seoKeywords: "",
    faviconUrl: "",
    bannerMessage: "",
    bannerEnabled: false,
    contactEmail: "",
    twitterUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    discordUrl: "",
    footerText: "",
    enableRegistration: true,
    maintenanceMode: false,
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
        setSettings({
          platformName: data.platformName || "KiraStreams",
          logoUrl: data.logoUrl || "",
          primaryColor: data.primaryColor || "#8b5cf6",
          cdnBaseUrl: data.cdnBaseUrl || "",
          watermarkEnabled: data.watermarkEnabled || false,
          theme: data.theme || "dark",
          siteTagline: data.siteTagline || "",
          seoDescription: data.seoDescription || "",
          seoKeywords: data.seoKeywords || "",
          faviconUrl: data.faviconUrl || "",
          bannerMessage: data.bannerMessage || "",
          bannerEnabled: data.bannerEnabled || false,
          contactEmail: data.contactEmail || "",
          twitterUrl: data.twitterUrl || "",
          facebookUrl: data.facebookUrl || "",
          instagramUrl: data.instagramUrl || "",
          discordUrl: data.discordUrl || "",
          footerText: data.footerText || "",
          enableRegistration: data.enableRegistration ?? true,
          maintenanceMode: data.maintenanceMode || false,
        });
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
          <p className="text-muted-foreground">Comprehensive platform customization and configuration</p>
        </div>
        <Link href="/" target="_blank">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview Site
          </Button>
        </Link>
      </div>

      <form onSubmit={saveSettings}>
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-0.5 h-auto p-0.5 sm:p-1">
            <TabsTrigger value="branding" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-sm">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Brand</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-sm">
              <Search className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-sm">
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Social</span>
            </TabsTrigger>
            <TabsTrigger value="banner" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Banner</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-violet-500" />
                  Branding & Visual Identity
                </CardTitle>
                <CardDescription>Customize your platform's visual appearance and branding elements</CardDescription>
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
                    <Label>Site Tagline</Label>
                    <Input
                      value={settings.siteTagline}
                      onChange={(e) => setSettings({ ...settings, siteTagline: e.target.value })}
                      placeholder="Your Ultimate Streaming Destination"
                    />
                    <p className="text-xs text-muted-foreground">Short description under site name</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Header logo (leave empty for default)</p>
                </div>

                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input
                    placeholder="https://example.com/favicon.ico"
                    value={settings.faviconUrl}
                    onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Browser tab icon (leave empty for default)</p>
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
                  <p className="text-xs text-muted-foreground">Used for buttons and accents across the site</p>
                </div>

                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <Input
                    value={settings.footerText}
                    onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                    placeholder="© 2025 KiraStreams. All rights reserved."
                  />
                  <p className="text-xs text-muted-foreground">Custom copyright text (leave empty for default)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-violet-500" />
                  Search Engine Optimization
                </CardTitle>
                <CardDescription>Optimize your site for search engines and improve discoverability</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={settings.seoDescription}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    placeholder="Watch free online movies and TV shows on KiraStreams. Ad-free streaming with unlimited HD content."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Shown in search results (150-160 characters recommended)</p>
                </div>

                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <Textarea
                    value={settings.seoKeywords}
                    onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                    placeholder="free movies, streaming, watch online, tv shows, ad-free streaming"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated keywords for search engines</p>
                </div>

                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    placeholder="contact@kirastreams.com"
                  />
                  <p className="text-xs text-muted-foreground">Public contact email for inquiries</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-violet-500" />
                  Social Media Links
                </CardTitle>
                <CardDescription>Connect your social media profiles (displayed in footer)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Twitter / X URL</Label>
                    <Input
                      value={settings.twitterUrl}
                      onChange={(e) => setSettings({ ...settings, twitterUrl: e.target.value })}
                      placeholder="https://twitter.com/kirastreams"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input
                      value={settings.facebookUrl}
                      onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/kirastreams"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input
                      value={settings.instagramUrl}
                      onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/kirastreams"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discord Server URL</Label>
                    <Input
                      value={settings.discordUrl}
                      onChange={(e) => setSettings({ ...settings, discordUrl: e.target.value })}
                      placeholder="https://discord.gg/kirastreams"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Social links will appear as icons in the footer when provided</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banner Tab */}
          <TabsContent value="banner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-violet-500" />
                  Announcement Banner
                </CardTitle>
                <CardDescription>Display important announcements at the top of your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Banner</Label>
                    <p className="text-sm text-muted-foreground">Show announcement banner site-wide</p>
                  </div>
                  <Switch
                    checked={settings.bannerEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, bannerEnabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Banner Message</Label>
                  <Textarea
                    value={settings.bannerMessage}
                    onChange={(e) => setSettings({ ...settings, bannerMessage: e.target.value })}
                    placeholder="🎉 New feature launched! Check out our latest updates."
                    rows={2}
                    disabled={!settings.bannerEnabled}
                  />
                  <p className="text-xs text-muted-foreground">Message shown in the banner (supports emojis)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-violet-500" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>Platform configuration and operational controls</CardDescription>
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
                    <Label>Enable User Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to create accounts</p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
                  />
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

                <div className="flex items-center justify-between p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-destructive">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable site access for non-admin users</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                  />
                </div>
                {settings.maintenanceMode && (
                  <p className="text-sm text-destructive">⚠️ Maintenance mode is active. Regular users cannot access the site.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="bg-violet-600 hover:bg-violet-500">
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
          <Link href="/" target="_blank">
            <Button type="button" variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview Changes
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}