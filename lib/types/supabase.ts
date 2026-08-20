export interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  github_username: string;
  interests: string[];
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  domain: string;
  status: string;
  target_date: string;
  created_at: string;
  updated_at: string;
}

export interface RoadmapSkillRow {
  id: string;
  roadmap_id: string;
  skill_name: string;
  level: string;
  progress: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GoalRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  target_date: string;
  progress: number;
  roadmap_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccountRow {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface AchievementRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  earned_at: string;
  metadata: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string;
  metadata: string;
  source: string;
  created_at: string;
}

export interface ResourceRow {
  id: string;
  user_id: string;
  roadmap_skill_id: string;
  title: string;
  description: string;
  url: string;
  resource_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}