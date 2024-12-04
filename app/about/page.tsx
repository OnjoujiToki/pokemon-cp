import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Trophy, 
  Gamepad2, 
  BookOpen, 
  Target, 
  Users, 
  Zap,
  Star,
  Heart,
  ShoppingBag,
  Store,
  Coins
} from "lucide-react";
import Link from 'next/link';

export default function AboutPage() {
  const sections = [
    {
      title: "What is Pokémon CP Platform?",
      description: "Pokémon CP Platform is an innovative learning platform that combines competitive programming with the excitement of Pokémon collection. Each programming problem type corresponds to a specific Pokémon type, making your learning journey more strategic and engaging.",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: "How It Works",
      description: "Solve programming challenges on Codeforces to encounter themed Pokémon. Dynamic problems yield different types of Pokémon, binary search problems yield Psychic-types, and more! Plus, there's a small chance to encounter Legendary Pokémon!",
      icon: <Star className="h-6 w-6" />,
    },
    {
      title: "Our Mission",
      description: "We aim to make learning competitive programming more enjoyable by creating meaningful connections between problem-solving patterns and Pokémon types. Master both programming concepts and build a diverse Pokémon collection!",
      icon: <Heart className="h-6 w-6" />,
    },
   
  ];

  const features = [
    {
      title: "Type-Matched Pokémon",
      description: "Each programming problem tag corresponds to a specific Pokémon type. Master graph algorithms to catch Ghost-type Pokémon, or tackle data structures for Water-types!",
      icon: <Code2 className="h-6 w-6" />,
    },
    {
      title: "Legendary Encounters",
      description: "Rare chance to encounter Legendary Pokémon with higher CP! But be careful - they're harder to catch and might flee after failed attempts.",
      icon: <Gamepad2 className="h-6 w-6" />,
    },
    {
      title: "Competitive Programming",
      description: "Access a wide range of programming challenges from Codeforces, suitable for all skill levels from beginner to advanced.",
      icon: <Code2 className="h-6 w-6" />,
    },
    {
      title: "Pokémon Collection",
      description: "Earn and collect Pokémon as rewards for solving programming challenges. Each Pokémon has unique CP (Combat Power) based on the difficulty of the challenge.",
      icon: <Gamepad2 className="h-6 w-6" />,
    },
    {
      title: "Achievement System",
      description: "Track your progress and earn achievements as you solve more problems and collect more Pokémon.",
      icon: <Trophy className="h-6 w-6" />,
    },
    {
      title: "Learning Resources",
      description: "Access curated learning materials and problem recommendations to help you improve your programming skills.",
      icon: <BookOpen className="h-6 w-6" />,
    },
  
    {
      title: "Community",
      description: "Join a community of like-minded developers who share your passion for both programming and Pokémon.",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "In-Game Shop",
      description: "Use earned gold to buy different types of Poké Balls. Ultra Balls give you the best chance to catch powerful Pokémon, while regular Poké Balls are perfect for common encounters.",
      icon: <Store className="h-6 w-6" />,
    },
    {
      title: "Economy System",
      description: "Earn gold based on problem difficulty. Harder problems reward more gold, allowing you to purchase better catching equipment and increase your success rate.",
      icon: <Coins className="h-6 w-6" />,
    },
  ];

  return (
    <main className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section with enhanced styling */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent sm:text-6xl">
          Learn More About Pokémon CP
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Where Competitive Programming Meets Pokémon Collection
        </p>
      </div>

      {/* Main Sections with hover effects and gradients */}
      <div className="grid md:grid-cols-3 gap-8">
        {sections.map((section, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader>
              <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
                {section.icon}
              </div>
              <CardTitle className="text-2xl mb-2">{section.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {section.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Features Grid with improved spacing and animations */}
      <div className="space-y-12">
        <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Platform Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            >
              <CardHeader>
                <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section with enhanced styling */}
      <div className="bg-gradient-to-br from-accent/50 to-accent/30 rounded-2xl p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Join our platform today and begin your adventure in competitive programming
          while building your Pokémon collection!
        </p>
        <div className="flex justify-center gap-6 pt-6">
          <Button asChild size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
            <Link href="/register">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
            <Link href="/dashboard">View Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
