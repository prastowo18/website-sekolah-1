import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PpdbLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-6 h-12 w-full max-w-3xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-2xl" />

          <div className="mt-8 flex gap-3">
            <Skeleton className="h-11 w-36" />
            <Skeleton className="h-11 w-48" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-36" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />

        {Array.from({
          length: 3,
        }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
