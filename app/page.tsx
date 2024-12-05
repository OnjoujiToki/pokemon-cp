// app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code2, Trophy, Gamepad2, BookOpen, Target, Users } from "lucide-react";
import Link from 'next/link';
import Head from "next/head";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pokémon CP Platform - Learn Programming with Pokémon',
  description: 'Solve competitive programming challenges and catch Pokémon',
}

export default function Home() {
  const features = [
    {
      title: "Solve Challenges",
      description: "Take on Codeforces programming challenges to test your skills",
      icon: <Code2 className="h-6 w-6" />,
    },
    {
      title: "Catch Pokémon",
      description: "Earn Pokémon as rewards for completing challenges",
      icon: <Gamepad2 className="h-6 w-6" />,
    },
    {
      title: "Earn Achievements",
      description: "Track your progress and unlock special rewards",
      icon: <Trophy className="h-6 w-6" />,
    },
  ];

  const aboutSections = [
    {
      title: "Learn & Grow",
      description: "Improve your programming skills through structured challenges and problems from Codeforces",
      icon: <BookOpen className="h-6 w-6" />,
    },
    {
      title: "Goal-Oriented",
      description: "Set personal targets and track your progress with our comprehensive dashboard",
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: "Community",
      description: "Join a community of developers who share your passion for coding and Pokémon",
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    
    <main className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <Badge variant="secondary" className="px-4 py-1">
          Beta Version 1.0
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Pokémon CP Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master coding challenges on Codeforces while building your Pokémon collection.
          Learn, compete, and catch 'em all!
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/about">
              Learn More
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center">Platform Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">About the Platform</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pokémon CP Platform combines competitive programming with the fun of collecting Pokémon. 
            Solve coding challenges, earn rewards, and build your collection!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {aboutSections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-primary/10 mb-4">
                  {section.icon}
                </div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              <ArrowRight className="mr-2 h-4 w-4" />
              Explore the Platform
            </Link>
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-accent/50 rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Ready to Begin Your Journey?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Join our community of developers who combine their passion for coding with
          the excitement of collecting Pokémon.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/register">
            Start Your Adventure
          </Link>
        </Button>
      </div>
    </main>
  );
}
