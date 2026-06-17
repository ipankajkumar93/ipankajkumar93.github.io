#!/bin/bash
set -euo pipefail

echo ">>> Installing uv..."
curl -LsSf https://astral.sh/uv/0.7.12/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo ">>> Generating OG images..."
uv run scripts/generate_og_images.py

echo ">>> Building Zola site..."
zola build

echo ">>> Done."
