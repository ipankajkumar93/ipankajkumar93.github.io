# website

Visit at [pankajkumar.xyz](https://pankajkumar.xyz)

---

## Stack

- Framework: [Zola](https://www.getzola.org/)
- Deployment - Cloudflare Pages
- Theme:  Inspiration from [mr-karan.dev](https://mrkaran.dev) which is adapted from [zola-bearblog](https://codeberg.org/alanpearce/zola-bearblog).
- I have enhanced it further to meet my needs with some added functionality
    - Global Search modal
    - Back to Top button
    - Navigation menu mobile responsive.
    - AJAX Pagination
    - Other UI changes for better user experience

### Local

```bash
zola serve --drafts
```

- (Optional) If you want to generate OG Images, run below command before committing code, git actions does this automatically while deploying, use below command for local testing.

```bash
uv run scripts/generate_og_images.py
```
