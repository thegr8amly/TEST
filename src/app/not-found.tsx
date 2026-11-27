import Image from "next/image";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-mist text-center">
      <Image src="/brand/inter-emblem.png" alt="" width={64} height={64} />
      <h1 className="font-display text-2xl font-extrabold text-navy">No encontramos esta página</h1>
      <Link href="/" className="font-semibold text-royal hover:underline">Volver al inicio</Link>
    </div>
  );
}
