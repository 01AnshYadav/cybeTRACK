/**
 * AI Learning Recommendations - skill-based suggestions system
 * 
 * Provides deterministic recommendations based on:
 * 1. Incomplete skills in user's active roadmaps
 * 2. Skills related to their cybersecurity domains
 * 3. Resources based on their interests and current progress
 * 4. Gap analysis between current skills and target goals
 */

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  related_skill?: string;
  resource_type?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  estimated_time?: string;
}

/**
 * Gets recommendations for incomplete skills in user's active roadmaps
 */
export async function getRoadmapSuggestions(
  userId: string,
  supabase: any
): Promise<Recommendation[]> {
  const { data: roadmaps, error } = await supabase
    .from("roadmaps")
    .select(`
      *,
      roadmap_skills (
        skill_id,
        skills (domain, name, difficulty),
        skills_interests (
          interests
        )
      )
    `)
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching roadmaps for recommendations:", error);
    return [];
  }

  const suggestions: Recommendation[] = [];

  if (!roadmaps || roadmaps.length === 0) {
    return suggestions;
  }

  for (const roadmap of roadmaps) {
    if (!roadmap.roadmap_skills) continue;

    for (const rms of roadmap.roadmap_skills) {
      const skill = rms.skill;
      if (!skill) continue;

      suggestions.push({
        id: `rec-${roadmap.id}-${skill.id}`,
        title: `Master ${skill.name}`,
        description: `Progress through the ${skill.name} module in your ${roadmap.title} roadmap`,
        reason: "Incomplete skill in active roadmap",
        related_skill: skill.id,
        difficulty: skill.difficulty as "beginner" | "intermediate" | "advanced",
        estimated_time: estimateTime(skill.difficulty),
      });

      if (skill.interests && skill.interests.length > 0) {
        for (const interest of skill.interests) {
          suggestions.push({
            id: `rec-res-${roadmap.id}-${interest}`,
            title: `Resources for ${interest}`,
            description: `Find learning materials related to ${interest}`,
            reason: "Interest-based resource recommendation",
            related_skill: skill.id,
            resource_type: "article",
            estimated_time: "30-60 min",
          });
        }
      }
    }
  }

  return suggestions;
}

/**
 * Gets recommendations based on user's cybersecurity domains/interests
 */
export async function getDomainSuggestions(
  userId: string,
  supabase: any
): Promise<Recommendation[]> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("interests")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("Error fetching profile for recommendations:", profileError);
    return [];
  }

  const interests: string[] = profile?.interests || [];

  // Seed domains for recommendation cross-referencing
  const domainMap: Record<string, string[]> = {
    "Network Security": ["Network Traffic Analysis", "Firewall Configuration", "VPN Setup"],
    "Cryptography": ["Encryption Algorithms", "Hash Functions", "Key Management"],
    "Forensics": ["Disk Imaging", "Memory Forensics", "Log Analysis"],
    "Web Security": ["XSS Prevention", "SQL Injection", "CSRF Tokens"],
    "Cloud Security": ["IAM Policies", "S3 Bucket Security", "CloudTrail Monitoring"],
    "Malware Analysis": ["Static Analysis", "Dynamic Analysis", "Malware Reverse Engineering"],
    "Application Security": ["Code Review", "Dependency Scanning", "Secure SDLC"],
  };

  const suggestions: Recommendation[] = [];

  // Suggest topics based on user interests
  for (const interest of interests) {
    const relatedTopics = domainMap[interest] || [
      "Fundamentals",
      "Best Practices",
      "Current Trends",
    ];

    for (const topic of relatedTopics) {
      // Avoid duplicate suggestions
      if (suggestions.some((s) => s.title === topic)) continue;

      suggestions.push({
        id: `rec-domain-${interest}-${topic}`,
        title: topic,
        description: `Learn about ${topic} related to ${interest}`,
        reason: "Domain-based recommendation",
        resource_type: "article",
        estimated_time: "45-90 min",
      });
    }
  }

  // Also suggest foundational topics if no interests are set
  if (interests.length === 0) {
    suggestions.push({
      id: "rec-domain-foundational",
      title: "Cybersecurity Fundamentals",
      description: "Build a strong foundation in core cybersecurity concepts",
      reason: "Foundational knowledge for all security practitioners",
      resource_type: "course",
      estimated_time: "2-3 hours",
    });

    // Add domain-specific foundational topics
    for (const [domain, topics] of Object.entries(domainMap)) {
      suggestions.push({
        id: `rec-domain-${domain}-foundational`,
        title: `${domain} Fundamentals`,
        description: `Introduction to ${domain} principles`,
        reason: "Domain foundation recommendation",
        resource_type: "course",
        estimated_time: "1-2 hours",
      });
    }
  }

  return suggestions;
}

/**
 * Gets resource recommendations based on user's progress and interests
 */
export async function getResourceSuggestions(
  userId: string,
  supabase: any
): Promise<Recommendation[]> {
  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .eq("user_id", userId)
    .eq("visibility", "public");

  if (error) {
    console.error("Error fetching resources for recommendations:", error);
    return [];
  }

  // Get user's roadmaps and their skills to understand what they're learning
  const { data: roadmaps, error: roadmapError } = await supabase
    .from("roadmaps")
    .select(`
      *,
      roadmap_skills (
        skill_id,
        skills (name, domain)
      )
    `)
    .eq("user_id", userId);

  if (roadmapError) {
    console.error("Error fetching roadmaps for recommendations:", roadmapError);
  }

  const suggestions: Recommendation[] = [];

  // If user has public resources, highlight their best ones
  if (resources && resources.length > 0) {
    const completedResources = resources.filter(
      (r: { status: string }) => r.status === "completed"
    );

    if (completedResources.length > 0) {
      suggestions.push({
        id: "rec-own-resources",
        title: "Your Completed Resources",
        description: `${completedResources.length} resources you've marked as complete`,
        reason: "Review your own learning materials",
        resource_type: "repository",
        estimated_time: "Variable",
      });
    }
  }

  // Suggest exploring new resource types based on roadmap skills
  if (roadmaps && roadmaps.length > 0) {
    const allSkills = roadmaps.flatMap((r: any) =>
      r.roadmap_skills?.map((rms: any) => rms.skill?.name)
    );

    // Determine resource types based on skills
    const skillToResourceType: Record<string, string> = {
      "Network Security": "article",
      "Cryptography": "course",
      "Forensics": "lab",
      "Web Security": "article",
      "Cloud Security": "course",
      "Malware Analysis": "lab",
      "Application Security": "article",
    };

    const suggestedTypes = new Set<string>();
    for (const skill of allSkills) {
      const resourceType = skillToResourceType[skill];
      if (resourceType) {
        suggestedTypes.add(resourceType);
      }
    }

    for (const type of suggestedTypes) {
      if (suggestions.some((s: any) => s.resource_type === type)) continue;

      suggestions.push({
        id: `rec-new-${type}`,
        title: `Explore ${type} resources`,
        description: `Find ${type} materials to complement your current learning path`,
        reason: "Resource type diversification",
        resource_type: type,
        estimated_time: "30-60 min",
      });
    }
  }

  // If no specific suggestions, add a general one
  if (suggestions.length === 0) {
    suggestions.push({
      id: "rec-general-resources",
      title: "Discover New Resources",
      description: "Browse curated cybersecurity learning materials",
      reason: "General resource discovery",
      resource_type: "article",
      estimated_time: "15-30 min",
    });
  }

  return suggestions;
}

/**
 * Gets progress gap suggestions - what to learn next based on current progress
 */
export async function getProgressGapSuggestions(
  userId: string,
  supabase: any
): Promise<Recommendation[]> {
  // Get user's goals
  const { data: goals, error: goalsError } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId);

  if (goalsError) {
    console.error("Error fetching goals for recommendations:", goalsError);
    return [];
  }

  // Get user's achievements to understand what they've already mastered
  const { data: achievements, error: achievementsError } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId);

  const achievedSkills: Set<string> = new Set();
  if (achievements && achievements.length > 0) {
    for (const achievement of achievements) {
      // Try to extract skill name from achievement title
      const lowerTitle = achievement.title.toLowerCase();
      if (
        lowerTitle.includes("network") ||
        lowerTitle.includes("crypt") ||
        lowerTitle.includes("forensic") ||
        lowerTitle.includes("web") ||
        lowerTitle.includes("malware")
      ) {
        achievedSkills.add(achievement.title);
      }
    }
  }

  const suggestions: Recommendation[] = [];

  // If there are goals, suggest progress toward them
  if (goals && goals.length > 0) {
    const uncompletedGoals = goals.filter((g: { progress: number }) => g.progress < 100);

    if (uncompletedGoals.length > 0) {
      const nextGoal = uncompletedGoals[0];
      suggestions.push({
        id: "rec-goal-progress",
        title: `Progress toward ${nextGoal.title}`,
        description: `You're at ${nextGoal.progress}% - ${nextGoal.target_date ? `Target: ${new Date(
          nextGoal.target_date
        ).toLocaleDateString()}` : ""}`,
        reason: "Goal progress tracking",
        related_skill: nextGoal.skill_id,
        estimated_time: "Ongoing",
      });
    }
  }

  // Suggest skills related to achieved areas but not yet mastered
  const domainMap: Record<string, string[]> = {
    "Network Security": ["Network Traffic Analysis", "Firewall Configuration"],
    "Cryptography": ["Encryption Algorithms", "Hash Functions"],
    "Forensics": ["Disk Imaging", "Memory Forensics"],
    "Web Security": ["XSS Prevention", "SQL Injection"],
    "Cloud Security": ["IAM Policies", "S3 Bucket Security"],
    "Malware Analysis": ["Static Analysis", "Dynamic Analysis"],
    "Application Security": ["Code Review", "Dependency Scanning"],
  };

  // Check for gaps in each domain the user has engaged with
  for (const [domain, topics] of Object.entries(domainMap)) {
    const hasAchievedInDomain = Array.from(achievedSkills).some((s) =>
      s.toLowerCase().includes(domain.toLowerCase())
    );

    if (hasAchievedInDomain) {
      // Suggest a topic they haven't covered yet
      for (const topic of topics) {
        const alreadyAchieved = Array.from(achievedSkills).some(
          (s: string) => s.toLowerCase() === topic.toLowerCase()
        );

        if (!alreadyAchieved) {
          suggestions.push({
            id: `rec-gap-${domain}-${topic}`,
            title: topic,
            description: `Expand your ${domain} knowledge with ${topic}`,
            reason: "Progress gap analysis",
            related_skill: topic,
            resource_type: "article",
            estimated_time: "45-90 min",
          });
          break; // Only one suggestion per domain
        }
      }
    }
  }

  return suggestions;
}

/**
 * Estimates time based on skill difficulty
 */
function estimateTime(difficulty: string | undefined): string {
  switch (difficulty) {
    case "beginner":
      return "30-60 min";
    case "intermediate":
      return "1-2 hours";
    case "advanced":
      return "2-4 hours";
    default:
      return "1-2 hours";
  }
}