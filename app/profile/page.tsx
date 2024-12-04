'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileSection } from "@/components/ui/profile-section";
import { GoldDisplay } from '@/components/ui/gold-display';
import { auth } from '@/lib/firebase/config';
import { updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile } from '@/lib/firebase/profile';
import { toast } from 'sonner';
import { 
  User, 
  Code2, 
  Quote, 
  Calendar, 
  Heart,
  Loader2 
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    displayName: '',
    codeforcesHandle: '',
    motto: '',
    birthday: '',
    interests: '',
    email: '',
    gold: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const { profile: userProfile, error } = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile({
          displayName: userProfile.displayName || '',
          codeforcesHandle: userProfile.codeforcesHandle || '',
          motto: userProfile.motto || '',
          birthday: userProfile.birthday || '',
          interests: userProfile.interests || '',
          email: userProfile.email || '',
          gold: userProfile.gold || 0
        });
      }
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Update Firebase Auth display name
      await updateProfile(user, {
        displayName: profile.displayName
      });

      // Update Firestore profile
      const { error } = await updateUserProfile(user.uid, {
        ...profile,
        email: user.email!
      });

      if (error) throw new Error(error);

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <GoldDisplay amount={profile.gold} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ProfileSection 
          title="Basic Information" 
          icon={<User className="h-5 w-5" />}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                placeholder="Your display name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </ProfileSection>

        <ProfileSection 
          title="Codeforces Integration" 
          icon={<Code2 className="h-5 w-5" />}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Codeforces Handle</label>
            <Input
              name="codeforcesHandle"
              value={profile.codeforcesHandle}
              onChange={handleChange}
              placeholder="Your Codeforces username"
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Link your Codeforces account to track your progress
            </p>
          </div>
        </ProfileSection>

        <ProfileSection 
          title="Personal Details" 
          icon={<Heart className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Birthday</label>
              <Input
                type="date"
                name="birthday"
                value={profile.birthday}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motto</label>
              <Input
                name="motto"
                value={profile.motto}
                onChange={handleChange}
                placeholder="Your personal motto"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Interests</label>
              <Textarea
                name="interests"
                value={profile.interests}
                onChange={handleChange}
                placeholder="Tell us about your interests..."
                disabled={loading}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </ProfileSection>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </form>
    </div>
  );
}