# PR Image Width Adjuster

## Overview

This repository uses a GitHub Action that automatically adjusts the display width of images in pull request descriptions. Instead of physically resizing the images (which would require downloading and uploading them), this action cleverly converts Markdown image syntax to HTML `<img>` tags with a specified width attribute.

## How It Works

When you create or update a pull request with images in the description, the action:

1. Automatically detects Markdown image syntax: `![alt text](https://example.com/image.jpg)`
2. Converts it to HTML with width attribute: `<img width="500" src="https://example.com/image.jpg" alt="alt text" />`
3. Updates the PR description with these HTML tags

## Benefits

- **Better Layout Control**: Prevents oversized images from dominating the PR description
- **Faster Processing**: No need to download, resize, and re-upload images
- **Original Images Preserved**: Links to the original, full-resolution images are maintained
- **Alt Text Preserved**: Maintains accessibility by preserving alt text from the original Markdown

## Usage

Simply add images to your PR description using standard Markdown syntax:

```markdown
Here's a screenshot of the new feature:

![Feature screenshot](https://example.com/screenshot.jpg)
```

The action will automatically adjust the width to 500px (our configured default).

## Custom Width (Advanced)

If you need to use a different width for specific images, you can manually use HTML in your PR description:

```html
<img width="300" src="https://example.com/small-image.jpg" alt="Small image" />
<img
  width="800"
  src="https://example.com/large-diagram.jpg"
  alt="Large diagram"
/>
```

## Troubleshooting

If you encounter any issues with image display in your PR descriptions:

1. Check that the image URL is correct and accessible
2. Ensure the PR was created or updated after this action was implemented
3. Try editing the PR description to trigger the workflow again

For any questions or issues, please contact the DevOps team.
