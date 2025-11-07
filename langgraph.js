import dotenv from "dotenv";
dotenv.config({ path: "./.env" });


import readline from "readline/promises";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function main(){
    const userInput = await rl.question("You: ")
    console.log("You Said : ", userInput )
}


main()