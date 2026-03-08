import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      slug,
      description,
      week_of,
      available_from,
      order_cutoff_at,
      pickup_date,
      is_active,
    } = body;

    if (
      !title ||
      !slug ||
      !week_of ||
      !available_from ||
      !order_cutoff_at
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("meal_pack_menus")
      .delete()
      .gt("created_at", "1900-01-01");

    if (deleteError) {
      console.error("Failed to delete old meal packs:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove old meal packs" },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("meal_pack_menus")
      .insert({
        title,
        slug,
        description: description || "",
        week_of,
        available_from,
        order_cutoff_at,
        pickup_date: pickup_date || null,
        is_active: Boolean(is_active),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Meal pack insert error:", error);
      return NextResponse.json(
        { error: "Failed to create meal pack" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mealPack: data });
  } catch (error) {
    console.error("Meal pack API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}