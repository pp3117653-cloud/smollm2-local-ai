#!/usr/bin/env python3
"""Run SmolLM2-360M-Instruct locally via Hugging Face Transformers."""
import argparse
import sys

MODEL_ID = "HuggingFaceTB/SmolLM2-360M-Instruct"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--offline", action="store_true", help="Do not access the network; use cached model files only")
    parser.add_argument("--max-new-tokens", type=int, default=256, help="Maximum generated tokens per reply (default: 256)")
    args = parser.parse_args()
    if args.max_new_tokens < 1 or args.max_new_tokens > 2048:
        parser.error("--max-new-tokens must be between 1 and 2048")

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except ImportError as exc:
        print("Dependencies are missing. Install them with: python -m pip install -r requirements.txt", file=sys.stderr)
        raise SystemExit(1) from exc

    print(f"Loading {MODEL_ID} (first run downloads the model; this may take a few minutes)...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, local_files_only=args.offline)
        model = AutoModelForCausalLM.from_pretrained(MODEL_ID, local_files_only=args.offline)
    except Exception as exc:
        print(f"Could not load the model: {exc}", file=sys.stderr)
        if args.offline:
            print("Try once online with: python chat.py", file=sys.stderr)
        raise SystemExit(1) from exc

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    model.eval()
    print(f"Ready on {device}. Type /exit to quit.\n")
    history = []
    while True:
        try:
            prompt = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye.")
            break
        if prompt.lower() in {"/exit", "/quit"}:
            print("Bye.")
            break
        if not prompt:
            continue
        history.append({"role": "user", "content": prompt})
        encoded = tokenizer.apply_chat_template(
            history,
            add_generation_prompt=True,
            tokenize=True,
            return_dict=True,
            return_tensors="pt",
        ).to(device)
        with torch.inference_mode():
            output = model.generate(
                **encoded,
                max_new_tokens=args.max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id,
            )
        answer = tokenizer.decode(output[0, encoded["input_ids"].shape[-1]:], skip_special_tokens=True).strip()
        print(f"AI: {answer}\n")
        history.append({"role": "assistant", "content": answer})


if __name__ == "__main__":
    main()
