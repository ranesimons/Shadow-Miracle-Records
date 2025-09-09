// app/about/page.tsx

import Image from "next/image";

export default function EPKPage() {
  return (
    <div className="Desktop-app">
      <div className="Desktop-top">
        <Image
          className="dark:invert"
          src="/adjustment.png"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <Image
          className="dark:invert"
          src="/equivalent.png"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
      </div>
      <h1 className="Desktop-first">Rane</h1>
      <h1 className="Desktop-surname">Simons</h1>
      <div className="Desktop-topline">
        <a href="https://www.instagram.com/ranesimons/">
          <Image
            className="dark:invert"
            src="/smr.png"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </a>
        <a href="https://www.instagram.com/ranesimons/">
          <Image
            className="dark:invert"
            src="/white.png"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </a>
      </div>
      {/* <br className="Desktop-break"></br> */}
      <h1 className="Desktop-bio">Bio</h1>
      <p className="Desktop-words">
        &#9;Rane Simons is an indie singer-songwriter whose folk and blues
        inspired sound has been compared to James Taylor, George Harrison, and
        Jeff Buckley.&nbsp; Having grown up in Makanda, he got his first taste
        of performing for a festival during the spring of 2010 in what is now
        known as the Shawnee Cave Amphitheater.&nbsp; He went on to live in
        Champaign-Urbana playing various gigs for three years with the Illini
        Contraband before moving to Chicago.&nbsp; Traveling the summer of 2014
        opened him to the thrill of street performing in Asheville, Portland,
        and Seattle.&nbsp; Back in Chicago, he returned to playing with a new
        band which culminated in a tour through Mississippi and New
        Orleans.&nbsp; After performing on Frenchmen street late into the night,
        he decided to focus on singing solo on Michigan Ave upon returning to
        Chicago.&nbsp; He has moved into recording and producing music with his
        entirely self-created EP Synchronicities and a new collaborations
        project called The Prince of Venus in his shared recording studio near
        Wrigley Field.
      </p>
      <h1 className="Desktop-music">Music</h1>
      <div className="Desktop-works">
        <iframe className="Desktop-track" title="It&#x27;s Never Goodbye - Remastered 2021" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/958257244&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <iframe className="Desktop-track" title="Our Love Remains - Remastered 2021" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/958260820&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <iframe className="Desktop-track" title="Synchronicities - Remastered 2021" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/958262881&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <iframe className="Desktop-track" title="The Golden Light - Remastered 2021" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/958261585&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <iframe className="Desktop-track" title="Alright" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1068004219&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <iframe className="Desktop-track" title="You Gonna Roll The Weed?" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1033494595&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
        <iframe className="Desktop-track" title="Set It Free" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/206362367&show_playcount=false&color=%23080808&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false"></iframe>
      </div>
      <h1 className="Desktop-performances">Performances</h1>
      <div className="Desktop-box">
        <div className="Desktop-stack">
          <div className="Desktop-venue">Center Camp At Burning Man</div>
          <div className="Desktop-venue">The Emerald Palace</div>
          <div className="Desktop-venue">FIGMENT Chicago</div>
          <div className="Desktop-venue">Cowboy Monkey</div>
          <div className="Desktop-venue">Kingston Mines</div>
          <div className="Desktop-venue">Hard Rock Cafe</div>
          <div className="Desktop-venue">The Utah Inn</div>
          <div className="Desktop-venue">Illini Union</div>
          <div className="Desktop-venue">PUB OK</div>
        </div>
        <div className="Desktop-right">
          <div className="Desktop-venue">The Dock At Montrose Beach</div>
          <div className="Desktop-venue">Uncommon Ground</div>
          <div className="Desktop-venue">The Canopy Club</div>
          <div className="Desktop-venue">The Red Herring</div>
          <div className="Desktop-venue">Krannert Center</div>
          <div className="Desktop-venue">Joe&apos;s Brewery</div>
          <div className="Desktop-venue">The Hangar 9</div>
          <div className="Desktop-venue">Allen Hall</div>
          <div className="Desktop-venue">PKs Bar</div>
        </div>
      </div>
      <h1 className="Desktop-contact">Contact</h1>
      <div className="Desktop-holding">
        <a href="mailto:ranesimons@gmail.com" className="Desktop-email">
          rane@ranesimons.com
        </a>
        <a href="tel:618-559-9394" className="Desktop-phone">
          618-559-9394
        </a>
      </div>
    </div>
  );
}
