# SmolLM2 360M Instruct — local starter

A small, instruction-tuned text model you can run on your own computer. Inference runs locally after the model files have been downloaded; the model is not sent to a hosted AI service. The first run needs an internet connection and roughly 1 GB of free disk space for packages, cache, and weights.

**Model:** [HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)  
**Model license:** Apache-2.0 (see the upstream model card for terms and attribution).  
**This repository does not include model weights.** `transformers` downloads the official weights to the local Hugging Face cache when you first launch it. This avoids GitHub file/LFS storage and bandwidth constraints.

## Requirements

- Python 3.10 or newer
- Internet for initial setup/download; after that, normal text generation can run offline
- CPU works (generation may be slow); a compatible GPU is optional

## Quick start

```bash
git clone https://github.com/pp3117653-cloud/smollm2-local-ai.git
cd smollm2-local-ai
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python chat.py
```

Type a prompt and press Enter. Type `/exit` to quit. On first launch, the model (about 724 MB in its standard weights) is downloaded from Hugging Face. This is a small model and can make mistakes; verify important information.

## Offline mode after download

```bash
python chat.py --offline
```

If the weights have not already been cached, offline mode will fail with a clear download/cache error. To choose another local cache location, set `HF_HOME` before running.

## Privacy

Prompts are processed on your computer once the model and libraries are installed. The initial model download contacts Hugging Face. This starter does not send prompts to GitHub or a remote inference API.

## Attribution

SmolLM2 is published by Hugging Face. Model card, license, and technical details: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct. Upstream code and research: https://github.com/huggingface/smollm and https://arxiv.org/abs/2502.02737. This repository is an independent local-run starter, not an official Hugging Face project.
