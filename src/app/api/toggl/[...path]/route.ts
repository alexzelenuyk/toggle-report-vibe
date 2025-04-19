import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const searchParams = new URL(request.url).searchParams;
  const queryString = searchParams.toString();
  
  const url = `https://api.track.toggl.com/${path}${queryString ? `?${queryString}` : ''}`;
  
  try {
    const headers = new Headers(request.headers);
    headers.delete('host');
    
    const response = await fetch(url, {
      method: request.method,
      headers,
    });
    
    return response;
  } catch (error) {
    console.error('Error proxying request to Toggl API:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = `https://api.track.toggl.com/${path}`;
  
  try {
    const body = await request.json().catch(() => null);
    const headers = new Headers(request.headers);
    headers.delete('host');
    
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    return response;
  } catch (error) {
    console.error('Error proxying request to Toggl API:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}
