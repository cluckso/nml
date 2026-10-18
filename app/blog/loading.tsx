export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl animate-pulse">
      <div className="h-4 w-16 bg-muted rounded mb-4" />
      <div className="h-10 w-64 bg-muted rounded mb-8" />
      <div className="space-y-6">
        <div className="h-24 bg-muted/60 rounded" />
        <div className="h-24 bg-muted/60 rounded" />
        <div className="h-24 bg-muted/60 rounded" />
      </div>
    </div>
  )
}
