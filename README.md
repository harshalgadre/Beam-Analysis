# Structural Beam Analysis Tool

This is a specialized engineering tool for analyzing shear force and bending moment in structural beams. The application allows users to model beams with various support conditions and loading scenarios, then calculates and visualizes the resulting Shear Force Diagram (SFD) and Bending Moment Diagram (BMD).

## Features

- Interactive beam modeling with drag-and-drop interface
- Support for multiple load types: point loads, uniformly distributed loads (UDL), and applied moments
- Support for different beam configurations: simply supported, cantilever, and fixed beams
- Real-time calculation of support reactions using equilibrium equations
- Detailed visualization of Shear Force Diagram (SFD) and Bending Moment Diagram (BMD)
- Step-by-step engineering calculations with methodology explanations
- Responsive design that works on desktop and tablet devices

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Project Structure

```
g:\harshal\mini_project
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── calculate/
│   │   │       └── route.js          # API endpoint for calculations
│   │   ├── page.js                   # Main application page
│   │   ├── layout.js                 # Layout component
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── BeamCanvasInput.js        # Interactive beam input canvas
│   │   ├── DetailedCalculation.js    # Detailed engineering calculations display
│   │   ├── Diagram.js                # SFD and BMD visualization using Chart.js
│   │   ├── BeamInput.js              # Beam input component
│   │   └── LoadInput.js              # Load input component
│   └── lib/
│       └── beamAnalysis.js           # Core calculation logic for SFD/BMD
├── package.json                      # Project dependencies and scripts
└── README.md                         # Project documentation
```

## Engineering Calculations

The tool performs structural analysis using fundamental engineering principles:

### Support Reactions
Calculated using equilibrium equations:
- ΣFy = 0 (Sum of vertical forces equals zero)
- ΣM = 0 (Sum of moments about any point equals zero)

### Shear Force Diagram (SFD)
Computed by summing vertical forces to the left of any section:
- V(x) = Σ(Reactions to the left of x) - Σ(Loads to the left of x)

### Bending Moment Diagram (BMD)
Computed by summing moments to the left of any section:
- M(x) = Σ(Reactions × moment arms) - Σ(Loads × moment arms) - Σ(Applied moments)

### Core Calculation Logic

The main calculation logic is in the `calculateSFDandBMD` function in `src/lib/beamAnalysis.js`:

```javascript
function calculateSFDandBMD({ length, supports, loads }) {
  // Calculate reactions
  const reactions = solveSupportReactions({ length, supports, loads });
  // Get segment boundaries
  const segments = getSegments(length, supports, loads);
  // Sample x along beam
  const step = Math.max(0.01, length / 500);
  const xArr = [];
  for (let x = 0; x <= length; x += step) xArr.push(Number(x.toFixed(4)));
  // Calculate V(x) and M(x) at each x
  const V = [];
  const M = [];
  for (const x of xArr) {
    let shear = 0;
    let moment = 0;
    // Add reactions
    reactions.forEach(r => {
      if (r.position <= x) {
        shear += r.value;
        moment += r.value * (x - r.position);
      }
      // For fixed supports, also add moment
      if (r.moment && r.position <= x) {
        moment += r.moment;
      }
    });
    // Add loads
    loads.forEach(l => {
      if (l.type === 'point' && l.position <= x) {
        shear -= l.magnitude;
        moment -= l.magnitude * (x - l.position);
      }
      if (l.type === 'udl') {   
        if (x >= l.start) {
          const udlEnd = Math.min(x, l.end);
          const udlLength = udlEnd - l.start;
          shear -= l.magnitude * udlLength;
          // Moment arm to centroid of UDL portion
          const centroid = l.start + udlLength / 2;
          moment -= l.magnitude * udlLength * (x - centroid);
        }
      }
      if (l.type === 'moment' && l.position <= x) {
        moment -= l.magnitude;
      }
    });
    V.push(shear);
    M.push(moment);
  }
  // Find max/min
  const maxShear = Math.max(...V);
  const minShear = Math.min(...V);
  const maxMoment = Math.max(...M);
  const minMoment = Math.min(...M);
  return {
    xArr,
    V,
    M,
    reactions,
    maxShear,
    minShear,
    maxMoment,
    minMoment
  };
}
```

### API Endpoint

The calculation API is implemented in `src/app/api/calculate/route.js`:

```javascript
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
```

## Learn More

To learn more about Next.js, take a look at the following resources:
[Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
[Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)
## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.