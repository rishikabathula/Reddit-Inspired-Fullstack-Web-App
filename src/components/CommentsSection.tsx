import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { Comment, CommentVote, User } from '@prisma/client'
import CreateComment from './CreateComment'
import PostComment from './PostComment'

type ExtendedComment = Comment & {
  votes: CommentVote[]
  author: User
  replies: ReplyComment[]
}

type ReplyComment = Comment & {
  votes: CommentVote[]
  author: User
}

interface CommentsSectionProps {
  postId: string
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession()

  let comments: ExtendedComment[] = []

  try {
    comments = await db.comment.findMany({
      where: {
        postId,
        replyToId: null,
      },
      include: {
        author: true,
        votes: true,
        replies: {
          include: {
            author: true,
            votes: true,
          },
        },
      },
    })
  } catch (e) {
    console.error('Failed to fetch comments:', e)
  }

  return (
    <div className='flex flex-col mt-4'>
      <hr className='w-full h-px my-6' />
      <CreateComment postId={postId} />
      <div className='mt-4 flex flex-col gap-y-6 overflow-y-auto max-h-[60vh] pr-2'>
        {comments.map((topLevelComment) => {
          const topLevelVotesAmt = topLevelComment.votes.reduce((acc, vote) => {
            return vote.type === 'UP' ? acc + 1 : vote.type === 'DOWN' ? acc - 1 : acc
          }, 0)

          const topLevelVote = topLevelComment.votes.find(
            (vote) => vote.userId === session?.user.id
          )

          return (
            <div key={topLevelComment.id} className='flex flex-col'>
              <div className='mb-2'>
                <PostComment
                  comment={topLevelComment}
                  currentVote={topLevelVote}
                  votesAmt={topLevelVotesAmt}
                  postId={postId}
                />
              </div>

              {topLevelComment.replies
                .sort((a, b) => b.votes.length - a.votes.length)
                .map((reply) => {
                  const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                    return vote.type === 'UP' ? acc + 1 : vote.type === 'DOWN' ? acc - 1 : acc
                  }, 0)

                  const replyVote = reply.votes.find(
                    (vote) => vote.userId === session?.user.id
                  )

                  return (
                    <div key={reply.id} className='ml-2 py-2 pl-4 border-l-2 border-zinc-200'>
                      <PostComment
                        comment={reply}
                        currentVote={replyVote}
                        votesAmt={replyVotesAmt}
                        postId={postId}
                      />
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CommentsSection
