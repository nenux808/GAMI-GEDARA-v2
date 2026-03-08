import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      slug,
      description,
      price,
      image_url,
      spice_level,
      serves,
      is_featured,
      is_active,
    } = body;

    if (!name || !slug || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        slug,
        description: description || "",
        price: Number(price),
        image_url: image_url || null,
        spice_level: spice_level || null,
        serves: serves || null,
        is_featured: Boolean(is_featured),
        is_active: Boolean(is_active),
      })
      .select("*")
      .single();

    if (error) {
      console.error("Product insert error:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error("Product API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing product id" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);

    if (error) {
      console.error("Product delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete API error:", error);
    return NextResponse.json(
      { error: "Failed to process delete request" },
      { status: 500 }
    );
  }
}