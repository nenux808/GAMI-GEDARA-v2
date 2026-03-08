import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("ADMIN USER:", user?.id, user?.email, userError);

  if (!user) {
    redirect("/organizer-login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  console.log("ADMIN PROFILE:", profile, profileError);

  if (!profile || profile.role !== "admin") {
    redirect("/organizer-login");
  }

  return <>{children}</>;
}