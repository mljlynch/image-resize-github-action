# Image Resize GitHub Action

Automatically resize images in Pull Request descriptions to a specified width.

## Purpose

This GitHub Action was created to help React Native app developers who frequently add screenshots to their repositories. It automatically detects image URLs in pull request descriptions and resizes them to a configurable width (default: 300px), then updates the PR description with the resized images.

## Features

- Automatically detects image URLs (jpg, jpeg, png) in pull request descriptions
- Downloads and resizes images to a specified width while maintaining aspect ratio
- Uploads resized images as GitHub Gists
- Updates the PR description with links to the resized images
- Configurable target width

## Setup

Add this GitHub Action to your repository by creating a workflow file (e.g., `.github/workflows/resize-images.yml`):

```yaml
name: Resize Images

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  resize-images:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Resize Images
        uses: your-username/image-resize-github-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          width: 300
```

## Inputs

| Input   | Description                     | Required | Default |
| ------- | ------------------------------- | -------- | ------- |
| `token` | GitHub token for API access     | Yes      | N/A     |
| `width` | Target width for resized images | No       | `300`   |

## Usage

1. Set up the workflow as described above
2. Add images to your pull request description using standard Markdown syntax: `![description](image_url)`
3. The action will automatically:
   - Detect image URLs in the PR description
   - Download and resize any images that exceed the target width
   - Upload resized images as GitHub Gists
   - Update the PR description with the resized image URLs

## Publishing to GitHub Marketplace

To publish this action to GitHub Marketplace:

1. Create a new repository on GitHub
2. Push this code to the repository
3. Create a new release and tag it with a semantic version (e.g., v1.0.0)
4. Go to your repository settings and publish to the GitHub Marketplace

## License

MIT
