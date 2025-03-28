export async function fetcher<T>(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard data')
  }
  return response.json() as T
}
