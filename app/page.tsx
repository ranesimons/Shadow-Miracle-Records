import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-between h-screen p-1 sm:p-3">
      <Image
        className="Smrlogo"
        src="/smr.png"
        alt="Shadow Miracle Records Logo Image"
        width={120}
        height={120}
      />
      <div className="w-full">
        <iframe className="Landing-track" width="100%" height="120" title="Alright" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1068004219&color=%23080808&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <br />
        <iframe className="Landing-track" width="100%" height="120" title="You Gonna Roll The Weed?" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1033494595&color=%23080808&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <br />
        <iframe className="Landing-track" width="100%" height="120" title="There&#x27;s Another Way To Love" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1000565353&color=%23080808&auto_play=false&hide_related=true&show_comments=true&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>
      </div>
      <a
        className="
          rounded-full
          border border-solid border-transparent
          transition-colors
          flex items-center justify-center
          bg-foreground text-background gap-2
          hover:bg-[#383838] dark:hover:bg-[#ccc]
          font-semibold  /* bolder */
          text-lg sm:text-xl  /* larger font sizes */
          h-14 sm:h-16        /* make the height bigger */
          px-100 sm:px-100        /* more horizontal padding */
          sm:w-auto
        "
        href="https://rane.streetteam.fm/join"
        target="_blank"
        rel="noopener noreferrer"
      >
      Join My Community
      </a>
    </div>
  );
}