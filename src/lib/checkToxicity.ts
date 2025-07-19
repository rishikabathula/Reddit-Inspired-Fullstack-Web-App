export async function checkToxicity(text: string): Promise<boolean> {
  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: { text },
        languages: ['en'],
        requestedAttributes: { TOXICITY: {} },
      }),
    }
  )

  const result = await response.json()
  const score = result.attributeScores?.TOXICITY?.summaryScore?.value ?? 0
  return score > 0.7
}