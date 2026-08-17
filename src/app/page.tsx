import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          optimusTCG
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">HELIX</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          An original digital trading card game. Rival Architects rewrite a
          living city-circuit and try to collapse each other&apos;s Nexus.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/play/local" className={cn(buttonVariants())}>
          Local Play
        </Link>
        <Link href="/decks" className={cn(buttonVariants({ variant: "outline" }))}>
          Decks
        </Link>
        <Link
          href="/collection"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Collection
        </Link>
      </div>
    </main>
  );
}
