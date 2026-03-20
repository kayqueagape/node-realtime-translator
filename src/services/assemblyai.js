import { AssemblyAI } from "assemblyai";
import { spawn }      from "child_process";
import { translate }   from "./deepl.js";
import "dotenv/config";

export async function startTranscription(lingua) {
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

  const transcriber = client.streaming.transcriber({
    sampleRate: 16000,
    //models: u3-rt-pro, universal-streaming-english, universal-streaming-multilingual, whisper-rt;
    speechModel: "universal-streaming-english",
    format_turns: false,
    end_of_turn_confidence_threshold: 0.4,
    min_end_of_turn_silence_when_confident: 400,
    max_turn_silence: 1280,
    vad_threshold: 0.4,
    keyterms_prompt: [],
    prompt: "",
    speaker_labels: false,
    language_detection: false,
    u3_rt_pro_vad_threshold: 0.5
  });

  let isReady = false;

  transcriber.on("open", ({ id }) => {
    console.log(`AssemblyAI Open Session | ID: ${id}`);
    isReady = true;
  });

  transcriber.on("turn", async (turn) => {
    if (!turn.transcript) return;

    process.stdout.write(`\r ${turn.transcript.padEnd(100)}`);

    const traducao = await translate(turn.transcript, lingua.codigo);
    process.stdout.write(`\n${traducao.padEnd(100)}\x1b[1A`); // turn 1 line

    // break a line and reset
    if (turn.end_of_turn) {
      process.stdout.write("\n\n");
    }
  });


  transcriber.on("error", (error) => console.error("Erro AssemblyAI:", error));

  const ffmpeg = spawn("ffmpeg", [
    "-f", "dshow",
    "-i", "audio=Mixagem estéreo (Realtek High Definition Audio)",
    "-ar", "16000",
    "-ac", "1",
    "-f", "s16le",
    "-",
  ]);

  ffmpeg.stdout.on("data", (data) => {
    if (isReady) transcriber.sendAudio(data);
  });

  console.log(" Connecting to AssemblyAI...");
  transcriber.connect();

  process.on("SIGINT", async () => {
    console.log("\n Closing...");
    ffmpeg.kill();
    await transcriber.close();
    process.exit();
  });
}