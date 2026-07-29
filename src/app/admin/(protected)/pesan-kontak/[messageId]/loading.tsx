import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactMessageDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-52" />

      <div>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-3 h-10 w-2/3" />
        <Skeleton className="mt-3 h-5 w-48" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-5 pt-6">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
