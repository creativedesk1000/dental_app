import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'GET /appointments not implemented' }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: 'POST /appointments not implemented' }, { status: 501 });
}
