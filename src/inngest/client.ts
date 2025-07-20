
import { inngest } from "./inngest.js";
import { functions as aiFunctions } from "./aiFunctions";

export { inngest };

// Import functions directly from aiFunctions
export const functions = [...aiFunctions];


// npx inngest-cli@latest dev -u http://localhost:3001/api/inngest