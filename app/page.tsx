import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center h-screen p-4">
      {/* 1. Add a massive bottom margin to the logo */}
      <div className="mb-auto mt-20"> 
        <Image
          className="Smrlogo invert"
          src="/smr.png"
          alt="Shadow Miracle Records Logo Image"
          width={120}
          height={120}
        />
      </div>

      {/* 2. Add a massive top margin to the button */}
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
    </div>
  );
}