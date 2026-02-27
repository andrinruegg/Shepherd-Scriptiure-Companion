
import { Users, BookOpen, Flame, Trophy, Star, Crown, Map, Footprints } from 'lucide-react';

export interface Milestone {
    id: string;
    category: 'social' | 'reading' | 'consistency' | 'journey';
    title: string;
    description: string;
    threshold: number;
    icon: any;
    tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

export const MILESTONES: Milestone[] = [
    // --- Social Milestones ---
    { id: 'friends-1', category: 'social', title: 'Friendly Face', description: 'Add 1 Friend', threshold: 1, icon: Users, tier: 'bronze' },
    { id: 'friends-3', category: 'social', title: 'Community Builder', description: 'Add 3 Friends', threshold: 3, icon: Users, tier: 'silver' },
    { id: 'friends-10', category: 'social', title: 'Shepherd of Many', description: 'Add 10 Friends', threshold: 10, icon: Users, tier: 'gold' },

    // --- Reading Milestones (Books Completed) ---
    { id: 'books-1', category: 'reading', title: 'First Scroll', description: 'Finish 1 Book of the Bible', threshold: 1, icon: BookOpen, tier: 'bronze' },
    { id: 'books-5', category: 'reading', title: 'Scholar', description: 'Finish 5 Books of the Bible', threshold: 5, icon: BookOpen, tier: 'silver' },
    { id: 'books-10', category: 'reading', title: 'Disciple', description: 'Finish 10 Books of the Bible', threshold: 10, icon: BookOpen, tier: 'gold' },
    { id: 'books-66', category: 'reading', title: 'Master of the Word', description: 'Finish the entire Bible', threshold: 66, icon: Crown, tier: 'diamond' },

    // --- Consistency Milestones (Streak) ---
    { id: 'streak-3', category: 'consistency', title: 'Dedication', description: '3 Day Streak', threshold: 3, icon: Flame, tier: 'bronze' },
    { id: 'streak-7', category: 'consistency', title: 'Faithful', description: '7 Day Streak', threshold: 7, icon: Flame, tier: 'silver' },
    { id: 'streak-30', category: 'consistency', title: 'Unshakable', description: '30 Day Streak', threshold: 30, icon: Flame, tier: 'gold' },

    // --- Journey Milestones (Path Progress) ---
    { id: 'path-1', category: 'journey', title: 'First Step', description: 'Complete 1 Path Level', threshold: 1, icon: Footprints, tier: 'bronze' },
    { id: 'path-5', category: 'journey', title: 'Traveler', description: 'Complete 5 Path Levels', threshold: 5, icon: Map, tier: 'silver' },
    { id: 'path-10', category: 'journey', title: 'Explorer', description: 'Complete 10 Path Levels', threshold: 10, icon: Star, tier: 'gold' },
    { id: 'path-66', category: 'journey', title: 'The Way', description: 'Complete the Journey', threshold: 66, icon: Trophy, tier: 'diamond' },
];
