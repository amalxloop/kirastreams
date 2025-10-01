"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/lib/hooks/useAdmin";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Film, Eye } from "lucide-react";

interface TrendData {
  dailyWatchTime: { date: string; hours: number }[];
  topContent: { id: number; title: string; type: string; viewCount: number }[];
}

const COLORS = ["#8b5cf6", "#0ea5e9", "#d946ef", "#10b981"];

export default function AnalyticsPage() {
  const { admin, loading: authLoading } = useAdmin();
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin) fetchTrends();
  }, [admin]);

  async function fetchTrends() {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch("/api/admin/analytics/trends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTrends(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch trends:", error);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Detailed platform analytics and insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-500" />
                Daily Watch Time Trend
              </CardTitle>
              <CardDescription>Last 7 days viewing hours</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends?.dailyWatchTime || []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5 text-fuchsia-500" />
                Top 10 Content by Views
              </CardTitle>
              <CardDescription>Most popular movies and TV shows</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends?.topContent || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="title" type="category" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="viewCount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}