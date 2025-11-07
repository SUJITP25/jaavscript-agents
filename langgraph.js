import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { ChatGroq } from "@langchain/groq";




import readline from "readline/promises";
import { stdin as input, stdout as output } from "node:process";

const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile"
})

async function callModel(state) {
    console.log("🧠 Calling Groq LLM...");
    const response = await llm.invoke(state.messages)
    return { messages: [...state.messages, response] }
}


// We need to Provide the feature of Browsing Internet to the our LLM. 
// This will make an Agents

const workflow = new StateGraph(MessagesAnnotation);
workflow.addNode("agent", callModel);
workflow.addEdge(START, "agent");
workflow.addEdge("agent", END);
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

        console.log("AI Message", finalState.messages[1].content)

    }

    rl.close();
}

main();
