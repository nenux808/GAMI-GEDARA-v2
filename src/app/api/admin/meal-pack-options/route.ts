import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      meal_pack_menu_id,
      name,
      description,
      category,
      sort_order,
      price,
      is_active,
    } = body;

    console.log("Meal pack option payload:", body);

    if (!meal_pack_menu_id || !name) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          debug: { meal_pack_menu_id, name },
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("meal_pack_options")
      .insert({
        meal_pack_menu_id,
        name,
        description: description || "",
        category: category || "other",
        sort_order: Number(sort_order || 0),
        price: Number(price || 0),
        is_active: Boolean(is_active),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Meal pack option insert error:", error);
      return NextResponse.json(
        { error: "Failed to create option" },
        { status: 500 }
      );
    }

    return NextResponse.json({ option: data });
  } catch (error) {
    console.error("Meal pack option API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}