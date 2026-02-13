import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { jwtDecode } from 'jwt-decode';

interface AccessTokenPayload {
  'https://uv.cl/rol'?: string;
}

export async function GET() {
  const session = await auth0.getSession();

  if (!session || !session.tokenSet?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = jwtDecode<AccessTokenPayload>(
    session.tokenSet.accessToken as string
  );

  const rol = decoded['https://uv.cl/rol'];

  return NextResponse.json({
    accessToken: session.tokenSet.accessToken,
    rol,
  });
}
