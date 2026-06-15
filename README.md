# website

Visit at [pankajkumar.xyz](https://pankajkumar.xyz)

---

## Stack

- Framework: [Zola](https://www.getzola.org/)
- Theme:  Inspiration from [mr-karan.dev](https://mrkaran.dev) which is adapted from [zola-bearblog](https://codeberg.org/alanpearce/zola-bearblog).
- I have enhanced it further to meet my needs with some added functionality like Global Search modal, Back to Top button and making the Navigation menu mobile responsive.

### Local

```bash
zola serve --drafts
```

### If you want to generate OG Images, before committing code, git actions does this automatically while deploying, use below command for local testing.

```bash
uv run scripts/generate_og_images.py
```
