import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dishName, description } = await req.json();
    
    if (!dishName) {
      return new Response(
        JSON.stringify({ error: 'Dish name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing dish: ${dishName}`);

    const systemPrompt = `You are a food analysis expert. Analyze the given dish name and description to identify dietary tags.
Return ONLY valid dietary tags from this list:
- Vegetarian
- Vegan
- Halal
- Kosher
- Gluten-Free
- Dairy-Free
- Egg-Free
- Nut-Free
- Contains Dairy
- Contains Eggs
- Contains Gluten
- Contains Nuts
- Spicy
- Low-Carb
- High-Protein

Be conservative and only include tags you're confident about based on the dish name and description.
Common French dishes: Coq au Vin (contains wine, chicken), Quiche (eggs, dairy, often meat), Cassoulet (meat, beans), Couscous (can be vegetarian), Croque Monsieur (dairy, eggs, meat).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this dish:\nName: ${dishName}\nDescription: ${description || 'No description provided'}` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_tags",
              description: "Return dietary tags for the dish",
              parameters: {
                type: "object",
                properties: {
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of dietary tags that apply to this dish"
                  }
                },
                required: ["tags"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_tags" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    // Extract tags from tool call response
    let tags: string[] = [];
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      tags = args.tags || [];
    }

    console.log("Extracted tags:", tags);

    return new Response(
      JSON.stringify({ tags }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error analyzing dish:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
