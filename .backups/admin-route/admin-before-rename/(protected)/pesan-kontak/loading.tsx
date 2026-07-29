import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactMessagesLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 pt-6">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className="h-16 w-full rounded-xl" />

      {Array.from({
        length: 4,
      }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-5 pt-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-7 w-3/5" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
