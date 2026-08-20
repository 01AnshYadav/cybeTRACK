/**
 * CyberSync Progress Engine
 * 
 * Deterministic progress calculation system.
 * 
 * Hierarchy: Resource → Skill → Roadmap → Domain
 * 
 * All calculations are based on actual user data from Supabase.
 * No AI, no fake scores, no placeholder statistics.
 */

/**
 * Calculate skill progress.
 * 
 * @param skillProgress Manual progress value (0-100) from user input
 * @param resourcesCompleted Number of resources completed for this skill
 * @param totalResources Total number of resources associated with this skill
 * @returns Progress percentage (0-100)
 */
export function calculateSkillProgress(
  skillProgress: number,
  resourcesCompleted: number,
  totalResources: number
): number {
  if (totalResources === 0) return skillProgress;

  // If there are resources, weight the progress:
  // 70% manual progress + 30% resource completion
  const resourceCompletion = (resourcesCompleted / totalResources) * 100;
  return Math.round(0.7 * skillProgress + 0.3 * resourceCompletion);
}

/**
 * Calculate roadmap progress from skills.
 * 
 * @param skills Array of roadmap skills with progress values
 * @returns Overall roadmap progress percentage (0-100)
 */
export function calculateRoadmapProgress(skills: { progress: number }[]): number {
  if (skills.length === 0) return 0;

  const average = skills.reduce((sum, skill) => sum + skill.progress, 0) / skills.length;
  return Math.round(average);
}

/**
 * Calculate overall progress from multiple roadmaps.
 * 
 * @param roadmapProgresses Array of roadmap progress percentages
 * @returns Overall progress percentage (0-100)
 */
export function calculateOverallProgress(roadmapProgresses: number[]): number {
  if (roadmapProgresses.length === 0) return 0;

  const average = roadmapProgresses.reduce((sum, progress) => sum + progress, 0) / roadmapProgresses.length;
  return Math.round(average);
}

/**
 * Get status color class based on progress percentage.
 * 
 * @param progress Progress percentage (0-100)
 * @returns Tailwind CSS class name
 */
export function getProgressColorClass(progress: number): string {
  if (progress >= 80) return "text-green-400";
  if (progress >= 50) return "text-indigo-300";
  return "text-gray-400";
}

/**
 * Get status text based on progress percentage.
 * 
 * @param progress Progress percentage (0-100)
 * @returns Status string
 */
export function getProgressStatus(progress: number): string {
  if (progress >= 100) return "completed";
  if (progress >= 50) return "in_progress";
  return "not_started";
}

/**
 * Calculate skill progress combining manual progress and resource completion.
 * 
 * This is the central progress calculation used across CyberSync.
 * 
 * @param skill The roadmap skill with manual progress
 * @param resources Associated resources for this skill
 * @param totalAssociatedResources Total number of associated resources
 * @returns Combined progress percentage (0-100)
 */
export function calculateCombinedSkillProgress(
  skill: { progress: number; resources?: { completed: boolean }[] },
  totalAssociatedResources: number
): number {
  const manualProgress = skill.progress || 0;

  if (totalAssociatedResources === 0) return manualProgress;

  const resourcesCompleted = (skill.resources || []).filter(
    (r) => r.completed
  ).length;

  return calculateSkillProgress(manualProgress, resourcesCompleted, totalAssociatedResources);
}