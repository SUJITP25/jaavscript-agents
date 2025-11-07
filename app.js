import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import Groq from "groq-sdk/index.mjs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Your tool function
function getTotalExpenses({ from, to }) {
  console.log(`Calling getTotalExpenses Tool for ${from} → ${to}`);
  return "10000";
}

async function main() {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: "Hii, can you get my total expense using the function?",
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "getTotalExpenses",
          description: "Get total expenses between two dates.",
          parameters: {
            type: "object",
            properties: {
              from: {
                type: "string",
                description: "Start date (YYYY-MM-DD)",
              },
              to: {
                type: "string",
                description: "End date (YYYY-MM-DD)",
              },
            },
            required: ["from", "to"],
          },
        },
      },
    ],
  });

  const message = completion.choices[0].message;

  console.log("Tool calls:", JSON.stringify(message.tool_calls, null, 2));

  const toolCalls = message.tool_calls;


  if (!toolCalls) {
    console.log(`Assistant: ${message.content}`);
    return;
  }

  for (const tool of toolCalls) {
    const functionName = tool.function.name;
    const functionArgs = tool.function.arguments;

    let result = "";

    if (functionName === "getTotalExpenses") {
      result = getTotalExpenses(JSON.parse(functionArgs));
    }


    const followUp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: "Hii, can you get my total expense using the function?",
        },
        message, 
        {
          role: "tool",
          tool_call_id: tool.id,
          content: JSON.stringify(result),
        },
      ],
    });

    console.log("✅ Final Answer:");
    console.log(followUp.choices[0].message.content);
  }
}

main();
