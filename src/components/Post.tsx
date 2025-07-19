'use client'

import { formatTimeToNow } from '@/lib/utils'
import { Post as PostType, User, Vote } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useRef, useState } from 'react'
import EditorOutput from './EditorOutput'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import PostVoteClient from './post-vote/PostVoteClient'

type PartialVote = Pick<Vote, 'type'>

interface PostProps {
  post: PostType & {
    author: User
    votes: Vote[]
  }
  votesAmt: number
  subredditName: string
  currentVote?: PartialVote
  commentAmt: number
}

const isEditorContent = (content: any): content is { blocks: any[] } => {
  return (
    content &&
    typeof content === 'object' &&
    'blocks' in content &&
    Array.isArray(content.blocks)
  )
}

const Post: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLDivElement>(null)
  const [timeAgo, setTimeAgo] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)

  const { data: session } = useSession()
  const router = useRouter()

  const content =
    typeof post.content === 'string'
      ? JSON.parse(post.content)
      : post.content

  useEffect(() => {
    setTimeAgo(formatTimeToNow(new Date(post.createdAt)))
  }, [post.createdAt])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pRef.current) {
        const isOverflow = pRef.current.scrollHeight > 160
        setIsOverflowing(isOverflow)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [content])

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <PostVoteClient postId={post.id} initialVotesAmt={_votesAmt} initialVote={_currentVote?.type}/>
        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subredditName && (
              <>
                <a className="underline text-zinc-900 text-sm underline-offset-2" href={`/r/${subredditName}`}>
                  r/{subredditName}
                </a>
                <span className="px-1">•</span>
              </>
            )}
            <span>Posted by u/{post.author.username}</span>{' '}
            <span>{timeAgo}</span>
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          <div
            ref={pRef}
            className={`relative text-sm w-full transition-all duration-300 ${
              showMore ? '' : 'max-h-40 overflow-hidden'
            }`}
          >
            {isEditorContent(content) ? (
              <EditorOutput content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">No content available.</p>
            )}

            {!showMore && isOverflowing && (
              <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-white to-transparent" />
            )}
          </div>

          {isOverflowing && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-blue-600 text-xs mt-2"
            >
              {showMore ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6 flex justify-between items-center">
        <Link href={`/r/${subredditName}/post/${post.id}`} className="w-fit flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> {commentAmt} comments
        </Link>
      </div>
    </div>
  )
}

export default Post
