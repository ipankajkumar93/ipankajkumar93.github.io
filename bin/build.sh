#!/bin/bash
set -euo pipefail

echo ">>> Installing fonts..."
apt-get update -qq
apt-get install -y -qq \
  fonts-open-sans \
  fonts-noto-core \
  fonts-liberation \
  fonts-dejavu

echo ">>> Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo ">>> Generating OG images..."
uv run scripts/generate_og_images.py

echo ">>> Building Zola site..."
zola build

echo ">>> Done."
