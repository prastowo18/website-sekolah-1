import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <main>
      <section className="bg-muted">
        <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="w-full max-w-3xl">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="mt-6 h-14 w-full" />
            <Skeleton className="mt-4 h-14 w-4/5" />
            <Skeleton className="mt-6 h-6 w-full" />
            <Skeleton className="mt-3 h-6 w-3/4" />

            <div className="mt-8 flex gap-3">
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-40" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto h-5 w-40" />
        <Skeleton className="mx-auto mt-4 h-10 w-full max-w-xl" />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="aspect-[4/3] w-full" />

              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
