import os
import torch
import functools
import sys
import asyncio
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from TTS.api import TTS
from werkzeug.utils import secure_filename
import edge_tts

# --- THE NEURAL SHIELD (MASTER BYPASS) ---

# 1. Provide dummies for ALL problematic modules
class DummyModule:
    def __getattr__(self, name): return lambda *args, **kwargs: None
    def __call__(self, *args, **kwargs): return None

# Block the modules that cause the crash
sys.modules['torchcodec'] = DummyModule()
sys.modules['TTS.tts.layers.xtts.stream_generator'] = DummyModule()

# 2. Force Security Bypass
original_load = torch.load
@functools.wraps(original_load)
def patched_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return original_load(*args, **kwargs)
torch.load = patched_load

print("✔ Neural Shield: ACTIVE (Bypassing Codec & Streamer errors)")

app = Flask(__name__)
CORS(app)

os.environ["COQUI_TOS_AGREED"] = "1"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'voice_samples')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'outputs')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Language Mapping for Edge TTS (High-Quality Indian Voices)
EDGE_VOICES = {
    "ta": "ta-IN-PallaviNeural",
    "te": "te-IN-ShrutiNeural",
    "kn": "kn-IN-SapnaNeural",
    "hi": "hi-IN-SwaraNeural"
}

# Supported Clone Languages (XTTS Native)
CLONE_LANGS = ['en', 'hi', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh-cn', 'hu', 'ko', 'ja']

# Initialize XTTS v2
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"--- Initialization: Neural Engine starting on {device} ---")
print("--- Please wait 1-2 minutes for model loading... ---")

# Standard initialization
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True if device=="cuda" else False).to(device)
print("\n🚀 NEURAL ENGINE IS FULLY ONLINE & HYBRID-ENABLED!")

@app.route("/upload_sample", methods=["POST"])
def upload_sample():
    if 'file' not in request.files: return jsonify({"error": "No file"}), 400
    file = request.files['file']
    twin_id = request.form.get("twin_id", "default")
    filename = secure_filename(f"{twin_id}.wav")
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    print(f"✔ SAVED VOICE RECURRENCE: {path}")
    return jsonify({"message": "Sample saved", "path": path})

@app.route("/clone", methods=["POST"])
def clone_and_speak():
    data = request.json
    text = data.get("text")
    twin_id = data.get("twin_id", "default")
    language = data.get("language", "en") # 'ta', 'te', 'kn', etc.
    
    output_path = os.path.join(OUTPUT_FOLDER, f"{twin_id}_output.wav")

    # --- PATH A: Native Edge Neural for South Indian Pack ---
    if language in ["ta", "te", "kn"]:
        try:
            print(f"🎙 GENERATING NEURAL RESPONSE [Language: {language}]...")
            voice_id = EDGE_VOICES.get(language, "en-IN-NeerjaNeural")
            communicate = edge_tts.Communicate(text, voice_id)
            asyncio.run(communicate.save(output_path))
            return send_file(output_path, mimetype="audio/wav")
        except Exception as e:
            print(f"Edge Fallback Error: {e}")

    # --- PATH B: XTTS Personal Clone Pack ---
    specific_voice = os.path.join(UPLOAD_FOLDER, f"{twin_id}.wav")
    speaker_wav = specific_voice if os.path.exists(specific_voice) else None
    if not speaker_wav:
        all_samples = [f for f in os.listdir(UPLOAD_FOLDER) if f.endswith('.wav')]
        if all_samples: speaker_wav = os.path.join(UPLOAD_FOLDER, all_samples[0])

    try:
        # Standardize language code
        xtts_lang = "en"
        if language in CLONE_LANGS: xtts_lang = language
        elif language == "hi": xtts_lang = "hi"

        print(f"🎙 SYNTHESIZING CLONE [Lang: {xtts_lang}]: '{text[:30]}...'")
        tts.tts_to_file(
            text=text, 
            speaker_wav=speaker_wav, 
            language=xtts_lang, 
            file_path=output_path
        )
        return send_file(output_path, mimetype="audio/wav")
    except Exception as e:
        print(f"❌ Synthesis Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=False)
