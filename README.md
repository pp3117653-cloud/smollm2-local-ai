# Tuesday — local AI chat

Tuesday is a lightweight chat dashboard for SmolLM2 360M Instruct. Use the browser dashboard to run the model in your browser, or use the Python CLI below to run it on your computer. The model is not sent to a hosted inference service.

**Model:** [HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)  
**Model license:** Apache-2.0 (see the upstream model card for terms and attribution).  
**This repository does not include model weights.** `transformers` downloads the official weights to the local Hugging Face cache when you first launch it. This avoids GitHub file/LFS storage and bandwidth constraints.

## Tuesday browser dashboard

The dashboard is in [`site/`](site/). It uses Transformers.js in your browser and downloads the quantized ONNX model from Hugging Face on first use. The first model download is several hundred megabytes and requires an internet connection; inference then runs in the browser. Browser inference has its own model cache, separate from the Python CLI's cache. Chats remain in page memory and are cleared when you refresh or use the reset button.

The dashboard needs a modern browser and enough memory for a 360M model. It defaults to browser CPU/WASM for broad compatibility; performance depends on the device and browser. The static page and JavaScript library are served from GitHub Pages/CDN, and the model files are fetched from Hugging Face. Prompts and replies are not submitted to those services for inference.

The workflow at [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes only the `site/` folder whenever `master` is updated or the workflow is run manually. The Pages publishing source must be set to **GitHub Actions** in the repository's Pages settings. The resulting website is public to anyone with its URL, even if the source repository is private (where the account plan permits Pages for private repositories).

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
