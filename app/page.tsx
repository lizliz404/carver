import CarverPage from '../components/CarverPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carver.lizliz.xyz';

const gameSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'Carver',
  url: siteUrl,
  image: `${siteUrl}/og-image.png`,
  inLanguage: ['en', 'zh-CN'],
  applicationCategory: 'Game',
  gamePlatform: ['Web browser', 'Mobile browser', 'Desktop browser'],
  genre: ['Puzzle', 'Logic game', 'Sliding puzzle'],
  description:
    'Carver is a free browser puzzle game where every move changes the board: step off dirt to turn it into ice, slide across frozen tiles, and use void scars as braces that turn old damage into future control.',
  playMode: 'SinglePlayer',
  operatingSystem: 'Any',
  author: {
    '@type': 'Person',
    name: 'Liz',
    url: 'https://lizliz.xyz',
  },
  isPartOf: {
    '@type': 'WebSite',
    name: 'lizliz.xyz',
    url: 'https://lizliz.xyz',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

export default function Page() {
  return (
    <>
      {/* Plain script so static export puts JSON-LD in initial HTML (next/script kept it in RSC only). */}
      <script
        id="carver-video-game-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />
      <CarverPage />
    </>
  );
}
