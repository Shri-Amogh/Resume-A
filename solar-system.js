(() => {
  const canvas = document.getElementById('solarCanvas');
  const ctx = canvas.getContext('2d');
  document.body.style.height = "7000px";  // example, adjust as needed


  let scrollOffset = 0;       // scroll position in pixels
  let timeSpeedFactor = 1;   // days per pixel of scroll

  const bottomText = document.getElementById('bottomText');



  
  // sun stuff dont touch
  function updateSunThreshold() {
    return window.innerHeight / 2 - 90; // your existing offset
  }

  let sunStickThreshold = updateSunThreshold();

  // On resize, recalc threshold
  window.addEventListener('resize', () => {
    sunStickThreshold = updateSunThreshold();
  });

// Scroll listener
window.addEventListener('scroll', () => {
  const isLargeScreen = window.innerWidth >= 768; // adjust breakpoint as needed
  

  if (!isLargeScreen) {
    // On small screens, never stick
    bottomText.classList.remove('stuck');
    bottomText.style.top = '';
    return;
  }

  if (window.scrollY >= sunStickThreshold) {
    bottomText.classList.add('stuck');
    bottomText.style.top = '55%'; // your Sun position
  } else {
    bottomText.classList.remove('stuck');
    bottomText.style.top = '';
  }
});

  window.addEventListener('scroll', () => {
    scrollOffset = window.scrollY;
  });



// sccroll effects here 
  const scrollText = document.getElementById('scrollText');
  const body = document.body;
  const down1Text = document.querySelector('.down1-text');
  const down2Text = document.querySelector('.down2-text');
  const down3Text = document.querySelector('.down3-text');
  const down4Text = document.querySelector('.down4-text');
  const down5Text = document.querySelector('.down5-text');
  const down6Text = document.querySelector('.down6-text');
  const down7Text = document.querySelector('.down7-text');
  const down8Text = document.querySelector('.down8-text');
  


  window.addEventListener('scroll', () => {
    const y = window.scrollY;



    // Example: change text after 500px scroll
    if (y < 1000) {
        scrollText.textContent = "Keep Scrolling!";
        body.style.backgroundColor = '#000000ff';
        down1Text.style.filter = 'blur(40px)';
        down2Text.style.filter = 'blur(40px)';
        down3Text.style.filter = 'blur(40px)';
        down4Text.style.filter = 'blur(40px)';
        down5Text.style.filter = 'blur(40px)';
        down6Text.style.filter = 'blur(40px)';
        down7Text.style.filter = 'blur(40px)';
        down8Text.style.filter = 'blur(40px)';



    } else if (y < 1600) {
        scrollText.textContent = " ";
        body.style.backgroundColor = '#ffffffff';

        down1Text.style.filter = 'blur(0px)';
        down2Text.style.filter = 'blur(0px)';
        down3Text.style.filter = 'blur(40px)';

    } else if (y < 2000) {
        scrollText.textContent = " ";
        body.style.backgroundColor = '#ffffffff';

        down1Text.style.filter = 'blur(0px)';
        down2Text.style.filter = 'blur(40px)';
        down3Text.style.filter = 'blur(0px)';
        down4Text.style.filter = 'blur(40px)';
        down5Text.style.filter = 'blur(40px)';

    } else if (y < 2400) {
        scrollText.textContent = " ";
        body.style.backgroundColor = '#ffffffff';

        down1Text.style.filter = 'blur(40px)';
        down3Text.style.filter = 'blur(40px)';
        down4Text.style.filter = 'blur(0px)';
        down5Text.style.filter = 'blur(0px)';

// here //

    }  else if (y < 2500) {
        scrollText.textContent = " ";
        body.style.backgroundColor = '#ffffffff';
        
        down4Text.style.filter = 'blur(40px)';
        down5Text.style.filter = 'blur(40px)';



    } else if (y < 2200) {
        scrollText.textContent = " ";
        body.style.backgroundColor = '#ffffffff';
        down1Text.style.filter = 'blur(0px)';
        down2Text.style.filter = 'blur(40px)';
        down3Text.style.filter = 'blur(40px)';

    } else if (y < 2200) {
        scrollText.textContent = " ";
        body.style.backgroundColor = '#ffffffff';
        down1Text.style.filter = 'blur(0px)';
        down2Text.style.filter = 'blur(40px)';
        down3Text.style.filter = 'blur(40px)';

    } else {
        scrollText.textContent = "";
        body.style.backgroundColor = '#000000ff';
        down1Text.style.filter = 'blur(40px)';
        down2Text.style.filter = 'blur(40px)';
        down3Text.style.filter = 'blur(40px)';
    }
  });


  

  function fit() {
    canvas.width = Math.max(200, window.innerWidth);
    canvas.height = Math.max(200, window.innerHeight);
  }
  window.addEventListener('resize', fit);
  fit();

  const J2000_JD = 2451545.0;

  // ---------- Utility ----------
  function jdOf(date){ return date.getTime()/86400000 + 2440587.5; }
  function daysSinceJ2000(date){ return jdOf(date) - J2000_JD; }
  function deg2rad(d){ return d*Math.PI/180; }
  function rad2deg(r){ return r*180/Math.PI; }
  function normDeg(d){ d %= 360; return d<0?d+360:d; }

  // ---------- Log radial scaling ----------
  const MIN_AU = 0.05;   // avoid log(0)
  const MAX_AU = 120;    // wide enough for Eris
  function pxPerLog() {
    const viewR = Math.min(canvas.width, canvas.height) * 0.46;
    return viewR / Math.log10(MAX_AU / MIN_AU + 1);
  }
  function logScale(au) {
    return pxPerLog() * Math.log10(au / MIN_AU + 1);
  }

  // ---------- Kepler solver (Newton-Raphson) ----------
  function solveKepler(M, e) {
    // normalize M to [-π,π]
    M = Math.atan2(Math.sin(M), Math.cos(M));
    // initial guess (good for all eccentricities < ~0.9)
    let E = M + (e * Math.sin(M)) / (1 - Math.sin(M + e) + Math.sin(M));
    for (let i = 0; i < 12; i++) {
      const f = E - e * Math.sin(E) - M;
      const fp = 1 - e * Math.cos(E);
      const dE = f / fp;
      E -= dE;
      if (Math.abs(dE) < 1e-12) break;
    }
    return E;
  }

  // ---------- Orbital elements (J2000-like) ----------
  // Each entry: { a (AU), e, i (deg), Omega (deg), omega (deg), M0 (deg), epochJD }
  // Planets: derived from the Schlyter-style quantities (varpi & L converted to omega & M0)
  // Dwarfs: approximate J2000 values (fallback) included
  const elements = {
    // Planets (values are J2000-like approximations)
    Mercury: { a:0.38709893, e:0.20563069, i:7.00487,  Omega:48.33167, omega:29.12478, M0:174.79406, epochJD:J2000_JD },
    Venus:   { a:0.72333199, e:0.00677323, i:3.39471,  Omega:76.68069, omega:54.85229, M0:50.44675,  epochJD:J2000_JD },
    Earth:   { a:1.00000011, e:0.01671022, i:0.00005,  Omega:-11.26064,omega:114.20783,M0:357.51716, epochJD:J2000_JD },
    Mars:    { a:1.52366231, e:0.09341233, i:1.85061,  Omega:49.57854, omega:286.46230,M0:19.41248,  epochJD:J2000_JD },
    Jupiter: { a:5.20336301, e:0.04839266, i:1.30530,  Omega:100.55615,omega:274.19770,M0:19.65053,  epochJD:J2000_JD },
    Saturn:  { a:9.53707032, e:0.05415060, i:2.48446,  Omega:113.71504,omega:338.71690,M0:317.51238, epochJD:J2000_JD },
    Uranus:  { a:19.19126393,e:0.04716771, i:0.76986,  Omega:74.22988, omega:96.73436, M0:142.26794, epochJD:J2000_JD },
    Neptune: { a:30.06896348,e:0.00858587, i:1.76917,  Omega:131.72169,omega:273.24966,M0:259.90868, epochJD:J2000_JD },

    // Dwarf planets (approximate J2000 fallback)
    Ceres:   { a:2.76718174, e:0.075776, i:10.585, Omega:80.266, omega:73.596, M0:95.989,  epochJD:J2000_JD },
    Pluto:   { a:39.48211675,e:0.24882730,i:17.14175,Omega:110.2985, omega:113.834, M0:14.53,   epochJD:J2000_JD },
    Haumea:  { a:43.218,     e:0.188,     i:28.22,   Omega:122.163, omega:240.20, M0:205.70,  epochJD:J2000_JD },
    Makemake:{ a:45.43,      e:0.159,     i:28.98,   Omega:79.620,  omega:294.83, M0:198.90,  epochJD:J2000_JD },
    Eris:    { a:67.67,      e:0.440,     i:44.04,   Omega:35.95,   omega:151.64, M0:209.40,  epochJD:J2000_JD }
  };

  // Visual style + sizes
  const style = {
    sunRadius: 18,
    orbitStroke: 'rgba(200,220,255,0.18)',
    labelColor: '#768699ff',
    bodies: { 
      Mercury: { color:'#a3a3a3', r:3 },
      Venus:   { color:'#f59e0b', r:5 },
      Earth:   { color:'#22c55e', r:6 },
      Mars:    { color:'#ef4444', r:5 },
      Jupiter: { color:'#fbbf24', r:9 },
      Saturn:  { color:'#fde047', r:9 },
      Uranus:  { color:'#60a5fa', r:7 },
      Neptune: { color:'#38bdf8', r:7 },
      Ceres:   { color:'#9ca3af', r:3 },
      Pluto:   { color:'#a78bfa', r:4 },
      Haumea:  { color:'#f472b6', r:4 },
      Makemake:{ color:'#f87171', r:4 },
      Eris:    { color:'#e5e7eb', r:4 }
    }
  };

  // ---------- Helper to propagate mean anomaly from epoch to target date ----------
  // Use Kepler's 3rd law to get orbital period: P_years = a^(3/2); P_days = P_years * 365.25
  function propagateMdeg(M0_deg, epochJD, targetJD, a_AU) {
    const P_years = Math.pow(a_AU, 1.5);
    const P_days = P_years * 365.25;
    const n_deg_per_day = 360 / P_days;
    const d = targetJD - epochJD;
    return normDeg(M0_deg + n_deg_per_day * d);
  }

  // Compute heliocentric position (AU) from standard orbital elements (a,e,i,Omega,omega,M0 at epochJD)
  function heliocentricFrom6(elem, date) {
    const JD = jdOf(date);
    const a = elem.a, e = elem.e, i = deg2rad(elem.i), Omega = deg2rad(elem.Omega), omega = deg2rad(elem.omega);
    const Mdeg = propagateMdeg(elem.M0, elem.epochJD || J2000_JD, JD, a);
    const M = deg2rad(Mdeg);

    // Solve Kepler
    const E = solveKepler(M, e);
    const nu = 2 * Math.atan2(Math.sqrt(1+e)*Math.sin(E/2), Math.sqrt(1-e)*Math.cos(E/2));
    const r = a * (1 - e * Math.cos(E)); // AU

    // Orbital plane coordinates (perihelion-based)
    const x_op = r * Math.cos(nu);
    const y_op = r * Math.sin(nu);

    // Rotate by omega (argument of perihelion) around z
    const cosw = Math.cos(omega), sinw = Math.sin(omega);
    const x1 = x_op * cosw - y_op * sinw;
    const y1 = x_op * sinw + y_op * cosw;
    const z1 = 0;

    // Rotate by inclination around x
    const cosi = Math.cos(i), sini = Math.sin(i);
    const x2 = x1;
    const y2 = y1 * cosi - z1 * sini;
    const z2 = y1 * sini + z1 * cosi;

    // Rotate by ascending node Omega around z
    const cosO = Math.cos(Omega), sinO = Math.sin(Omega);
    const x = x2 * cosO - y2 * sinO;
    const y = x2 * sinO + y2 * cosO;
    const z = z2;

    return { x, y, z, r, nu };
  }

  // ---------- Draw an orbit from element object by sampling true anomaly ----------
  function drawOrbit(elem, date) {
    const { cx, cy } = { cx: canvas.width/2, cy: canvas.height/2 };
    ctx.beginPath();
    let first = true;
    for (let deg = 0; deg <= 360; deg += 2) {
      const nu = deg * Math.PI/180;
      const a = elem.a, e = elem.e;
      const r = (a * (1 - e*e)) / (1 + e * Math.cos(nu)); // radius in orbital plane

      // orbital-plane coords
      const x_op = r * Math.cos(nu);
      const y_op = r * Math.sin(nu);

      // rotate by omega,i,Omega
      const omega = deg2rad(elem.omega), i = deg2rad(elem.i), Omega = deg2rad(elem.Omega);
      const x1 = x_op * Math.cos(omega) - y_op * Math.sin(omega);
      const y1 = x_op * Math.sin(omega) + y_op * Math.cos(omega);
      const z1 = 0;
      const x2 = x1;
      const y2 = y1 * Math.cos(i) - z1 * Math.sin(i);
      const z2 = y1 * Math.sin(i) + z1 * Math.cos(i);
      const x3 = x2 * Math.cos(Omega) - y2 * Math.sin(Omega);
      const y3 = x2 * Math.sin(Omega) + y2 * Math.cos(Omega);
      const z3 = z2;

      const R = Math.sqrt(x3*x3 + y3*y3 + z3*z3);
      const k = R > 0 ? (logScale(R) / R) : 0;
      const sx = cx + x3 * k;
      const sy = cy + y3 * k;

      if (first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = style.orbitStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // ---------- Main draw ----------
  const drawListOrder = ['Eris','Makemake','Haumea','Pluto','Neptune','Uranus','Saturn','Jupiter','Ceres','Mars','Earth','Venus','Mercury'];

  function drawFrame() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const now = new Date();
    const date = new Date(now.getTime() + scrollOffset * timeSpeedFactor * 86400000);

    const JDnow = jdOf(date);
    const { cx, cy } = { cx: canvas.width/2, cy: canvas.height/2 };

   



    // Draw orbits (outer-first so inner draw on top)
    for (const name of drawListOrder) {
      drawOrbit(elements[name], date);
    }

    // Draw bodies
    for (const name of drawListOrder.slice().reverse()) {
      const elem = elements[name];
      const P = heliocentricFrom6(elem, date);
      const R = Math.sqrt(P.x*P.x + P.y*P.y + P.z*P.z);
      const k = R>0 ? (logScale(R)/R) : 0;
      const sx = cx + P.x * k;
      const sy = cy + P.y * k;
      const s = style.bodies[name] || { color:'#ddd', r:3 };
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI*2);
      ctx.fillStyle = s.color;
      ctx.fill();

      // label
      ctx.fillStyle = style.labelColor;
      ctx.font = '12px system-ui, -apple-system, "Segoe UI", Roboto';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, sx + s.r + 6, sy);
    }

    // Moon (simple sidereal around Earth, log scaled)
    (function(){
      const earthElem = elements.Earth;
      const earthP = heliocentricFrom6(earthElem, date);
      const Re = Math.sqrt(earthP.x*earthP.x + earthP.y*earthP.y + earthP.z*earthP.z);
      const k = Re>0 ? (logScale(Re)/Re) : 0;
      const ex = cx + earthP.x * k;
      const ey = cy + earthP.y * k;

      const moonAU = 0.02057; // mean semi-major moon in AU
      const moonPeriodDays = 27.321661;
      const days = daysSinceJ2000(date);
      const Mmoon = 2*Math.PI * ((days % moonPeriodDays) / moonPeriodDays);
      const mx = ex + logScale(moonAU) * Math.cos(Mmoon);
      const my = ey + logScale(moonAU) * Math.sin(Mmoon);

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(180,180,200,0.18)'; 
      ctx.arc(ex, ey, logScale(moonAU), 0, Math.PI*2);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = '#ddd';
      ctx.arc(mx, my, 2, 0, Math.PI*2);
      ctx.fill();
    })();


    // --- Sun that grows only in bottom 20% ---
   // Sun
    const scrollMax = document.body.scrollHeight ;
    const triggerPoint = scrollMax * 1.485; 
    const triggerPoint2 = scrollMax * 1.5;
    let progress = 0;
    let progress2 = 0;
    const sunText = document.getElementById("sunText");

    if (scrollOffset >= triggerPoint) {
      // map bottom 20% to [0, 1]
      progress = Math.min((scrollOffset - triggerPoint) / (scrollMax *0.05), 1);
      progress2 = Math.min((scrollOffset - triggerPoint2) / (scrollMax *0.1), 1);
      sunText.style.pointerEvents = "stroke";
      
    } else {
      sunText.style.pointerEvents = "none";
    }

    const baseRadius = 18;
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.55;
    const sunRadius = baseRadius + (maxRadius - baseRadius) * progress;

    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 50 * progress ;
    ctx.fill();
    ctx.shadowBlur = 0;

    // fade in sun text
    
    sunText.style.opacity = progress2 ;
    

    // HUD update
    document.getElementById('hud').textContent =
      date.toISOString().replace('T', ' ').replace('Z', ' UTC');

    // one animation loop call only
    requestAnimationFrame(drawFrame);

  }

  // kick off
  drawFrame();

  // Expose for debugging in console:
  window._SSS_elements = elements;
  window._SSS_heliocentricFrom6 = heliocentricFrom6;

})();