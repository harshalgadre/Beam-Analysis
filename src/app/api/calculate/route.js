import { NextResponse } from 'next/server';
import { calculateSFDandBMD } from '../../../lib/beamAnalysis';

export async function POST(req) {
  const data = await req.json();
  // { length, supports, loads }
  try {
    const result = calculateSFDandBMD(data);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
