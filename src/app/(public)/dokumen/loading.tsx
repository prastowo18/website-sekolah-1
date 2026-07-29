import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-5 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-4">
                  <Skeleton className="size-14 shrink-0 rounded-xl" />

                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-7 w-full" />
                  </div>
                </div>

                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
