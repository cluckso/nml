import Image from "next/image"
import Link from "next/link"
import { HOMEPAGE_INDUSTRY_LINKS } from "@/lib/industry-data"
import { getIndustryImage, getIndustryImageAlt } from "@/lib/marketing-images"
import { ArrowRight } from "lucide-react"

export function IndustryPhotoCards() {
  const links = HOMEPAGE_INDUSTRY_LINKS.filter(
    (item, index, arr) => arr.findIndex((x) => x.slug === item.slug) === index
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
      {links.map(({ name, slug }) => (
        <Link
          key={slug + name}
          href={`/for/${slug}`}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border/50 shadow-lg shadow-black/20 transition hover:border-primary/40 hover:shadow-primary/10"
        >
          <Image
            src={getIndustryImage(slug)}
            alt={getIndustryImageAlt(name)}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
            <span className="font-semibold text-foreground">{name}</span>
            <ArrowRight className="h-4 w-4 text-primary opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" aria-hidden />
          </div>
        </Link>
      ))}
    </div>
  )
}
