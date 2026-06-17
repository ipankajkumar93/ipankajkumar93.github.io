# Zola Makefile

# Variables
ZOLA := zola
SRC_DIR := public

# Default target
all: build

# Serve the site using zola (includes drafts for local preview)
preview:
	$(ZOLA) serve --drafts

# Generate OG images for posts without custom images
og-images:
	@uv run scripts/generate_og_images.py

# Build the site using zola
build: og-images
	$(ZOLA) build

# Update project metadata from GitHub (Currently disabled)
# projects:
# 	@echo "Fetching latest project metadata from GitHub..."
# 	@uv run scripts/fetch_all_github_projects.py ipankajkumar93 > content/projects/data.toml
# 	@echo "Successfully updated content/projects/data.toml"

.PHONY: all preview build og-images