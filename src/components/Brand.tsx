import Image from "next/image";
import Link from "next/link";

export function Emblem({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <Image src="/brand/inter-emblem.png" alt="" width={size} height={size} className={className} priority />;
}

export function Wordmark({ dark = false, className = "h-7 w-auto" }: { dark?: boolean; className?: string }) {
  return (
    <Image
      src={dark ? "/brand/inter-wordmark-white.png" : "/brand/inter-wordmark.png"}
      alt="INTER · Instituto Interamericano de Lenguas"
      width={900}
      height={240}
      className={className}
      priority
    />
  );
}

export function BrandLockup({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="INTER — inicio">
      <Emblem size={42} className="drop-shadow-sm" />
      <Wordmark dark={dark} className="h-8 w-auto" />
    </Link>
  );
}
