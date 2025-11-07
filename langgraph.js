import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";



import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";




async function callModel(state) {
    console.log("🧠 Calling Groq LLM...");
    const response = await llm.invoke(state.messages)
    return { messages: [...state.messages, response] }
}


const tavilyTool = new DynamicStructuredTool({
  name: "tavily_search",
  description: "Search the web using Tavily for real-time information.",
  schema: z.object({
    query: z.string().describe("The query to search on the web."),
  }),
  func: async ({ query }) => {
    const tvly = tavily({ apiKey: process.env.TRAVILEY_API_KEY });
    const result = await tvly.search(query);
    return JSON.stringify(result.results.slice(0, 2));
  },
});


const tools = [tavilyTool];
const toolNode = new ToolNode(tools);

const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile"
}).bindTools(tools)



// We need to Provide the feature of Browsing Internet to the our LLM. 
// This will make an Agents



function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "__end__";
}


// Langgraph Workflow
const workflow = new StateGraph(MessagesAnnotation);
workflow.addNode("agent", callModel);
workflow.addNode("tools", toolNode);
workflow.addEdge(START, "agent");
workflow.addConditionalEdges("agent", shouldContinue, {
  tools: "tools",
  __end__: END,
});
workflow.addEdge("tools", "agent");
const app = workflow.compile();



async function main() {
    const rl = readline.createInterface({ input, output });

    console.log("🤖 Groq Chatbot (type 'exit' to quit)\n");

    while (true) {
        const userInput = await rl.question("You: ");
        if (userInput.toLowerCase() === "exit") break;

        const finalState = await app.invoke({
            messages: [{ role: "user", content: userInput }],
        });

        console.log("AI Message", finalState)

    }

    rl.close();
}

main()
