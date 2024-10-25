# Real-Time Audio Transcription & Translation

A high-performance Node.js engine that captures Windows system audio via FFmpeg, streams it to AssemblyAI for real-time transcription, and displays translated captions as an overlay — with no perceptible delay.

---

## How It Works

The system runs a three-stage pipeline:

**1. Capture (FFmpeg)** — Uses Windows' native `dshow` driver to read directly from the sound card (Stereo Mix). Audio is converted to 16-bit PCM at 16,000 Hz and piped as raw bytes.

**2. Stream (Node.js)** — A child process runs FFmpeg in parallel without blocking the main thread. An `isReady` flag ensures audio is only sent after the WebSocket handshake with AssemblyAI completes.

**3. Transcribe & Translate (AssemblyAI + DeepL)** — AssemblyAI processes the audio buffer in real time. On `end_of_turn`, the completed sentence is sent to DeepL and the translation is rendered on the overlay.

---

## Prerequisites

### Windows Dependencies

| Tool | Purpose | Download |
|------|---------|----------|
| **Visual Studio Build Tools** | C++ compiler for native modules | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/visual-cpp-build-tools/) |
| **CMake** | Build system (add to PATH during install) | [cmake.org](https://cmake.org/download/) |
| **Python** | Required by some Node.js native deps | [python.org](https://python.org) |
| **FFmpeg** | Audio capture | [ffmpeg.org](https://ffmpeg.org/download.html) |

> When installing Visual Studio Build Tools, select **"Desktop development with C++"**.

---

## Installation

```bash
npm install
```

Create a `.env` file at the root:

```env
ASSEMBLYAI_API_KEY=your_key_here
DEEPL_API_KEY=your_key_here
FFMPEG_AUDIO_DEVICE=audio=Stereo Mix (Realtek High Definition Audio)
```

---

## Finding Your Audio Device Name

If you switch computers or the device name changes, run:

```bash
ffmpeg -list_devices true -f dshow -i dummy
```

Copy the exact name shown and paste it into `FFMPEG_AUDIO_DEVICE` in your `.env`.

Also make sure **Stereo Mix is enabled** in Windows:

> Control Panel → Sound → Recording → Right-click → Show Disabled Devices → Enable Stereo Mix

---

## Running

```bash
node main.js
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Socket is not open` | Audio sent before WebSocket opened | Check that the `open` event fires before FFmpeg streams data |
| No transcription output | Stereo Mix muted or disabled | Open Windows Volume Mixer and set Stereo Mix volume above 50% |
| `Error 410` | API key expired or endpoint changed | Generate a new key at [assemblyai.com](https://www.assemblyai.com) |
| DeepL `Too many requests` | Translating every partial word | Only translate on `end_of_turn` — already handled in current code |

---

## Architecture Notes

### Why FFmpeg instead of `node-record-lpcm16`?
The library abstracts FFmpeg/SoX in a way that makes Windows-specific failures nearly impossible to debug. FFmpeg lets you specify the exact device name via `-i "audio=..."`, making it deterministic across machines.

### Why the `isReady` flag?
FFmpeg starts sending audio immediately. Without a guard, bytes arrive before AssemblyAI's WebSocket is open — causing silent drops or crashes. The flag syncs the two async processes.

### Why translate only on `end_of_turn`?
AssemblyAI emits partial transcripts on every detected word. Calling DeepL on each partial triggers rate limiting instantly. Waiting for the full sentence gives one API call per utterance and eliminates duplicate translations on the overlay.

---

## Tech Stack

- [AssemblyAI](https://www.assemblyai.com) — Streaming speech-to-text
- [DeepL](https://www.deepl.com) — Neural machine translation  
- [Electron](https://www.electronjs.org) — Transparent overlay window
- [FFmpeg](https://ffmpeg.org) — Low-level audio capture via DirectShow