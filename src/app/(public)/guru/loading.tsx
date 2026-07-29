import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-5 h-12 w-full max-w-3xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-xl" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-16 w-full rounded-xl" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="aspect-[4/5] w-full" />

              <CardContent className="space-y-4 pt-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
