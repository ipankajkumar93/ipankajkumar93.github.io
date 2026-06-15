#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow"]
# ///
"""
OG Image Generator for pankajkumar.xyz

Generates social preview images for blog posts that don't have a custom og_preview_img.
Uses the blog's warm terracotta aesthetic with clean, modern typography.
"""

import hashlib
import json
import re
import sys
import tomllib
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Configuration
CONFIG = {
    "author": "Pankaj Kumar",
    "site": "pankajkumar.xyz",
    "width": 1200,
    "height": 630,
    "padding": 80,
    # Dark Mode Background with Large Dark Box
    "bg_color": (9, 9, 11),         # Zinc 950
    "glow_color_1": (40, 112, 194), # Cobalt Blue
    "glow_color_2": (20, 60, 110),  # Deep Blue
    "card_bg": (15, 15, 18, 255),   # Solid dark box
    "card_border": (39, 39, 42, 255), # Subtle border
    "title_color": (250, 250, 250), # Crisp White
    "desc_color": (161, 161, 170),  # Zinc 400
    "author_color": (228, 228, 231), # Zinc 200
    "domain_color": (161, 161, 170), # Zinc 400
}

CACHE_VERSION = 1


class OGImageGenerator:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.content_dirs = [
            project_root / "content" / "posts",
            project_root / "content" / "rtd",
            project_root / "content" / "travel",
        ]
        self.output_dir = project_root / "static" / "images" / "og"
        self.cache_file = project_root / ".og_cache.json"
        self.cache = self._load_cache()

        self.width = CONFIG["width"]
        self.height = CONFIG["height"]
        self.padding = CONFIG["padding"]
        self.content_width = self.width - (2 * self.padding)

        self.fonts = self._load_fonts()
        self._load_site_config()
        self.footer_items = self._get_footer_items()

    def _load_site_config(self):
        """Parse config.toml once to dynamically set site metadata and category mappings."""
        self.site_config = {}
        self.cat_map = {}
        try:
            with open(self.project_root / "config.toml", "rb") as f:
                self.site_config = tomllib.load(f)
                
            # Update global CONFIG dynamically
            if title := self.site_config.get("title"):
                CONFIG["author"] = title
                
            if base_url := self.site_config.get("base_url"):
                domain = base_url.replace("https://", "").replace("http://", "").strip("/")
                CONFIG["site"] = domain
                
            # Build dynamic category map from main_menu
            menu = self.site_config.get("extra", {}).get("main_menu", [])
            for item in menu:
                name = item.get("name", "")
                url = item.get("url", "")
                if url.startswith("@/") and "/_index.md" in url:
                    dir_name = url.replace("@/", "").replace("/_index.md", "")
                    self.cat_map[dir_name] = name
                    
        except Exception as e:
            print(f"Warning: Could not load site config: {e}")
            self.cat_map = {"posts": "Post", "rtd": "RTD", "travel": "Travel"}

    def _get_footer_items(self) -> str:
        """Parse config.toml to get menu items, excluding Home and Contact, in lowercase."""
        try:
            with open(self.project_root / "config.toml", "rb") as f:
                config = tomllib.load(f)
                menu = config.get("extra", {}).get("main_menu", [])
                items = [m.get("name", "").lower() for m in menu]
                items = [i for i in items if i and i not in ("home", "contact")]
                return "   •   ".join(items)
        except Exception as e:
            print(f"Warning: Could not parse config for footer items: {e}")
            return "posts   •   projects   •   services   •   talks   •   rtd   •   travel"

    def _load_fonts(self):
        """Load fonts with fallbacks."""
        fonts = {}
        
        bold_font = self.project_root / "static" / "fonts" / "Roboto-Bold.ttf"
        regular_font = self.project_root / "static" / "fonts" / "Roboto-Regular.ttf"
        
        if bold_font.exists() and regular_font.exists():
            fonts["title_large"] = ImageFont.truetype(str(bold_font), 62)
            fonts["title_medium"] = ImageFont.truetype(str(bold_font), 50)
            fonts["title_small"] = ImageFont.truetype(str(bold_font), 42)
            fonts["desc"] = ImageFont.truetype(str(regular_font), 30)
            fonts["author"] = ImageFont.truetype(str(bold_font), 28)
            fonts["domain"] = ImageFont.truetype(str(regular_font), 24)
        else:
            print("Warning: Custom fonts not found, using defaults")
            fonts = {k: ImageFont.load_default() for k in ["title_large", "title_medium", "title_small", "desc", "author", "domain"]}
            
        return fonts

    def _load_cache(self) -> dict:
        """Load generation cache."""
        if self.cache_file.exists():
            try:
                with open(self.cache_file) as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
        return {}

    def _save_cache(self):
        """Save generation cache."""
        with open(self.cache_file, "w") as f:
            json.dump(self.cache, f, indent=2)

    def _content_hash(self, title: str, description: str, category: str = None) -> str:
        """Generate hash for caching."""
        content = f"{CACHE_VERSION}:{title}:{description}:{category}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _parse_frontmatter(self, content: str) -> dict | None:
        """Parse TOML frontmatter from markdown file."""
        match = re.match(r"^\+\+\+\s*\n(.*?)\n\+\+\+", content, re.DOTALL)
        if not match:
            return None

        frontmatter = {}
        fm_content = match.group(1)

        # Simple TOML parsing for what we need
        for line in fm_content.split("\n"):
            line = line.strip()
            if "=" in line and not line.startswith("["):
                key, value = line.split("=", 1)
                key = key.strip()
                
                # Strip out inline TOML comments
                if "#" in value:
                    # Only split if the # is outside quotes (simple heuristic for this basic parser)
                    # For a robust parser we'd use a real toml library, but this works for standard usage
                    value = value.split("#", 1)[0]
                    
                value = value.strip().strip('"').strip("'")
                frontmatter[key] = value

        # Check for og_preview_img in [extra] section
        if "[extra]" in fm_content:
            extra_match = re.search(r"\[extra\](.*?)(?=\[|$)", fm_content, re.DOTALL)
            if extra_match:
                for line in extra_match.group(1).split("\n"):
                    line = line.strip()
                    if line.startswith("og_preview_img"):
                        frontmatter["og_preview_img"] = (
                            line.split("=", 1)[1].strip().strip('"').strip("'")
                        )

        return frontmatter

    def _wrap_text(self, text: str, font, max_width: int) -> list[str]:
        """Wrap text to fit within max_width."""
        if not text:
            return []

        dummy = Image.new("RGB", (1, 1))
        draw = ImageDraw.Draw(dummy)

        words = text.split()
        lines = []
        current_line = []

        for word in words:
            test_line = " ".join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            width = bbox[2] - bbox[0]

            if width <= max_width or not current_line:
                current_line.append(word)
            else:
                lines.append(" ".join(current_line))
                current_line = [word]

        if current_line:
            lines.append(" ".join(current_line))

        return lines

    def _get_title_font(self, title: str):
        """Select font size based on title length."""
        if len(title) <= 35:
            return self.fonts["title_large"]
        elif len(title) <= 60:
            return self.fonts["title_medium"]
        else:
            return self.fonts["title_small"]

    def _text_height(self, text: str, font) -> int:
        """Get height of rendered text."""
        dummy = Image.new("RGB", (1, 1))
        draw = ImageDraw.Draw(dummy)
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[3] - bbox[1]

    def _create_glow_background(self) -> Image.Image:
        """Create a premium background with soft glowing orbs."""
        base = Image.new("RGBA", (self.width, self.height), CONFIG["bg_color"] + (255,))
        glow = Image.new("RGBA", (self.width, self.height), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        
        # Draw glowing orbs
        glow_draw.ellipse([-self.width*0.2, -self.height*0.5, self.width*0.6, self.height*1.2], fill=CONFIG["glow_color_1"] + (45,))
        glow_draw.ellipse([self.width*0.4, -self.height*0.2, self.width*1.2, self.height*1.5], fill=CONFIG["glow_color_2"] + (40,))
        
        # Apply heavy blur for smooth gradient effect
        glow = glow.filter(ImageFilter.GaussianBlur(140))
        base = Image.alpha_composite(base, glow)
        return base

    def _get_circle_avatar(self, size: int) -> Image.Image | None:
        """Load and crop the profile avatar into a circle."""
        avatar_path = self.project_root / "static" / "images" / "website" / "profile.jpg"
        if not avatar_path.exists():
            return None
            
        try:
            img = Image.open(avatar_path).convert("RGBA")
            min_dim = min(img.size)
            left = (img.width - min_dim) / 2
            top = (img.height - min_dim) / 2
            img = img.crop((left, top, left + min_dim, top + min_dim))
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Anti-aliasing trick: Draw mask at 4x resolution, then scale down
            aa_scale = 4
            mask_size = size * aa_scale
            mask = Image.new('L', (mask_size, mask_size), 0)
            draw = ImageDraw.Draw(mask)
            draw.ellipse((0, 0, mask_size, mask_size), fill=255)
            mask = mask.resize((size, size), Image.Resampling.LANCZOS)
            
            output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            output.paste(img, (0, 0), mask)
            
            return output
        except Exception:
            return None

    def generate_image(self, title: str, description: str, output_path: Path, category: str = None):
        """Generate the OG image."""
        img = self._create_glow_background()
        draw = ImageDraw.Draw(img, "RGBA")

        # Draw larger black card
        pad = 40  # Reduced padding to make the card much larger
        card_rect = [pad, pad, self.width - pad, self.height - pad]
        draw.rounded_rectangle(card_rect, radius=24, fill=CONFIG["card_bg"], outline=CONFIG["card_border"], width=2)

        # Avatar & Author Header
        y = pad + 48
        x = pad + 64
        
        avatar_size = 96
        avatar = self._get_circle_avatar(avatar_size)
        
        if avatar:
            img.paste(avatar, (int(x), int(y)), avatar)
            
            # Center the text vertically relative to the avatar
            text_x = x + avatar_size + 24
            
            # We want author name and domain to sit aligned with the avatar.
            author_y = y + 16
            domain_y = author_y + 36 # Gap between name and website
            
            draw.text((text_x, author_y), CONFIG["author"], fill=CONFIG["author_color"], font=self.fonts["author"])
            draw.text((text_x, domain_y), CONFIG["site"], fill=CONFIG["domain_color"], font=self.fonts["domain"])
            y += avatar_size + 48
        else:
            draw.text((x, y), CONFIG["author"], fill=CONFIG["author_color"], font=self.fonts["author"])
            y += 50

        # Draw Title
        title_font = self._get_title_font(title)
        title_lines = self._wrap_text(title, title_font, self.width - (2 * pad) - 128)

        for line in title_lines[:3]:
            if category == "home":
                bbox = draw.textbbox((0, 0), line, font=title_font)
                line_x = (self.width - (bbox[2] - bbox[0])) / 2
                draw.text((line_x, y), line, fill=CONFIG["title_color"], font=title_font)
            else:
                draw.text((x, y), line, fill=CONFIG["title_color"], font=title_font)
            y += self._text_height(line, title_font) + 12

        y += 48

        # Draw Description
        if description:
            desc_font = self.fonts["desc"]
            desc_lines = self._wrap_text(description, desc_font, self.width - (2 * pad) - 128)

            for line in desc_lines[:3]:  # Limit description to 3 lines
                if category == "home":
                    bbox = draw.textbbox((0, 0), line, font=desc_font)
                    line_x = (self.width - (bbox[2] - bbox[0])) / 2
                    draw.text((line_x, y), line, fill=CONFIG["desc_color"], font=desc_font)
                else:
                    draw.text((x, y), line, fill=CONFIG["desc_color"], font=desc_font)
                y += self._text_height(line, desc_font) + 10

        # Draw decorative top-right accent and optional category
        pill_width = 56
        pill_height = 4
        
        # Statically anchor pill to the right margin of the bounding box
        pill_x_end = self.width - pad - 64
        pill_x_start = pill_x_end - pill_width
        
        # Align vertically with the avatar's horizontal center axis
        avatar_y = pad + 48
        avatar_size = 96
        avatar_center_y = avatar_y + (avatar_size / 2)
        pill_y = avatar_center_y - (pill_height / 2)
        
        if category:
            cat_font = self.fonts["domain"]
            cat_text = category.lower()
            cat_bbox = draw.textbbox((0, 0), cat_text, font=cat_font)
            cat_w = cat_bbox[2] - cat_bbox[0]
            cat_visual_center = cat_bbox[1] + (cat_bbox[3] - cat_bbox[1]) / 2
            pill_center_y = pill_y + (pill_height / 2)
            
            cat_x = pill_x_start - cat_w - 16
            cat_y = pill_center_y - cat_visual_center
            draw.text((cat_x, cat_y), cat_text, fill=(113, 113, 122), font=cat_font) # Zinc 500

        draw.rounded_rectangle(
            [pill_x_start, pill_y, pill_x_end, pill_y + pill_height],
            radius=2,
            fill=CONFIG["glow_color_1"] + (200,)
        )

        # Homepage specific bottom-center footer
        if category == "home":
            footer_text = self.footer_items
            footer_font = self.fonts["domain"]
            footer_bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
            footer_w = footer_bbox[2] - footer_bbox[0]
            
            footer_x = (self.width - footer_w) / 2
            
            # The gap from bottom equals the gap the pill has from the right (64px)
            target_bottom_y = self.height - pad - 64
            text_visual_bottom = footer_bbox[3]
            footer_y = target_bottom_y - text_visual_bottom
            
            draw.text((footer_x, footer_y), footer_text, fill=(82, 82, 91), font=footer_font) # Zinc 600

        # Save
        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.convert("RGB").save(output_path, "PNG", optimize=True)

    def process_posts(self) -> tuple[int, int, int]:
        """Process all posts and generate missing OG images."""
        generated = 0
        skipped_custom = 0
        skipped_cached = 0

        self.output_dir.mkdir(parents=True, exist_ok=True)

        for content_dir in self.content_dirs:
            if not content_dir.exists():
                continue
                
            category = self.cat_map.get(content_dir.name, content_dir.name.capitalize())
            
            for md_file in content_dir.glob("*.md"):
                if md_file.name == "_index.md":
                    continue

                content = md_file.read_text()
                fm = self._parse_frontmatter(content)

                if not fm or not fm.get("title"):
                    continue

                # Skip if custom og_preview_img is set
                if fm.get("og_preview_img"):
                    skipped_custom += 1
                    continue

                title = fm.get("title", "")
                description = fm.get("description", "")
                
                # Zola uses the slug from frontmatter if it exists, otherwise it defaults to the filename
                slug = fm.get("slug")
                if not slug:
                    slug = md_file.stem
                
                # Get the relative path from the content directory to preserve subfolders
                rel_path = md_file.relative_to(self.project_root / "content")
                output_path = self.output_dir / rel_path.parent / f"{slug}.png"

                # Check cache
                content_hash = self._content_hash(title, description, category)
                cache_key = str(output_path.relative_to(self.project_root))

                if output_path.exists() and self.cache.get(cache_key) == content_hash:
                    skipped_cached += 1
                    continue

                # Generate image
                print(f"  Generating: {rel_path.parent}/{slug}.png")
                self.generate_image(title, description, output_path, category)
                self.cache[cache_key] = content_hash
                generated += 1

        self._save_cache()
        return generated, skipped_custom, skipped_cached

    def process_home(self) -> tuple[int, int]:
        """Generate the OG image for the homepage using config.toml."""
        title = self.site_config.get("title", CONFIG["author"])
        description = self.site_config.get("description", "")
            
        self.output_dir.mkdir(parents=True, exist_ok=True)
        output_path = self.output_dir / "home.png"
        
        # Check cache
        content_hash = self._content_hash(title, description, "home")
        cache_key = str(output_path.relative_to(self.project_root))

        if output_path.exists() and self.cache.get(cache_key) == content_hash:
            return 0, 1
            
        print("  Generating: home.png")
        self.generate_image(title, description, output_path, "home")
        self.cache[cache_key] = content_hash
        self._save_cache()
        return 1, 0


def main():
    project_root = Path(__file__).parent.parent

    print("Generating OG images...")
    generator = OGImageGenerator(project_root)
    home_gen, home_cached = generator.process_home()
    generated, skipped_custom, skipped_cached = generator.process_posts()

    total_gen = generated + home_gen
    total_cached = skipped_cached + home_cached

    print(
        f"Done: {total_gen} generated, {skipped_custom} have custom images, {total_cached} cached"
    )


if __name__ == "__main__":
    main()
