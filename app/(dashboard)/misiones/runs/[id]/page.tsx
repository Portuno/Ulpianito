import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerProfile } from "@/lib/auth/profile";
import { MissionRunWizard } from "@/components/missions/mission-run-wizard";
import type { MissionRun, MissionStepEvent } from "@/lib/types/database";

type Props = {
  params: Promise<{ id: string }>;
};

type MissionRunWithMission = MissionRun & {
  missions: { title?: string | null } | null;
};

const MissionRunPage = async ({ params }: Props) => {
  const { id } = await params;
  const supabase = await createClient();
  const { profile, isAdmin } = await getServerProfile();
  if (!profile) redirect("/login");

  const { data: runData } = await supabase
    .from("mission_runs")
    .select("*, missions(title)")
    .eq("id", id)
    .single();
  const run = (runData as MissionRunWithMission | null) ?? null;

  if (!run || run.despacho_id !== profile.despacho_id) {
    notFound();
  }

  const { data: eventsData } = await supabase
    .from("mission_step_events")
    .select("*")
    .eq("run_id", id)
    .order("created_at", { ascending: true });
  const events = (eventsData as MissionStepEvent[] | null) ?? [];

  return (
    <MissionRunWizard
      run={run}
      events={events}
      missionTitle={(run.missions as { title?: string } | null)?.title ?? "Misión"}
      isAdmin={isAdmin}
    />
  );
};

export default MissionRunPage;
