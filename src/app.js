import { selectLanguage }    from "./services/deepl.js";
import { startTranscription } from "./services/assemblyai.js";
import "dotenv/config";

export async function startApp() {
  console.log(" Starting the application...\n");

  const language = await selectLanguage();

  await startTranscription(language);
}