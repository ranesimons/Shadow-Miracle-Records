import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center min-h-screen p-4">
      <div className="mb-auto mt-20">
        <Image
          className="Smrlogo invert"
          src="/smr.png"
          alt="Shadow Miracle Records Logo Image"
          width={120}
          height={120}
        />
      </div>

      <div className="mt-40 sm:mt-64">
        <a
          className="
            rounded-full
            border border-solid border-transparent
            transition-colors
            flex items-center justify-center
            bg-foreground text-background
            font-semibold
            text-lg sm:text-xl
            h-14 sm:h-16
            px-12 sm:px-20
            w-64 sm:w-80
          "
          href="https://ranesimons.streetteam.fm/join"
          target="_blank"
          rel="noopener noreferrer"
        >
          Join My Community
        </a>
      </div>

      <footer className="mt-auto py-6 flex gap-6 text-sm text-gray-400">
        <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
      </footer>
    </div>
  );
}