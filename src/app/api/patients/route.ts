import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json({ message: 'GET /patients not implemented' }, { status: 501 });
}

export async function POST(req: Request) {
  return NextResponse.json({ message: 'POST /patients not implemented' }, { status: 501 });
}
