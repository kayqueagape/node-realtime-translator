import { AssemblyAI } from "assemblyai";
import { spawn } from "child_process";
import "dotenv/config";
import { translate } from "./deepl.js";
import { updateCaption } from "./overlay.js";

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export async function startTranscription(targetLanguage) {
  const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });

  const transcriber = client.streaming.transcriber({
    sampleRate: 16000,
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

  const debouncedTranslate = debounce(async (text) => {
    const translation = await translate(text, targetLanguage.code);
    updateCaption(translation);
    process.stdout.write(`\n${translation.padEnd(100)}\x1b[1A`);
  }, 100);

  transcriber.on("turn", async (turn) => {
    if (!turn.transcript) return;

    process.stdout.write(`\r ${turn.transcript.padEnd(100)}`);

    if (turn.end_of_turn) {
      debouncedTranslate.cancel?.();
      const translation = await translate(turn.transcript, targetLanguage.code);
      updateCaption(translation);
      process.stdout.write(`\n${translation.padEnd(100)}\x1b[1A`);
      process.stdout.write("\n\n");
    } else {
      debouncedTranslate(turn.transcript);
    }
  });

  transcriber.on("error", (error) => console.error("AssemblyAI error:", error));

  const ffmpegAudioDevice = process.env.FFMPEG_AUDIO_DEVICE || "audio=Mixagem estéreo (Realtek High Definition Audio)";

  const ffmpeg = spawn("ffmpeg", [
    "-f", "dshow",
    "-i", ffmpegAudioDevice,
    "-ar", "16000",
    "-ac", "1",
    "-f", "s16le",
    "-"
  ]);

  ffmpeg.stdout.on("data", (data) => {
    if (isReady) transcriber.sendAudio(data);
  });

  console.log("Connecting to AssemblyAI...");
  transcriber.connect();

  process.on("SIGINT", async () => {
    console.log("\nClosing...");
    ffmpeg.kill();
    await transcriber.close();
    process.exit();
  });
}