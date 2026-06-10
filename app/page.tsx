import Script from 'next/script';
import CarverPage from '../components/CarverPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carver.pages.dev';

const gameSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Carver',
  url: siteUrl,
  applicationCategory: 'Game',
  gamePlatform: ['Web browser', 'Mobile browser', 'Desktop browser'],
  genre: ['Puzzle', 'Logic game', 'Sliding puzzle'],
  description:
    'Carver is a free browser puzzle game where every move changes the board: step off dirt to turn it into ice, slide across frozen tiles, and carve a safe route to the goal.',
  playMode: 'SinglePlayer',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function Page() {
  return (
    <>
      <Script
        id="carver-video-game-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />
      <CarverPage />
    </>
  );
}
