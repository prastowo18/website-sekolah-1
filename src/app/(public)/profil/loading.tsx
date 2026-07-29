import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex min-h-[420px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-6 h-14 w-full max-w-3xl" />
            <Skeleton className="mt-4 h-7 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-full max-w-xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-36" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-10 w-full max-w-xl" />
        <Skeleton className="mt-7 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-3 h-5 w-3/4" />

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
