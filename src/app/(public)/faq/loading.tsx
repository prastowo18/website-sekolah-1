import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FaqLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-5 h-12 w-full max-w-3xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="mt-10">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />

            <div className="space-y-2">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between gap-5 py-5">
                  <Skeleton className="h-6 w-full max-w-2xl" />
                  <Skeleton className="size-5 shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
