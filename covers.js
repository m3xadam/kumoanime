(() => {
  function escapeXml(value) {
    return String(value).replace(/[<>&'"]/g, (character) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    })[character]);
  }

  function hash(value) {
    let result = 0;
    for (const character of value) {
      result = (result * 31 + character.charCodeAt(0)) >>> 0;
    }
    return result;
  }

  function createAnimeCover(title) {
    const [base, accent, highlight] = title.palette;
    const seed = hash(title.id);
    const angle = seed % 360;
    const characterX = 165 + (seed % 36);
    const sparklePositions = Array.from({ length: 13 }, (_, index) => {
      const x = 27 + ((seed + index * 67) % 305);
      const y = 57 + ((seed * (index + 3) + index * 89) % 310);
      const size = index % 4 === 0 ? 3 : 1.6;
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="#fff" opacity="${index % 4 === 0 ? ".88" : ".42"}"/>`;
    }).join("");
    const genre = title.genre.split(" · ")[0];
    const scenicShapes = genre === "Sports"
      ? `<path d="M0 343Q70 318 140 345T280 340T360 345V500H0Z" fill="#101321" opacity=".86"/><path d="M12 365H348M35 386H325M62 407H298" stroke="#fff" stroke-opacity=".13" stroke-width="2"/><circle cx="285" cy="300" r="29" fill="none" stroke="${highlight}" stroke-width="3" opacity=".72"/><path d="M258 300h54m-27-27v54" stroke="${highlight}" stroke-opacity=".72" stroke-width="2"/>`
      : genre === "Sci-Fi"
        ? `<ellipse cx="191" cy="233" rx="145" ry="39" fill="none" stroke="${highlight}" stroke-width="2" opacity=".42" transform="rotate(-24 191 233)"/><ellipse cx="191" cy="233" rx="130" ry="57" fill="none" stroke="#fff" stroke-width="1" opacity=".24" transform="rotate(27 191 233)"/><path d="M0 370 90 315l47 36 66-77 49 66 48-36 60 48v148H0Z" fill="#101321" opacity=".76"/>`
        : genre === "Romance"
          ? `<path d="M0 340Q78 293 150 348T300 341T420 358V500H0Z" fill="#131426" opacity=".76"/><path d="M0 388Q92 359 180 393T360 382V500H0Z" fill="#171b35" opacity=".72"/><path d="M65 97q10-17 20 0t20 0m175 55q9-16 18 0t18 0m-55 105q8-14 16 0t16 0" fill="none" stroke="${highlight}" stroke-width="2" opacity=".8"/>`
          : `<path d="M0 356 52 327l35 14 47-62 48 49 53-78 43 68 32-22 50 47v155H0Z" fill="#101321" opacity=".82"/><path d="M0 400q75-31 150 0t150 0 90 0v100H0Z" fill="${base}" opacity=".64"/><path d="M0 424q89-26 173 0t187 0v76H0Z" fill="#0b0d18" opacity=".58"/>`;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1000" viewBox="0 0 360 500">
      <defs>
        <linearGradient id="sky-${title.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${base}"/><stop offset=".52" stop-color="#171528"/><stop offset="1" stop-color="#090b14"/></linearGradient>
        <radialGradient id="glow-${title.id}"><stop stop-color="${highlight}" stop-opacity=".82"/><stop offset=".42" stop-color="${accent}" stop-opacity=".38"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
        <linearGradient id="coat-${title.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${highlight}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
        <linearGradient id="fade-${title.id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#070810" stop-opacity="0"/><stop offset=".58" stop-color="#070810" stop-opacity=".27"/><stop offset="1" stop-color="#070810" stop-opacity=".98"/></linearGradient>
        <pattern id="grain-${title.id}" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".7" fill="#fff" opacity=".19"/><circle cx="17" cy="15" r=".55" fill="#fff" opacity=".13"/></pattern>
      </defs>
      <rect width="360" height="500" fill="url(#sky-${title.id})"/>
      <circle cx="${characterX}" cy="207" r="185" fill="url(#glow-${title.id})"/>
      <path d="M0 0h360v500H0z" fill="#fff" opacity=".018"/>
      <g transform="rotate(${angle} 180 220)" opacity=".29"><path d="M180 18v78m0 248v90M15 220h78m174 0h78M63 103l54 54m126 126 54 54m0-234-54 54m-126 126-54 54" stroke="${highlight}" stroke-width="1.4"/></g>
      ${sparklePositions}
      ${scenicShapes}
      <circle cx="${characterX}" cy="204" r="73" fill="${accent}" opacity=".18"/>
      <path d="M${characterX - 88} 407q7-86 42-111l26-13h44l26 13q35 25 42 111l8 42H${characterX - 96}Z" fill="#111321" stroke="${highlight}" stroke-opacity=".68" stroke-width="2"/>
      <path d="m${characterX - 39} 293 39 42 39-42 19 156h-116z" fill="url(#coat-${title.id})"/>
      <path d="m${characterX - 39} 293 39 42-29 20-31-48zm78 0-39 42 29 20 31-48z" fill="#f8eaff" opacity=".81"/>
      <path d="M${characterX - 37} 188q2-49 39-53 39 4 40 53l-6 63q-12 34-34 40-23-6-34-40z" fill="#f5d7d0"/>
      <path d="M${characterX - 41} 203q-12-57 24-77 45-27 69 12l-8 49-15-31-16 17-13-24-20 34-17 8z" fill="#17141e"/>
      <path d="M${characterX - 35} 224q16-14 32 0-16 17-32 0m42 0q16-14 32 0-16 17-32 0" fill="#fff8ee" stroke="${base}" stroke-width="2"/>
      <ellipse cx="${characterX - 19}" cy="224" rx="5" ry="8" fill="${accent}"/><ellipse cx="${characterX + 23}" cy="224" rx="5" ry="8" fill="${accent}"/>
      <circle cx="${characterX - 19}" cy="224" r="2.5" fill="#17141e"/><circle cx="${characterX + 23}" cy="224" r="2.5" fill="#17141e"/>
      <circle cx="${characterX - 21}" cy="221" r="1.7" fill="#fff"/><circle cx="${characterX + 21}" cy="221" r="1.7" fill="#fff"/>
      <path d="M${characterX - 9} 253q10 6 20 0" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round"/>
      <path d="M${characterX - 77} 364h154" stroke="${highlight}" stroke-width="1" opacity=".57"/>
      <rect width="360" height="500" fill="url(#fade-${title.id})"/>
      <rect width="360" height="500" fill="url(#grain-${title.id})" opacity=".5"/>
      <path d="M18 18h42M18 18v42M342 18h-42M342 18v42M18 482h42M18 482v-42M342 482h-42M342 482v-42" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="1.3"/>
      <text x="27" y="43" fill="#fff" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="3" opacity=".84">KUMO  /  ANIME COLLECTION</text>
      <text x="25" y="443" fill="#fff" font-family="Arial,sans-serif" font-size="${title.title.length > 23 ? 19 : title.title.length > 15 ? 23 : 29}" font-weight="800" letter-spacing=".3" textLength="310" lengthAdjust="spacingAndGlyphs">${escapeXml(title.title.toUpperCase())}</text>
      <text x="28" y="466" fill="${highlight}" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="2">${escapeXml(title.genre.toUpperCase())}  ·  ${title.year}</text>
      <text x="332" y="466" text-anchor="end" fill="#fff" font-family="Arial,sans-serif" font-size="10" font-weight="700" letter-spacing="1.5">★ ${escapeXml(title.rating)}</text>
    </svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function createAnimeBackdrop(title) {
    const [base, accent, highlight] = title.palette;
    const seed = hash(title.id);
    const figureX = 1190 + seed % 120;
    const stars = Array.from({ length: 35 }, (_, index) => {
      const x = 28 + ((seed + index * 137) % 1544);
      const y = 35 + ((seed * (index + 2) + index * 71) % 630);
      const radius = index % 5 === 0 ? 3 : 1.6;
      return `<circle cx="${x}" cy="${y}" r="${radius}" fill="#fff" opacity="${index % 5 === 0 ? ".86" : ".42"}"/>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="banner-${title.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${base}"/><stop offset=".56" stop-color="#171528"/><stop offset="1" stop-color="#090b14"/></linearGradient>
        <radialGradient id="banner-glow-${title.id}"><stop stop-color="${highlight}" stop-opacity=".74"/><stop offset=".48" stop-color="${accent}" stop-opacity=".32"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
        <linearGradient id="banner-coat-${title.id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${highlight}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
        <linearGradient id="banner-shade-${title.id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#09090b" stop-opacity=".25"/><stop offset=".58" stop-color="#09090b" stop-opacity=".04"/><stop offset="1" stop-color="#09090b" stop-opacity=".25"/></linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#banner-${title.id})"/>
      <circle cx="1160" cy="315" r="560" fill="url(#banner-glow-${title.id})"/>
      <g opacity=".28" transform="rotate(${seed % 35 - 17} 1120 370)"><ellipse cx="1120" cy="370" rx="570" ry="160" fill="none" stroke="${highlight}" stroke-width="3"/><ellipse cx="1120" cy="370" rx="490" ry="220" fill="none" stroke="#fff" stroke-width="2"/></g>
      ${stars}
      <path d="M0 650 210 552l140 92 202-184 172 185 186-237 163 200 154-126 182 174 191-110v354H0Z" fill="#111321" opacity=".85"/>
      <path d="M0 748q170-91 340 0t340 0 340 0 340 0 340 0v152H0Z" fill="${base}" opacity=".62"/>
      <path d="M0 798q190-58 380 0t380 0 380 0 460 0v102H0Z" fill="#0a0c15" opacity=".62"/>
      <circle cx="${figureX}" cy="355" r="104" fill="url(#banner-glow-${title.id})" opacity=".55"/>
      <path d="M${figureX - 215} 900q19-259 106-335l59-35h100l59 35q87 76 106 335z" fill="#111321" stroke="${highlight}" stroke-opacity=".57" stroke-width="4"/>
      <path d="m${figureX - 105} 552 105 92 105-92 54 348h-318z" fill="url(#banner-coat-${title.id})"/>
      <path d="m${figureX - 105} 552 105 92-78 54-85-106zm210 0-105 92 78 54 85-106z" fill="#f8eaff" opacity=".76"/>
      <path d="M${figureX - 91} 337q5-123 91-132 91 9 94 132l-14 142q-28 69-80 80-53-11-80-80z" fill="#f1d4cf"/>
      <path d="M${figureX - 101} 368q-27-141 58-194 107-63 166 30l-16 119-36-77-37 40-31-57-50 80-48 25z" fill="#17141e"/>
      <path d="M${figureX - 80} 405q33-26 66 0-33 31-66 0m90 0q33-26 66 0-33 31-66 0" fill="#fff8ee" stroke="${base}" stroke-width="4"/>
      <ellipse cx="${figureX - 48}" cy="405" rx="10" ry="15" fill="${accent}"/><ellipse cx="${figureX + 48}" cy="405" rx="10" ry="15" fill="${accent}"/>
      <circle cx="${figureX - 48}" cy="405" r="5" fill="#17141e"/><circle cx="${figureX + 48}" cy="405" r="5" fill="#17141e"/>
      <circle cx="${figureX - 52}" cy="399" r="3" fill="#fff"/><circle cx="${figureX + 44}" cy="399" r="3" fill="#fff"/>
      <path d="M${figureX - 23} 464q23 13 46 0" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
      <rect width="1600" height="900" fill="url(#banner-shade-${title.id})"/>
      <path d="M42 42h74M42 42v74M1558 42h-74M1558 42v74" fill="none" stroke="#fff" stroke-opacity=".53" stroke-width="3"/>
      <text x="74" y="83" fill="#fff" font-family="Arial,sans-serif" font-size="25" font-weight="700" letter-spacing="7" opacity=".86">KUMO  /  ANIME COLLECTION</text>
      <text x="1518" y="83" text-anchor="end" fill="${highlight}" font-family="Arial,sans-serif" font-size="20" font-weight="700" letter-spacing="4">${escapeXml(title.genre.toUpperCase())} · ${title.year}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  window.createAnimeCover = createAnimeCover;
  window.createAnimeBackdrop = createAnimeBackdrop;
})();
