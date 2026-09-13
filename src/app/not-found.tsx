import Link from "next/link";
import { Button, Arrow } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[80svh] max-w-[1400px] flex-col justify-center px-6 md:px-10 lg:px-16">
      <p className="eyebrow">404</p>
      <h1 className="display mt-6 text-[clamp(2.4rem,8vw,7rem)]">
        Miss.
        <br />
        No ship here.
      </h1>
      <div className="mt-10">
        <Button href="/">
          Back to the board <Arrow />
        </Button>
      </div>
      <p className="mt-10 text-muted">
        Or jump somewhere with <Link href="/#work" className="link-underline text-text">the work</Link>.
      </p>
    </div>
  );
}
