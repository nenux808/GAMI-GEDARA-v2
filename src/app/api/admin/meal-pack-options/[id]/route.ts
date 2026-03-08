import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing option ID" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("meal_pack_options")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete meal pack option:", error);
      return NextResponse.json(
        { error: "Failed to delete option" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete meal pack option API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}