import EditorOutput from '@/components/EditorOutput'
import { buttonVariants } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { formatTimeToNow } from '@/lib/utils'
import { CachedPost } from '@/types/redis'
import { Post, User, Vote } from '@prisma/client'
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import PostVoteServer from '@/components/post-vote/PostVoteServer'
import CommentsSection from '@/components/CommentsSection'

interface SubRedditPostPageProps {
  params: {
    postId: string
  }
}

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const SubRedditPostPage = async ({ params }: SubRedditPostPageProps) => {
  let cachedPost: CachedPost | null = null
  let post: (Post & { votes: Vote[]; author: User }) | null = null

  // Try Redis first
  try {
    const rawPost = await redis.hgetall(`post:${params.postId}`)
    if (Object.keys(rawPost).length > 0) {
      cachedPost = rawPost as CachedPost
    }
  } catch (error) {
    console.error('Error fetching from Redis:', error)
  }

  // If Redis doesn't have the post, try DB
  if (!cachedPost) {
    try {
      post = await db.post.findFirst({
        where: { id: params.postId },
        include: {
          votes: true,
          author: true,
        },
      })
    } catch (error) {
      console.error('Error fetching from DB:', error)
    }
  }

  if (!cachedPost && !post) return notFound()

  const postId = post?.id ?? cachedPost!.id

  return (
    <div>
      <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error Server Component */}
          <PostVoteServer
            postId={postId}
            getData={async () => {
              try {
                return await db.post.findUnique({
                  where: { id: postId },
                  include: { votes: true },
                })
              } catch (error) {
                console.error('Error in PostVoteServer getData:', error)
                return null
              }
            }}
          />
        </Suspense>

        <div className='sm:w-0 w-full flex-1 bg-white p-4 rounded-sm'>
          <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
            Posted by u/{post?.author.username ?? cachedPost?.authorUsername}{' '}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost!.createdAt))}
          </p>
          <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
            {post?.title ?? cachedPost?.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost!.content} />

          <Suspense fallback={<Loader2 className='h-5 w-5 animate-spin text-zinc-500' />}>
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={postId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function PostVoteShell() {
  return (
    <div className='flex items-center flex-col pr-6 w-20'>
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigUp className='h-5 w-5 text-zinc-700' />
      </div>
      <div className='text-center py-2 font-medium text-sm text-zinc-900'>
        <Loader2 className='h-3 w-3 animate-spin' />
      </div>
      <div className={buttonVariants({ variant: 'ghost' })}>
        <ArrowBigDown className='h-5 w-5 text-zinc-700' />
      </div>
    </div>
  )
}

export default SubRedditPostPage
