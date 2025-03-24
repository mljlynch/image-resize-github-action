// Test for the regex patterns used in the action
describe("Image Regex Patterns", () => {
  // Import the regex patterns directly from the main file
  const markdownImageRegex =
    /!\[.*?\]\((https?:\/\/.*?(?:\.(?:png|jpg|jpeg)|github\.com\/user-attachments\/assets\/[^)]+)(?:\?[^)]*)?)\)/g;
  const htmlImgTagRegex = /<img.*?src="(https?:\/\/.*?(?:\/[^"]*)?)".*?>/gi;
  const simpleImgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;

  describe("Markdown image regex", () => {
    test("should match standard markdown image syntax", () => {
      const markdown = "![Alt text](https://example.com/image.jpg)";
      const matches = [...markdown.matchAll(markdownImageRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe("https://example.com/image.jpg");
    });

    test("should match markdown image with query parameters", () => {
      const markdown =
        "![Alt text](https://example.com/image.jpg?size=large&v=2)";
      const matches = [...markdown.matchAll(markdownImageRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe(
        "https://example.com/image.jpg?size=large&v=2"
      );
    });

    test("should match GitHub user-attachments URLs in markdown", () => {
      const markdown =
        "![Screenshot](https://github.com/user-attachments/assets/f181588d-2446-430f-9691-e0bf86b93d9f)";
      const matches = [...markdown.matchAll(markdownImageRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe(
        "https://github.com/user-attachments/assets/f181588d-2446-430f-9691-e0bf86b93d9f"
      );
    });

    test("should not match markdown links without image syntax", () => {
      const markdown = "[Alt text](https://example.com/image.jpg)";
      const matches = [...markdown.matchAll(markdownImageRegex)];
      expect(matches.length).toBe(0);
    });

    test("should match multiple markdown images", () => {
      const markdown =
        "![First](https://example.com/first.jpg) and ![Second](https://example.com/second.png)";
      const matches = [...markdown.matchAll(markdownImageRegex)];
      expect(matches.length).toBe(2);
      expect(matches[0][1]).toBe("https://example.com/first.jpg");
      expect(matches[1][1]).toBe("https://example.com/second.png");
    });
  });

  describe("HTML img tag regex", () => {
    test("should match basic HTML img tag", () => {
      const html = '<img src="https://example.com/image.jpg" alt="Alt text">';
      const matches = [...html.matchAll(htmlImgTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe("https://example.com/image.jpg");
    });

    test("should match HTML img tag with width attribute", () => {
      const html =
        '<img width="500" src="https://example.com/image.jpg" alt="Alt text">';
      const matches = [...html.matchAll(htmlImgTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe("https://example.com/image.jpg");
    });

    test("should match self-closing HTML img tag", () => {
      const html = '<img src="https://example.com/image.jpg" />';
      const matches = [...html.matchAll(htmlImgTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe("https://example.com/image.jpg");
    });

    test("should match GitHub user-attachments URLs", () => {
      const html =
        '<img width="1196" alt="Screenshot" src="https://github.com/user-attachments/assets/123456789">';
      const matches = [...html.matchAll(htmlImgTagRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe(
        "https://github.com/user-attachments/assets/123456789"
      );
    });

    test("should not match other HTML tags", () => {
      const html = '<div src="https://example.com/image.jpg"></div>';
      const matches = [...html.matchAll(htmlImgTagRegex)];
      expect(matches.length).toBe(0);
    });
  });

  describe("Simple image regex fallback", () => {
    test("should match HTML img tag regardless of attribute order", () => {
      const html =
        '<img alt="Alt text" src="https://example.com/image.jpg" class="test">';
      const matches = [...html.matchAll(simpleImgRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe("https://example.com/image.jpg");
    });

    test("should match image with complex URL path structure", () => {
      const html =
        '<img src="https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a" alt="Complex">';
      const matches = [...html.matchAll(simpleImgRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe(
        "https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a"
      );
    });

    test("should match image with backticks around it", () => {
      const html =
        '```\n<img src="https://example.com/image.jpg" alt="Code block">\n```';
      const matches = [...html.matchAll(simpleImgRegex)];
      expect(matches.length).toBe(1);
      expect(matches[0][1]).toBe("https://example.com/image.jpg");
    });
  });

  describe("Real-world examples", () => {
    test("should match image in PR description example", () => {
      const description =
        'This is test image to resize.\n\n<img width="1196" alt="Screenshot 2025-03-23 at 2 03 33 PM" src="https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a" />```';

      // Try all regexes
      const markdownMatches = [...description.matchAll(markdownImageRegex)];
      const htmlMatches = [...description.matchAll(htmlImgTagRegex)];
      const simpleMatches = [...description.matchAll(simpleImgRegex)];

      expect(markdownMatches.length).toBe(0);
      expect(
        htmlMatches.length + markdownMatches.length > 0 ||
          simpleMatches.length > 0
      ).toBe(true);

      // At least one of our regex patterns should match this real example
      if (htmlMatches.length === 0) {
        expect(simpleMatches.length).toBeGreaterThan(0);
        expect(simpleMatches[0][1]).toBe(
          "https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a"
        );
      } else {
        expect(htmlMatches[0][1]).toBe(
          "https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a"
        );
      }
    });
  });

  describe("Width attribute replacement", () => {
    test("should be able to extract and replace existing width attribute", () => {
      const originalTag =
        '<img width="1196" alt="Screenshot" src="https://github.com/user-attachments/assets/123456789">';
      const targetWidth = 500;

      // Extract components
      const altMatch = originalTag.match(/alt="([^"]*)"/i);
      const imgAltText = altMatch ? altMatch[1] : "";

      const srcMatch = originalTag.match(/src="([^"]*)"/i);
      const imageUrl = srcMatch ? srcMatch[1] : "";

      // Create new tag
      const newHtmlTag = `<img width="${targetWidth}" src="${imageUrl}" alt="${imgAltText}" />`;

      // Verify components were extracted correctly
      expect(imgAltText).toBe("Screenshot");
      expect(imageUrl).toBe(
        "https://github.com/user-attachments/assets/123456789"
      );

      // Verify the new tag has the correct width
      expect(newHtmlTag).toContain(`width="${targetWidth}"`);
      expect(newHtmlTag).not.toContain('width="1196"');
    });

    test("should always override existing width with target width", () => {
      // The real example from the PR description
      const description =
        'This is test image to resize.\n\n<img width="1196" alt="Screenshot 2025-03-23 at 2 03 33 PM" src="https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a" />```';

      const targetWidth = 500;
      const simpleMatches = [...description.matchAll(simpleImgRegex)];

      // Get the matched tag
      const [fullMatch, imageUrl] = simpleMatches[0];

      // Extract alt text
      const altMatch = fullMatch.match(/alt="([^"]*)"/i);
      const imgAltText = altMatch ? altMatch[1] : "";

      // Create new tag with target width
      const newHtmlTag = `<img width="${targetWidth}" src="${imageUrl}" alt="${imgAltText}" />`;

      // Create modified description
      const newDescription = description.replace(fullMatch, newHtmlTag);

      // Verify width was updated
      expect(newDescription).not.toContain('width="1196"');
      expect(newDescription).toContain(`width="${targetWidth}"`);

      // Verify replacement worked in context
      expect(newDescription).toBe(
        `This is test image to resize.\n\n<img width="${targetWidth}" src="https://github.com/user-attachments/assets/0c5b0873-7b1c-46af-a816-5b355b07840a" alt="Screenshot 2025-03-23 at 2 03 33 PM" />\`\`\``
      );
    });
  });
});
