import Link from "next/link";
import { Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/30 p-6 text-center">
      <div className="space-y-4">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <Gavel className="size-8" />
        </span>
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="text-muted-foreground">পৃষ্ঠাটি পাওয়া যায়নি · Page not found</p>
        <Button asChild><Link href="/">হোমে ফিরুন · Go home</Link></Button>
      </div>
    </div>
  );
}
