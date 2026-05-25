import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Spotify credentials are not configured in environment variables.' },
      { status: 500 }
    );
  }

  try {
    // 1. Get an access token using Client Credentials Flow
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Spotify token fetch failed:', errText);
      return NextResponse.json({ error: 'Failed to authenticate with Spotify' }, { status: 502 });
    }

    const { access_token } = await tokenResponse.json();

    // 2. Search for tracks
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!searchResponse.ok) {
      return NextResponse.json({ error: 'Failed to search Spotify' }, { status: 502 });
    }

    const searchData = await searchResponse.json();

    // Transform data to a cleaner format for our frontend
    const tracks = searchData.tracks.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      artist: item.artists.map((a: any) => a.name).join(', '),
      albumArt: item.album.images[0]?.url || '',
      previewUrl: item.preview_url,
      externalUrl: item.external_urls.spotify,
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Spotify Search Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
