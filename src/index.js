const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = require("fs");
const os = require("os");

// Regex to find image URLs in markdown
const imageRegex =
  /!\[.*?\]\((https?:\/\/.*?\.(?:png|jpg|jpeg)(?:\?[^)]*)?)\)/g;

async function run() {
  try {
    // Get inputs
    const targetWidth = parseInt(
      core.getInput("width", { required: false }) || "300"
    );
    const token = core.getInput("token", { required: true });

    const octokit = github.getOctokit(token);
    const context = github.context;

    // Only run on pull requests
    if (context.eventName !== "pull_request") {
      core.info("This action only works on pull requests.");
      return;
    }

    core.info("Processing PR description for images...");

    // Get PR data
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.payload.pull_request.number,
    });

    const description = pullRequest.body || "";

    // Find all image URLs in the description
    const imageMatches = [...description.matchAll(imageRegex)];

    if (imageMatches.length === 0) {
      core.info("No images found in pull request description.");
      return;
    }

    core.info(`Found ${imageMatches.length} images in PR description.`);

    let newDescription = description;

    // Process each image
    for (const match of imageMatches) {
      const [fullMatch, imageUrl] = match;
      const imageUrlDecoded = decodeURI(imageUrl);

      core.info(`Processing image URL: ${imageUrlDecoded}`);

      try {
        // Replace the markdown image with HTML img tag including width attribute
        const imgAltText = fullMatch.match(/!\[(.*?)\]/)[1] || "";
        const htmlTag = `<img width="${targetWidth}" src="${imageUrlDecoded}" alt="${imgAltText}" />`;

        // Replace the original markdown with the HTML img tag
        newDescription = newDescription.replace(fullMatch, htmlTag);

        core.info(`Added width attribute (${targetWidth}px) to image`);
      } catch (error) {
        core.warning(
          `Error processing image ${imageUrlDecoded}: ${error.message}`
        );
      }
    }

    // Update PR description if it was changed
    if (newDescription !== description) {
      await octokit.rest.pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.payload.pull_request.number,
        body: newDescription,
      });

      core.info("Successfully updated PR description with HTML img tags");
    } else {
      core.info("No images needed to be updated in the PR description");
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
