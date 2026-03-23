import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  let user: { id: string; email?: string | null } | null = null;

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (
      error &&
      error.code !== "refresh_token_not_found" &&
      error.code !== "invalid_grant"
    ) {
      console.error("Admin auth error:", error);
    }

    user = authUser;
  } catch (error) {
    console.warn("Admin auth refresh skipped:", error);
    user = null;
  }

  if (!user) {
    redirect("/organizer-login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Admin profile lookup error:", profileError);
  }

  if (!profile || profile.role !== "admin") {
    redirect("/organizer-login");
  }

  return <>{children}</>;
}