# PR Image Width Adjuster

Automatically adjust the display width of images in Pull Request descriptions by converting Markdown to HTML img tags and updating existing HTML img tags.

## Purpose

This GitHub Action was created to help React Native app developers who frequently add screenshots to their repositories. It automatically detects images in pull request descriptions and adds a width attribute to control their display size without physically resizing the images.

## Features

- Handles both formats:
  - Markdown image syntax (`![alt](url)`)
  - HTML img tags (`<img src="url" />`)
- Converts Markdown image syntax to HTML `<img>` tags with width attribute
- Adds width attribute to existing HTML img tags that don't have one
- Preserves the original image URLs and alt text
- No image downloading or processing required
- Configurable target width

## Setup

Add this GitHub Action to your repository's workflow:

```yaml
name: Adjust Image Widths

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  adjust-image-widths:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Adjust image widths in PR description
        uses: mljlynch/image-resize-github-action@v1.0.2
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          width: 500 # Set the desired width for images
```

## Inputs

| Input   | Description                         | Required | Default |
| ------- | ----------------------------------- | -------- | ------- |
| `token` | GitHub token for API access         | Yes      | N/A     |
| `width` | Target width for images (in pixels) | No       | `300`   |

## Usage

1. Add images to your pull request description using either:
   - Standard Markdown syntax: `![description](image_url)`
   - HTML img tags: `<img src="image_url" alt="description" />`
2. The action will automatically:
   - Detect images in the PR description
   - Add width attribute to all image tags
   - Update the PR description with the modified tags

## How It's Different

Our previous approach physically resized images by downloading, resizing, and re-uploading them as GitHub Gists. This new approach is:

- **Faster**: No image processing or uploading required
- **Simpler**: Fewer dependencies and potential points of failure
- **More reliable**: Original image URLs are preserved
- **More versatile**: Handles both Markdown and HTML image formats

## Development

### Building the Action

This repository includes pre-built files in the `dist` directory, which are necessary for the GitHub Action to work. If you make changes to the source code, you'll need to rebuild:

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Commit the updated dist files
git add dist/
git commit -m "Update dist files"
```

The repository is configured with a GitHub workflow that automatically builds the action when changes are pushed to the `main` branch.

## License

MIT
