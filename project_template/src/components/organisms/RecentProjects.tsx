"use client";

import { useEffect, useState } from "react";
import { ProjectsList } from "@/components/shared/ProjectsList";
import type { ProjectItem } from "@/components/shared/ProjectsList";
import { StatCard } from "@/components/shared/StatCard";

export function RecentProjects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <StatCard title="Projects" value="…" description="Loading…" />
        <ProjectsList projects={[]} title="Recent projects" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StatCard
        title="Projects"
        value={projects.length}
        description="Total in database"
      />
      <ProjectsList projects={projects} title="Recent projects" />
    </div>
  );
}
