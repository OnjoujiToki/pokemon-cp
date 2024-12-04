'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Trophy, 
  BarChart3,
  Plus,
  Gamepad2
} from "lucide-react"; 
import Link from "next/link";

export default function AdminPage() {
  const stats = {
    totalUsers: 156,
    totalChallenges: 42,
    activePokemon: 151,
    completionRate: "73%"
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <Link href="/admin/new-challenge">Create Challenge</Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active platform users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing challenges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Available Pokémon</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePokemon}</div>
            <p className="text-xs text-muted-foreground">
              Catchable Pokémon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}</div>
            <p className="text-xs text-muted-foreground">
              Challenge success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Challenge Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/challenges">Manage Challenges</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Pokémon Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/pokemon">Manage Pokémon</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}