import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TestimonialLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-5 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 shrink-0 rounded-full" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>

                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
