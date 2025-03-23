# PR Image Width Adjuster

Automatically adjust the display width of images in Pull Request descriptions by converting Markdown to HTML img tags.

## Purpose

This GitHub Action was created to help React Native app developers who frequently add screenshots to their repositories. It automatically detects image URLs in pull request descriptions and adds a width attribute to control their display size without physically resizing the images.

## Features

- Automatically detects image URLs (jpg, jpeg, png) in pull request descriptions
- Converts Markdown image syntax to HTML `<img>` tags with width attribute
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
        uses: mljlynch/image-resize-github-action@v1.0.1
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

1. Add images to your pull request description using standard Markdown syntax: `![description](image_url)`
2. The action will automatically:
   - Detect image URLs in the PR description
   - Convert them to HTML `<img>` tags with the specified width
   - Update the PR description with the HTML tags

## How It's Different

Our previous approach physically resized images by downloading, resizing, and re-uploading them as GitHub Gists. This new approach is:

- **Faster**: No image processing or uploading required
- **Simpler**: Fewer dependencies and potential points of failure
- **More reliable**: Original image URLs are preserved

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
