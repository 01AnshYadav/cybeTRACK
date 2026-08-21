"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { User } from "@supabase/supabase-js";
import { RoadmapRow, RoadmapSkillRow } from "@/lib/types/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/input";

export default function RoadmapPage() {
  const [user, setUser] = useState<User | null>(null);
  const [roadmaps, setRoadmaps] = useState<RoadmapRow[]>([]);
  const [skills, setSkills] = useState<RoadmapSkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRoadmap, setEditingRoadmap] = useState<RoadmapRow | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "beginner",
    progress: 0,
    status: "not_started",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState<string | undefined>(undefined);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      // Fetch roadmaps
      const {
        data: roadmapsData,
        error: roadmapsError,
      } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (roadmapsError) {
        console.error("Error fetching roadmaps:", roadmapsError);
        setError("Error loading roadmaps");
      } else {
        setRoadmaps(roadmapsData as RoadmapRow[]);

        // Fetch skills for each roadmap and calculate progress
        const skillsPromises = (roadmapsData as RoadmapRow[]).map(
          (roadmap) =>
            supabase
              .from("roadmap_skills")
              .select("*")
              .eq("roadmap_id", roadmap.id)
        );

        Promise.all(skillsPromises)
          .then((skillResults) => {
            const allSkills: RoadmapSkillRow[] = [];
            skillResults.forEach((result, index) => {
              if (result.data) {
                allSkills.push(...result.data as RoadmapSkillRow[]);
              }
            });

            setSkills(allSkills);
          })
          .catch((err) =>
            console.error("Error fetching skills:", err)
          );
      }
      setLoading(false);
    };

    init();
  }, [router]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-red-400">Please log in</span>
      </div>
    );
  }

  // Calculate roadmap progress from skills
  const roadmapProgress = roadmaps.map((roadmap) => {
    const roadmapSkills = skills.filter(
      (skill) => skill.roadmap_id === roadmap.id
    );
    if (roadmapSkills.length === 0) {
      return { roadmap, progress: 0, skillCount: 0 };
    }
    const totalProgress =
      roadmapSkills.reduce(
        (sum, skill) => sum + (skill.progress || 0),
        0
      ) / roadmapSkills.length;
    return { roadmap, progress: Math.round(totalProgress), skillCount: roadmapSkills.length };
  });

  // Helper to get status class
  const getStatusClass = (status: string) => {
    if (status === "completed") return "text-green-400";
    if (status === "in_progress") return "text-indigo-300";
    return "text-gray-400";
  };

  const handleSaveRoadmap = async (roadmapId: string, data: {
    title: string;
    description: string;
    domain: string;
    status: string;
  }) => {
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from("roadmaps")
        .update({
          title: data.title || undefined,
          description: data.description || undefined,
          domain: data.domain || undefined,
          status: data.status,
        })
        .eq("id", roadmapId);

      if (error) throw error;

      setSuccess("Roadmap updated successfully");
      setEditingRoadmap(null);
      window.location.reload();
    } catch (err: unknown) {
      setError(
        (err as Error).message || "Failed to update roadmap"
      );
    }
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;

    try {
      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", roadmapId);

      if (error) throw error;

      setSuccess("Roadmap deleted successfully");
      window.location.reload();
    } catch (err: unknown) {
      setError(
        (err as Error).message || "Failed to delete roadmap"
      );
    }
  };

  const handleAddSkill = async (roadmapId: string) => {
    setError(null);

    try {
      const { error } = await supabase
        .from("roadmap_skills")
        .insert({
          roadmap_id: roadmapId,
          skill_name: newSkill.name,
          level: newSkill.level,
          progress: newSkill.progress,
          status: newSkill.status,
        });

      if (error) throw error;

      setSuccess("Skill added successfully");
      setNewSkill({
        name: "",
        level: "beginner",
        progress: 0,
        status: "not_started",
      });
      window.location.reload();
    } catch (err: unknown) {
      setError(
        (err as Error).message || "Failed to add skill"
      );
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!window.confirm("Are you sure you want to remove this skill?")) return;

    try {
      const { error } = await supabase
        .from("roadmap_skills")
        .delete()
        .eq("id", skillId);

      if (error) throw error;

      setSuccess("Skill removed successfully");
      window.location.reload();
    } catch (err: unknown) {
      setError(
        (err as Error).message || "Failed to remove skill"
      );
    }
  };

  const handleSkillStatusChange = async (
    skillId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("roadmap_skills")
        .update({ status: newStatus })
        .eq("id", skillId);

      if (error) throw error;
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error updating skill status:", err);
    }
  };

  const handleSkillProgressChange = async (
    skillId: string,
    newProgress: number
  ) => {
    try {
      const { error } = await supabase
        .from("roadmap_skills")
        .update({ progress: newProgress })
        .eq("id", skillId);

      if (error) throw error;
      window.location.reload();
    } catch (err: unknown) {
      console.error("Error updating skill progress:", err);
    }
  };

  const handleGenerateFromPdf = async () => {
    if (!pdfFile || !user) return;
    setError(null);
    setSuccess(null);
    setGenerating(true);

    try {
      // 1. Upload PDF to API
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await fetch("/api/roadmap/generate-from-pdf", {
        method: "POST",
        body: formData,
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error || "PDF processing failed.");
      }

      const skills: { skill_name: string; level: string }[] = body.skills;
      if (!skills || skills.length === 0) {
        throw new Error("No skills found in the PDF.");
      }

      // 2. Create roadmap row
      const { data: roadmapData, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          title: "Imported Roadmap",
          status: "active",
        })
        .select()
        .single();

      if (roadmapError || !roadmapData) {
        throw new Error(
          `Failed to create roadmap: ${roadmapError?.message || "Unknown error"}`
        );
      }

      // 3. Bulk-insert skills
      const skillRows = skills.map((s, i) => ({
        roadmap_id: roadmapData.id,
        skill_name: s.skill_name,
        level: s.level || "beginner",
        status: "pending",
        progress: 0,
      }));

      const { error: skillsError } = await supabase
        .from("roadmap_skills")
        .insert(skillRows);

      if (skillsError) {
        throw new Error(
          `Roadmap created but failed to add skills: ${skillsError.message}`
        );
      }

      setSuccess(`Imported ${skills.length} skills from your PDF.`);
      setPdfFile(null);
      window.location.reload();
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to generate roadmap from PDF.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-fg p-6 sm:p-8">
      <header className="border-b dark:border-gray-600 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">
            Learning Roadmap
          </h1>
          <a href="/dashboard" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Create New Roadmap Form */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-3">Create New Roadmap</h3>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;

            supabase
              .from("roadmaps")
              .insert({
                user_id: user.id,
                title,
                description: description || undefined,
                domain: domain || undefined,
                status: "active",
              })
              .then(({ error }) => {
                if (error) console.error("Error creating roadmap:", error);
                else {
                  setTitle("");
                  setDescription("");
                  setDomain(undefined);
                  window.location.reload();
                }
              });
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Roadmap Title
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Web Security Mastery"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe your learning goals for this roadmap..."
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Cybersecurity Domain
                </label>
                <select
                  value={domain || ""}
                  onChange={(e) => setDomain(e.target.value as string)}
                  className="w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select domain (optional)</option>
                  <option value="Networking">Networking</option>
                  <option value="Web Security">Web Security</option>
                  <option value="Forensics">Forensics</option>
                  <option value="Cryptography">Cryptography</option>
                  <option value="SOC">SOC</option>
                  <option value="CTF">CTF</option>
                  <option value="GovSec">Governance Security</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 transition-colors shadow-sm shadow-indigo-600/20"
                >
                  Create Roadmap
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="flex h-12 w-full items-center justify-center rounded-full border border-gray-400 px-5 transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Generate from PDF */}
        <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
          <h3 className="font-medium mb-3">Generate Roadmap from PDF</h3>
          <p className="text-sm text-gray-400 mb-4">
            Upload a learning roadmap PDF and extract the skills into a new roadmap automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-sm text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
            <button
              onClick={handleGenerateFromPdf}
              disabled={!pdfFile || generating}
              className="flex h-10 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 transition-colors shadow-sm shadow-indigo-600/20"
            >
              {generating ? "Reading your roadmap..." : "Generate from PDF"}
            </button>
          </div>
        </div>

        {/* Roadmaps with Skills */}
        {roadmaps.length > 0 ? (
          <div className="space-y-6">
            {roadmaps.map((roadmap) => {
              const progressInfo = roadmapProgress.find(
                (pr) => pr.roadmap.id === roadmap.id
              );
              const roadmapSkills = skills.filter(
                (skill) => skill.roadmap_id === roadmap.id
              );
              const completedSkills = roadmapSkills.filter(
                (skill) => skill.status === "completed"
              );

              return (
                <div
                  key={roadmap.id}
                  className="bg-gray-800/50 rounded-lg p-6 border-t dark:border-gray-600"
                >
                  {/* Roadmap Header with Edit/Delete */}
                  <div className="flex items-between justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingRoadmap?.id === roadmap.id ? (
                          <Input
                            value={editingRoadmap.title || ""}
                            onChange={(e) =>
                              setEditingRoadmap({
                                ...editingRoadmap,
                                title: e.target.value,
                              })
                            }
                            className="w-full rounded border border-gray-600 px-3 py-2 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        ) : (
                          <span>{roadmap.title}</span>
                        )}</h2>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {roadmap.description || "No description set"}
                      </p>

                      {/* Edit button - show when not editing */}
 {!editingRoadmap?.id && (
                        <Button
                          variant="outline"
                          className="text-xs py-1 px-2 mb-2"
                          onClick={() => setEditingRoadmap(roadmap)}
                        >
                          Edit
                        </Button>
                      )}

                      {/* Save/Cancel form when editing */}
                      {editingRoadmap?.id === roadmap.id && (
                        <div className="mt-2">
                          <Button
                            variant="primary"
                            className="w-full text-sm mb-1"
                            onClick={() =>
                              handleSaveRoadmap(roadmap.id, {
                                title: editingRoadmap.title || "",
                                description: editingRoadmap.description || "",
                                domain: editingRoadmap.domain || "",
                                status: editingRoadmap.status,
                              })
                            }
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={() => setEditingRoadmap(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-medium ${
                          roadmap.status === "completed"
                            ? "text-green-400"
                            : "text-indigo-300"
                        }`}
                      >
                        {roadmap.status}
                      </span>

                      {!editingRoadmap?.id && (
                        <button
                          onClick={() => handleDeleteRoadmap(roadmap.id)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors ml-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress and Skill Info */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-400">
                        Progress:{" "}
                      </span>
                      <span className="text-xs">
                        {progressInfo?.progress}%{" "}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({progressInfo?.skillCount || 0} skills)
                      </span>
                    </div>

                    <div className="relative">
                      <div
                        className="bg-gray-800/30 rounded-full h-2"
                      >
                        <div
                          className="bg-indigo-600 rounded-full h-2 absolute inset-0"
                          style={{ width: (progressInfo?.progress || 0) > 0 ? `${progressInfo?.progress}%` : "0%" }}
                        ></div>
                      </div>
                    </div>

                    {roadmapSkills.length > 0 ? (
                      <p className="text-xs text-gray-400 mt-1">
                        Skills:{" "}
                        {roadmapSkills.length > 0
                          ? roadmapSkills
                              .map(
                                (skill) => ` <span className="bg-indigo-500/20 text-indigo-300 rounded px-1 py-0.5 text-xs me-1">${skill.skill_name}</span>`
                              )
                              .join("")
                          : "No skills"}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">No skills added yet</p>
                    )}
                  </div>

                  {/* Add Skill Form */}
                  <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    <h4 className="text-sm font-medium mb-3">Add Skill/Topic</h4>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!newSkill.name.trim()) return;

                      supabase
                        .from("roadmap_skills")
                        .insert({
                          roadmap_id: roadmap.id,
                          skill_name: newSkill.name,
                          level: newSkill.level,
                          progress: newSkill.progress,
                          status: newSkill.status,
                        })
                        .then(({ error }) => {
                          if (error) console.error("Error adding skill:", error);
                          else {
                            setSuccess("Skill added successfully");
                            setNewSkill({
                              name: "",
                              level: "beginner",
                              progress: 0,
                              status: "not_started",
                            });
                            window.location.reload();
                          }
                        });
                    }}>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Skill Name
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g., Linux"
                            value={newSkill.name}
                            onChange={(e) =>
                              setNewSkill({ ...newSkill, name: e.target.value })
                            }
                            className="w-full rounded border border-gray-600 px-3 py-2 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Level
                            </label>
                            <select
                              value={newSkill.level}
                              onChange={(e) =>
                                setNewSkill({ ...newSkill, level: e.target.value })
                              }
                              className="w-full rounded border border-gray-600 px-3 py-2 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Progress
                            </label>
                            <Input
                              type="number"
                              value={`${newSkill.progress}`}
                              onChange={(e) =>
                                setNewSkill({ ...newSkill, progress: Number(e.target.value) })
                              }
                              className="w-full rounded border border-gray-600 px-3 py-2 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Status
                          </label>
                          <select
                            value={newSkill.status}
                            onChange={(e) =>
                              setNewSkill({ ...newSkill, status: e.target.value })
                            }
                            className="w-full rounded border border-gray-600 px-3 py-2 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="flex h-10 w-full items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 transition-colors shadow-sm shadow-indigo-600/20"
                          >
                            Add Skill
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewSkill({
                                name: "",
                                level: "beginner",
                                progress: 0,
                                status: "not_started",
                              });
                            }}
                            className="flex h-10 w-full items-center justify-center rounded-full border border-gray-400 px-5 transition-colors hover:bg-gray-700"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No roadmaps yet</p>
            <p className="text-sm mt-2">
              Create your first roadmap to track your cybersecurity learning journey.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}