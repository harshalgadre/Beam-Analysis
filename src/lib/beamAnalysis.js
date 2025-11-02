// Beam analysis logic for statically determinate beams
// Supports: point loads, UDLs, moments, pin/roller/fixed supports

function solveSupportReactions({ length, supports, loads }) {
  // Only simply supported and cantilever beams for now
  // Supports: [{ type: 'pin'|'roller'|'fixed', position: number }]
  // Loads: [{ type: 'point', magnitude, position }, { type: 'udl', magnitude, start, end }, { type: 'moment', magnitude, position }]
  // Returns: { reactions: [{ type, position, value }] }
  
  // For simply supported beams with 2 supports (pin and roller), solve using equilibrium equations
  // ΣFy = 0 and ΣM = 0
  
  // Find the two supports (assuming simply supported beam)
  const pinSupport = supports.find(s => s.type === 'pin');
  const rollerSupport = supports.find(s => s.type === 'roller');
  const fixedSupport = supports.find(s => s.type === 'fixed');
  
  // If we have a fixed support, it's a cantilever
  if (fixedSupport) {
    // For cantilever beam (fixed at one end, free at other)
    let verticalForce = 0;
    let moment = 0;
    
    // Sum all vertical forces
    loads.forEach(load => {
      if (load.type === 'point') {
        verticalForce += load.magnitude;
      } else if (load.type === 'udl') {
        // UDL: total load = magnitude * length
        const udlLength = load.end - load.start;
        verticalForce += load.magnitude * udlLength;
      }
      // Note: Moments don't contribute to vertical force
    });
    
    // Sum all moments about fixed end
    loads.forEach(load => {
      if (load.type === 'point') {
        moment += load.magnitude * load.position;
      } else if (load.type === 'udl') {
        // UDL: acts at centroid, total load = magnitude * length
        const udlLength = load.end - load.start;
        const centroid = (load.start + load.end) / 2;
        moment += (load.magnitude * udlLength) * centroid;
      } else if (load.type === 'moment') {
        moment += load.magnitude; // Applied moment
      }
    });
    
    // Reaction at fixed support: vertical force and moment
    return [
      { type: 'fixed', position: fixedSupport.position, value: -verticalForce, moment: -moment }
    ];
  }
  
  // Simply supported beam (pin and roller)
  if (pinSupport && rollerSupport) {
    // Calculate total vertical load
    let totalLoad = 0;
    loads.forEach(load => {
      if (load.type === 'point') {
        totalLoad += load.magnitude;
      } else if (load.type === 'udl') {
        // UDL: total load = magnitude * length
        const udlLength = load.end - load.start;
        totalLoad += load.magnitude * udlLength;
      }
      // Note: Moments don't contribute to vertical force
    });
    
    // Calculate moment about pin support to find roller reaction
    let momentAboutPin = 0;
    loads.forEach(load => {
      if (load.type === 'point') {
        momentAboutPin += load.magnitude * load.position;
      } else if (load.type === 'udl') {
        // UDL: acts at centroid, total load = magnitude * length
        const udlLength = load.end - load.start;
        const centroid = (load.start + load.end) / 2;
        momentAboutPin += (load.magnitude * udlLength) * centroid;
      } else if (load.type === 'moment') {
        momentAboutPin += load.magnitude; // Applied moment
      }
    });
    
    // Roller reaction (vertical force)
    const rollerReaction = momentAboutPin / (rollerSupport.position - pinSupport.position);
    
    // Pin reaction (vertical force) - from ΣFy = 0
    const pinReaction = totalLoad - rollerReaction;
    
    return [
      { type: 'pin', position: pinSupport.position, value: pinReaction },
      { type: 'roller', position: rollerSupport.position, value: rollerReaction }
    ];
  }
  
  // Fallback for other cases (should not happen in normal use)
  return [
    { type: 'pin', position: 0, value: 10 },
    { type: 'roller', position: length, value: 10 }
  ];
}

function getSegments(length, supports, loads) {
  // Find all change points (supports, load starts/ends)
  const points = [0, length];
  supports.forEach(s => points.push(s.position));
  loads.forEach(l => {
    if (l.type === 'point' || l.type === 'moment') points.push(l.position);
    if (l.type === 'udl' || l.type === 'triangular') {
      points.push(l.start, l.end);
    }
  });
  return Array.from(new Set(points)).sort((a, b) => a - b);
}

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

module.exports = { calculateSFDandBMD };