import { ArticleCategory } from "@/components/blog/article-category";
import { BlogHeader } from "@/components/blog/blog-header";
import { H1 } from "@/components/common/headings";
import { _ } from "@/debug";
import { ReadTimeResults } from "reading-time";

type ArticleLayoutProps = {
  title: string;
  publishedAt: string;
  category: string;
  readingTime: ReadTimeResults;
  children: React.ReactNode;
};

export function ArticleLayout({
  children,
  title,
  publishedAt,
  category,
  readingTime,
}: ArticleLayoutProps) {
  // TODO: add jsonLd
  const jsonLd = {};

  _({
    title,
    publishedAt,
    category,
    readingTime,
  });

  // TODO: add slugify
  return (
    <div className="w-full max-w-2xl px-5 @container">
      <BlogHeader border />
      <div className="h-full w-full flex flex-col justify-stretch items-center">
        <main className="w-full py-5">
          <article className="flex-1 flex flex-col items-center w-full h-full">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <H1 className="mt-6 mb-6 text-center">{title}</H1>

            <ArticleCategory
              className="mb-8 text-neutral-400"
              name={category}
              slug={category}
              date={new Date(publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })}
              readingTime={`~ ${Math.round(readingTime.minutes)} min`}
            />
            <div className="w-full text-base leading-7 font-roboto">
              {children}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}