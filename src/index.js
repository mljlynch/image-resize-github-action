const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = require("fs");
const os = require("os");

// Regex to find image URLs in markdown
const markdownImageRegex =
  /!\[.*?\]\((https?:\/\/.*?\.(?:png|jpg|jpeg)(?:\?[^)]*)?)\)/g;

// Regex to find existing HTML img tags
const htmlImgTagRegex =
  /<img.*?src="(https?:\/\/.*?\.(?:png|jpg|jpeg)(?:\?[^)]*)?)".*?>/gi;

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

    // Find markdown image syntax
    const markdownMatches = [...description.matchAll(markdownImageRegex)];

    // Find HTML img tags
    const htmlTagMatches = [...description.matchAll(htmlImgTagRegex)];

    const totalMatches = markdownMatches.length + htmlTagMatches.length;

    if (totalMatches === 0) {
      core.info("No images found in pull request description.");
      return;
    }

    core.info(
      `Found ${totalMatches} images in PR description (${markdownMatches.length} markdown, ${htmlTagMatches.length} HTML).`
    );

    let newDescription = description;

    // Process markdown images
    for (const match of markdownMatches) {
      const [fullMatch, imageUrl] = match;
      const imageUrlDecoded = decodeURI(imageUrl);

      core.info(`Processing markdown image URL: ${imageUrlDecoded}`);

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

    // Process existing HTML img tags that don't have width attribute
    for (const match of htmlTagMatches) {
      const [fullMatch, imageUrl] = match;
      const imageUrlDecoded = decodeURI(imageUrl);

      // Check if the img tag already has a width attribute
      if (!fullMatch.includes("width=")) {
        core.info(`Processing HTML img tag: ${imageUrlDecoded}`);

        try {
          // Extract alt text if it exists
          const altMatch = fullMatch.match(/alt="([^"]*)"/i);
          const imgAltText = altMatch ? altMatch[1] : "";

          // Create new tag with width attribute
          const newHtmlTag = `<img width="${targetWidth}" src="${imageUrlDecoded}" alt="${imgAltText}" />`;

          // Replace the original tag
          newDescription = newDescription.replace(fullMatch, newHtmlTag);

          core.info(`Added width attribute (${targetWidth}px) to HTML img tag`);
        } catch (error) {
          core.warning(
            `Error processing HTML img tag ${imageUrlDecoded}: ${error.message}`
          );
        }
      } else {
        core.info(
          `Skipping HTML img tag that already has width attribute: ${imageUrlDecoded}`
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
