import type { MDXComponents, MDXContent } from "mdx/types";
import type { FC } from "react";
import { LatestArticles } from "./home/latest-articles";
import { Section } from "./home/section";
import { A } from "./ui/a";
import { Blockquote } from "./ui/blockquote";
import { Pre, CodeBlock, CodeTabs, Code } from "./ui/code";
import * as Headings from "./ui/headings";
import { WithList } from "./ui/list";
import { P } from "./ui/p";

const components: MDXComponents = {
  CodeBlock: CodeBlock,
  CodeTabs: CodeTabs,
  LatestArticles,
  Section: Section,

  // Common components
  a: A,
  blockquote: Blockquote,
  code: Code,
  h1: Headings.H1,
  h2: Headings.H2,
  h3: Headings.H3,
  h4: Headings.H4,
  h5: Headings.H5,
  h6: Headings.H6,
  ol: WithList(true),
  p: P,
  pre: Pre,
  ul: WithList(false),
};

export const MDXRenderer: FC<{ Component: MDXContent }> = ({ Component }) => (
  <Component components={components} />
);
