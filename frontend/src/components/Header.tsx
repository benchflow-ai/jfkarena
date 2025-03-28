export default function Header() {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <h1 className="text-3xl font-bold tracking-tight">JFK RAG Battle Arena</h1>
      <p className="text-muted-foreground">
        Compare different AI models' responses to questions about JFK files.
      </p>
      <a
        href="https://benchflow.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Powered by</span>
        <img src="/logo.svg" alt="BenchFlow Logo" className="h-4 w-4" />
        <span>BenchFlow</span>
      </a>
    </div>
  )
}
