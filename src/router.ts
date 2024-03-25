/**
 * This file is based on the dynamic router created for the nodejs.org website.
 * https://github.com/nodejs/nodejs.org
 *
 * MIT License
 *
 * Copyright Node.js Website WG contributors. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

import { _ } from "@/debug";
import { IS_DEV } from "@/env";
import { evaluate, Jsx } from "@mdx-js/mdx";
import remarkHeadings, { Heading } from "@vcarl/remark-headings";
import GitHubSlugger from "github-slugger";
import { glob } from "glob";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";
import { cache } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ReadTimeResults } from "reading-time";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkReadingTime from "remark-reading-time";
import { VFile } from "vfile";
import { matter } from "vfile-matter";

const githubSlugger = new GitHubSlugger();

const jsxTyped = jsx as Jsx;
const jsxsTyped = jsxs as Jsx;
const reactRuntime = { Fragment, jsx: jsxTyped, jsxs: jsxsTyped };

async function createRouter() {
  const fileCache = IS_DEV
    ? {
        has: () => false,
        set: () => {},
        get: () => null,
      }
    : new Map();

  // Get all markdown files
  const mdFiles = await glob("**/*.{md,mdx}", {
    cwd: process.cwd(),
    ignore: ["node_modules/**", "README.md"],
  });

  // Create a map of paths to file names
  const paths = new Map();

  mdFiles.forEach((filename) => {
    let pathname = filename
      .replace(/((\/)?(index))?\.mdx?$/i, "")
      .replace("src/content", "/");

    pathname = normalize(pathname).replace(".", "");
    paths.set(pathname, filename);
  });

  /**
   * Get the file content from the cache or read it from the file system
   * @param {string} pathname
   * @returns {Promise<{ content: string, filename: string }>}
   * */
  const getFile = cache(async (pathname: string) => {
    const normalizedPathname = normalize(pathname).replace(".", "");

    // Check if the path exists in the map
    if (paths.has(normalizedPathname)) {
      const filename = paths.get(normalizedPathname);

      let filePath = process.cwd();

      // Check if the file content is in the cache
      if (fileCache.has(normalizedPathname)) {
        const content = fileCache.get(normalizedPathname);

        return { content, filename };
      }

      // Check if the file exists
      if (existsSync(join(filePath, filename))) {
        filePath = join(filePath, filename);

        const content = await readFile(filePath, "utf8");

        fileCache.set(normalizedPathname, content);

        return { content, filename };
      }
    }

    return { filename: "", content: "" };
  });

  /**
   * Compile the MDX content to JSX
   * @param {VFile} source
   * @param {"mdx" | "md"} fileExtension
   * @returns {Promise<{ MDXContent: any, headings: Heading[], metadata: Record<string, any> }>}
   * */
  const compileMDX = async (
    source: VFile,
    fileExtension: "mdx" | "md",
  ): Promise<{
    MDXContent: any;
    headings: Heading[];
    metadata: Record<string, any>;
  }> => {
    matter(source, { strip: true });

    const { default: MDXContent } = await evaluate(source, {
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          { properties: { ariaHidden: true, tabIndex: -1, class: "anchor" } },
        ],
      ],
      remarkPlugins: [remarkGfm, remarkHeadings, remarkReadingTime],
      format: fileExtension,
      baseUrl: import.meta.url,
      ...reactRuntime,
    });

    const {
      headings,
      matter: data,
      readingTime,
    } = source.data as {
      headings: Heading[];
      matter: Record<string, any>;
      readingTime: ReadTimeResults;
    };

    // Add reading time to the metadata
    const metadata = {
      ...data,
      readingTime,
    } as Record<string, any>;

    // Create a slug for each heading
    headings.forEach((heading) => {
      heading.data = { ...heading.data, id: githubSlugger.slug(heading.value) };
    });

    return { MDXContent, headings, metadata };
  };

  /**
   * Get the JSX content from the MDX content
   * @param {string} mdContent
   * @param {string} filename
   * @returns {Promise<{ MDXContent: any, headings: Heading[], metadata: Record<string, any> }>}
   * */
  const getContent = cache(async (mdContent: string, filename: string) => {
    const sourceAsVirtualFile = new VFile(mdContent);
    const fileExtension = filename.endsWith(".mdx") ? "mdx" : "md";
    return compileMDX(sourceAsVirtualFile, fileExtension);
  });

  return {
    getFile,
    getContent,
  };
}

export const router = await createRouter();