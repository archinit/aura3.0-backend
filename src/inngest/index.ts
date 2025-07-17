import { Inngest } from "inngest";

// Create the inngest client
export const inngest = new Inngest({ id: "aura3.0" });

// Import functions from other files
import { helloWorld } from "./functions";

// Export all functions
export const functions = [
  helloWorld
];
