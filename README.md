Real-Time Audio Transcription (Node.js + AssemblyAI + FFmpeg)
This project performs real-time audio transcription by capturing Windows Stereo Mix audio and streaming it to the AssemblyAI API.


A high-performance Node.js engine that captures Windows system audio via FFmpeg and pipes raw PCM buffers to AssemblyAI for instantaneous multilingual transcription and translation.


## Process Architecture
The system works through a three-stage pipeline:

Capture (FFmpeg): We use Windows' native `dshow` driver to read the sound hardware.

Streaming (Node.js pipe): Audio is converted to RAW format (16-bit PCM) and sent to the server in chunks via WebSocket.

Processing (AssemblyAI): The AI processes the buffer, detects the language, and returns the final transcription.

## System Components
1. FFmpeg (The Capturer)
We replaced old libraries (`node-record-lpcm16`) with Node.js' native `spawn` calling FFmpeg.

Why? FFmpeg allows selecting the input device by its exact name (for example: `audio=Stereo Mix ...`), avoiding common Windows failures when setting default devices.

Configuration: We use 16000 Hz (the AI's standard sample rate) and `s16le` (signed 16-bit PCM).

2. Node.js (The Orchestrator)
The script manages the connection lifecycle:

isReady (control flag): Fixes the "Socket is not open" error, ensuring no audio is sent before the API handshake completes.

spawn: Creates a child process that runs in parallel with Node, delivering high performance byte reads without blocking the main thread.

3. AssemblyAI (The Engine)
We use the official SDK streaming module. The event architecture makes the system asynchronous:

on("open"): Ensures a secure connection.

on("turn"): Returns transcribed text as soon as the AI finishes processing an utterance.

🚀 How to Run
Installation:

Bash
npm install assemblyai
Device verification:
If you switch computers, run the command below to list the exact input name:

Bash
ffmpeg -list_devices true -f dshow -i dummy
Run:

Bash
node main.js
⚠️ Common Troubleshooting
"Socket is not open": Check that AssemblyAI's `open` event fires before FFmpeg sends audio data.

No transcription: Check Windows Volume Mixer to ensure Stereo Mix is enabled and volume is above ~50%.

Error 410: Your API key expired or was invalidated. Generate a new key in the AssemblyAI dashboard.




## Notes / Lessons Learned

1. The "black box" problem with libraries
You started by trying `node-record-lpcm16`. The issue with this library is that it tries to hide FFmpeg/SoX complexity from you, but when something goes wrong (like missing a default device on Windows), it doesn't provide the tools to debug. You got stuck with `sox FAIL` errors without realizing the culprit wasn't the Node.js code—it was missing driver permissions or configuration on Windows.

2. DirectShow instability (dshow)
You went through the nightmare of audio capture on Windows. The operating system treats audio as private and protected.

The challenge: understand that Windows doesn't allow any process to "grab" the audio from your sound card. You had to learn how to identify the device via `ffmpeg -list_devices`, which requires system administration knowledge—not just programming.

3. Async handshake fragility (asynchronous connections)
You suffered from "Socket is not open" and 410 (Gone) errors. This happened because audio is continuous (FFmpeg sends bytes all the time), but the AssemblyAI API connection needs an exact moment to "open the door".

The difficulty: synchronizing the raw audio data stream with WebSocket opening. You had to learn buffering and connection state (`isReady`), ensuring audio wasn't "wasted" while the API wasn't ready yet.

4. API evolution / obsolescence
You were hit by error 410, a cruel obstacle: you were doing everything right in the code, but the endpoint you used in the old documentation simply no longer existed. This is a real challenge in the LLM/AI space in 2026: APIs evolve at a speed that documentation and internet tutorials can't keep up with.











Prerequisites (Windows):

1. Visual Studio Build Tools (C++ compiler)
Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
During installation, select: "Desktop development with C++"

2. CMake
Download: https://cmake.org/download/
Enable: "Add CMake to system PATH" during installation

3. Python (if needed)
Download: https://python.org

