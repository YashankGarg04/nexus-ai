import { NextResponse } from 'next/server';
import { RemotePluginRegistry } from '@/plugins';

export async function GET() {
  return NextResponse.json(RemotePluginRegistry);
}