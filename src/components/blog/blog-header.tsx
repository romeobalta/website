import { SITE_TAG } from "@/env";
import { cn } from "@/util";
import Link from "next/link";

// import { Socials } from './socials'

interface BlogHeaderProps {
  border?: boolean;
}

export function BlogHeader({ border }: BlogHeaderProps) {
  return (
    <header
      className={cn(
        "w-full font-roboto py-3 flex flex-row justify-between items-center",
        border && "border-b border-slate-200/30",
      )}
    >
      <Link href="/">
        <h1 className="font-source-serif text-3xl inline-block">{SITE_TAG}</h1>
      </Link>
      <div className="flex flex-row gap-2 font-roboto-condensed font-bold text-base">
        <Link href="/articles">Articles</Link>
        {/* {false && <Socials className="ml-10" />} */}
      </div>
    </header>
  );
}