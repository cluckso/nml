import { getAudioExamples } from "@/config/audio-examples"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Headphones } from "lucide-react"

export function AudioExamples() {
  const examples = getAudioExamples()
  if (examples.length === 0) return null

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-4">Hear what your customers experience</h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
        Listen to sample AI calls. Natural conversation, not robot menus.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {examples.map((example, i) => (
          <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Headphones className="h-4 w-4 text-primary" />
                {example.title || `Example ${i + 1}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <audio
                controls
                preload="metadata"
                className="w-full h-10"
                src={example.src}
              >
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
