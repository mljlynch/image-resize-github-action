const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execSync } = require("child_process");
const https = require("https");
const { promises: fsPromises } = require("fs");
const os = require("os");

// Function to download an image
async function downloadImage(url) {
  const tempDir = await fsPromises.mkdtemp(
    path.join(os.tmpdir(), "resize-action-")
  );
  const fileName = path.join(
    tempDir,
    `image-${Date.now()}-${path.basename(url)}`
  );

  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(fileName);
        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve(fileName);
        });

        file.on("error", (err) => {
          fs.unlink(fileName, () => {});
          reject(err);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

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

    // Create a temporary directory for processed images
    const tempDirBase = await fsPromises.mkdtemp(
      path.join(os.tmpdir(), "gh-action-")
    );
    const tempDir = path.join(tempDirBase, "processed");
    await fsPromises.mkdir(tempDir, { recursive: true });

    let newDescription = description;

    // Process each image
    for (const match of imageMatches) {
      const [fullMatch, imageUrl] = match;
      const imageUrlDecoded = decodeURI(imageUrl);

      core.info(`Processing image URL: ${imageUrlDecoded}`);

      try {
        // Download the image
        const imagePath = await downloadImage(imageUrlDecoded);

        // Get image info
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Only resize if the image is wider than target width
        if (metadata.width > targetWidth) {
          const outputFilename = path.join(
            tempDir,
            `resized-${path.basename(imageUrlDecoded)}`
          );

          await image.resize(targetWidth).toFile(outputFilename);

          core.info(
            `Resized image from ${metadata.width}px to ${targetWidth}px width`
          );

          // Create a GitHub gist to host the resized image
          const fileContent = await fsPromises.readFile(outputFilename);
          const base64Content = fileContent.toString("base64");

          const { data: gist } = await octokit.rest.gists.create({
            files: {
              [path.basename(outputFilename)]: {
                content: base64Content,
                encoding: "base64",
              },
            },
            public: true,
            description: `Resized image for PR #${context.payload.pull_request.number}`,
          });

          // Get the raw URL of the gist file
          const gistFile = Object.values(gist.files)[0];
          const resizedImageUrl = gistFile.raw_url;

          // Replace the original image URL with the resized one in the description
          newDescription = newDescription.replace(
            fullMatch,
            fullMatch.replace(imageUrl, resizedImageUrl)
          );

          core.info(`Created resized image at ${resizedImageUrl}`);
        } else {
          core.info(
            `Skipping image - already smaller than target width (${metadata.width}px)`
          );
        }

        // Clean up downloaded file
        await fsPromises.unlink(imagePath);
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

      core.info("Successfully updated PR description with resized images");
    } else {
      core.info("No images needed to be updated in the PR description");
    }

    // Clean up temp directory
    await fsPromises.rm(tempDirBase, { recursive: true, force: true });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
