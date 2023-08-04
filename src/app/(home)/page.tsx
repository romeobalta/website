import Link from 'next/link'

import { ArticleBox, Socials } from '@/components'
import { Bio, MarkdownRenderer } from '@/components/server'
import { getArticles } from '@/data/getArticles'
import { getHome } from '@/data/getHome'

export const dynamic = 'force-static'

export default async function Home() {
  const { data: home, error } = await getHome()
  const { data: articles } = await getArticles({
    pagination: {
      limit: 8,
    },
  })

  if (error) throw new Error('Oops, romeo is not home')

  return (
    <div className="flex flex-col items-center w-full px-5">
      <Bio
        name={home?.name ?? ''}
        description={home?.description ?? ''}
        picture="https://randomuser.me/api/portraits/men/86.jpg"
      />

      <Socials socials={home?.socials} className="mt-2" />

      <h1 className="w-full max-w-md mt-5 text-lg font-bold text-center font-source-serif">
        About me
      </h1>
      <div className="w-full max-w-md font-source-serif font-normal text-sm">
        <MarkdownRenderer markdown={home?.bio} />
      </div>

      <h1 className="w-full max-w-md mt-5 text-lg font-bold text-center font-source-serif">
        Links
      </h1>
      <div className="w-full max-w-md font-source-serif font-normal text-sm">
        <ul className="list-disc pl-5">
          {home?.links?.map(link => {
            const { url, title, description } = {
              url: '',
              title: '',
              ...link,
            }
            return (
              <li key={url} className="my-1">
                <Link
                  href={url}
                  className="text-sky-500"
                  title={description ?? ''}
                >
                  {title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {articles?.length && (
        <>
          <h1 className="w-full max-w-md mt-5 text-lg font-bold text-center font-source-serif">
            Latest articles
          </h1>

          <div className="w-full grid grid-cols-1 @2xl:grid-cols-2 @5xl:grid-cols-4 gap-x-4 gap-y-4 @5xl:gap-y-8 mt-4">
            {articles?.map(article => (
              <ArticleBox
                key={article?.id}
                title={article?.attributes?.title ?? ''}
                description={article?.attributes?.description ?? ''}
                category={
                  article?.attributes?.category?.data?.attributes?.name ?? ''
                }
                link={`/article/${article?.attributes?.slug}`}
                image={
                  article?.attributes?.thumbnail?.data?.attributes?.url ?? ''
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
