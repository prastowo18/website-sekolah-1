import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <main>
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-5 h-12 w-full max-w-xl" />
          <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-6 pt-6">
              {Array.from({
                length: 3,
              }).map((_, index) => (
                <div
                  key={index}
                  className="flex gap-3"
                >
                  <Skeleton className="size-5 shrink-0" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Skeleton className="h-10 w-full" />
        </div>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-full max-w-xl" />

            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-10 w-full"
                />
              ))}
            </div>

            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-36" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
