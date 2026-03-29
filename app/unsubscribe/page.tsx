interface Props {
  searchParams: Promise<{ status?: string; error?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { status, error } = await searchParams

  const success = status === 'success'
  const notFound = status === 'notfound'

  return (
    <div className="min-h-screen bg-[#0c1018] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl">{success ? '👋' : '❓'}</p>
      <h1 className="text-xl font-black text-white">
        {success
          ? "You've been unsubscribed"
          : notFound
          ? 'Link not recognised'
          : 'Something went wrong'}
      </h1>
      <p className="text-sm text-white/50 max-w-xs">
        {success
          ? "You won't receive any more daily reminders. You can always sign up again from the results screen."
          : notFound
          ? 'This unsubscribe link may have already been used or has expired.'
          : error === 'missing'
          ? 'No unsubscribe token was provided.'
          : 'We had a problem processing your request. Please try again.'}
      </p>
      <a
        href="/"
        className="mt-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
      >
        Play today&apos;s puzzle
      </a>
    </div>
  )
}
