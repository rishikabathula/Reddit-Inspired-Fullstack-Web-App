import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { CommentValidator } from '@/lib/validators/comment'
import { z } from 'zod'
import { checkToxicity } from '@/lib/checkToxicity'

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const { postId, text, replyToId } = CommentValidator.parse(body)

    const session = await getAuthSession()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 🚫 Check for toxic comment
    const isToxic = await checkToxicity(text)
    if (isToxic) {
      return new Response(
        JSON.stringify({ error: 'This comment was flagged as toxic and cannot be posted.' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // ✅ Save clean comment to DB
    await db.comment.create({
      data: {
        text,
        postId,
        authorId: session.user.id,
        replyToId,
      },
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response('Could not post comment. Try again later.', {
      status: 500,
    })
  }
}