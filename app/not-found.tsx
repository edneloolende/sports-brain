import Link from 'next/link'

export default function NotFound() {
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">No puzzle here</h1>
      <p className="text-gray-500 mb-6">This puzzle doesn&apos;t exist yet or hasn&apos;t been published.</p>
      <Link
        href={`/${today}`}
        className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
      >
        Today&apos;s Puzzle
      </Link>
    </div>
  )
}
