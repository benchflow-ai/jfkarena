export default function Header() {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <h1 className="text-3xl font-bold tracking-tight">JFK RAG Battle Arena</h1>
      <p className="text-muted-foreground">
        Compare different AI models' responses to questions about JFK files.
      </p>
    </div>
  )
}
