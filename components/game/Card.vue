<template>
  <div
    class="relative select-none aspect-[100/140] rounded-[2.5px] sm:rounded-[4px] overflow-hidden cursor-pointer transition-all duration-200 transform-gpu shadow-sm"
    :class="[
      isSelected ? '-translate-y-3 scale-105 ring-3 ring-amber-400 shadow-[0_10px_25px_rgba(245,197,66,0.6)] z-30' : '',
      isPlayable && !isSelected ? 'ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)] hover:-translate-y-1.5' : '',
      isDimmed ? 'opacity-40 grayscale-[50%] pointer-events-none' : '',
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- ============================================================ -->
    <!-- 1. CARD BACK (4 REAL LUXURY DECKS BASED ON ui.activeDeck)    -->
    <!-- ============================================================ -->
    <svg
      v-if="back"
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-[2.5px] sm:rounded-[4px]"
    >
      <defs>
        <!-- Deck 1: Gold Solid (Classic Majlis Emerald & Gold) -->
        <linearGradient id="backBg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a2a1a" />
          <stop offset="50%" stop-color="#05170e" />
          <stop offset="100%" stop-color="#020b07" />
        </linearGradient>
        <linearGradient id="backGold-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffe6a3" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#997a15" />
        </linearGradient>

        <!-- Deck 2: Emerald Royal (Jade & Mint Sadu) -->
        <linearGradient id="backBg-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#064e3b" />
          <stop offset="50%" stop-color="#022c22" />
          <stop offset="100%" stop-color="#011611" />
        </linearGradient>
        <linearGradient id="backGold-emerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6ee7b7" />
          <stop offset="50%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#047857" />
        </linearGradient>

        <!-- Deck 3: Heritage Crimson (Najd Red Velvet & Antique Gold) -->
        <linearGradient id="backBg-heritage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#450a0a" />
          <stop offset="50%" stop-color="#260404" />
          <stop offset="100%" stop-color="#120202" />
        </linearGradient>
        <linearGradient id="backGold-heritage" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="50%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#854d0e" />
        </linearGradient>

        <!-- Deck 4: Royal Midnight (Sapphire & Starlight) -->
        <linearGradient id="backBg-royal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
        <linearGradient id="backGold-royal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="50%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>

        <!-- Geometric Grid Pattern -->
        <pattern id="backGrid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0 L8 4 L4 8 Z" fill="none" :stroke="deckStrokeColor" stroke-width="0.3" opacity="0.25" />
        </pattern>
      </defs>

      <!-- Base & Outer border (Authentic Casino Radius rx="2.5") -->
      <rect x="1" y="1" width="98" height="138" rx="2.5" :fill="`url(#backBg-${deckThemeKey})`" :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="1.8" />
      <rect x="3.5" y="3.5" width="93" height="133" rx="1.5" :fill="`url(#backBg-${deckThemeKey})`" :stroke="deckStrokeColor" stroke-width="0.6" opacity="0.55" />
      <rect x="5" y="5" width="90" height="130" rx="1" fill="url(#backGrid)" />
      
      <!-- Corner Ornaments -->
      <g :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="0.6" fill="none" opacity="0.7">
        <path d="M7 12 Q12 12 12 7" />
        <path d="M93 12 Q88 12 88 7" />
        <path d="M7 128 Q12 128 12 133" />
        <path d="M93 128 Q88 128 88 133" />
      </g>

      <!-- Center Medallion (Theme Specific) -->
      <g transform="translate(50, 70)">
        <circle cx="0" cy="0" r="22" :fill="deckCenterBg" :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="1.2" />
        <circle cx="0" cy="0" r="18" fill="none" :stroke="`url(#backGold-${deckThemeKey})`" stroke-width="0.6" stroke-dasharray="2,2" opacity="0.8" />

        <!-- 1. Gold Deck: 8-pointed Islamic Star -->
        <template v-if="deckThemeKey === 'gold'">
          <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" fill="url(#backGold-gold)" opacity="0.9" />
          <path d="M0 -15 L4 -4 L15 0 L4 4 L0 15 L-4 4 L-15 0 L-4 -4 Z" fill="url(#backGold-gold)" transform="rotate(45)" opacity="0.7" />
          <circle cx="0" cy="0" r="4.5" fill="#04150b" stroke="url(#backGold-gold)" stroke-width="0.8" />
          <circle cx="0" cy="0" r="2" fill="#ffe6a3" />
        </template>

        <!-- 2. Emerald Deck: Sadu Diamond Crest -->
        <template v-else-if="deckThemeKey === 'emerald'">
          <polygon points="0,-16 14,0 0,16 -14,0" fill="url(#backGold-emerald)" opacity="0.85" />
          <polygon points="0,-10 9,0 0,10 -9,0" fill="#022c22" stroke="url(#backGold-emerald)" stroke-width="0.8" />
          <circle cx="0" cy="0" r="3" fill="#a7f3d0" />
        </template>

        <!-- 3. Heritage Deck: Crossed Swords & Palm Tree -->
        <template v-else-if="deckThemeKey === 'heritage'">
          <!-- Crossed Swords -->
          <line x1="-12" y1="-12" x2="12" y2="12" stroke="url(#backGold-heritage)" stroke-width="1.8" stroke-linecap="round" />
          <line x1="12" y1="-12" x2="-12" y2="12" stroke="url(#backGold-heritage)" stroke-width="1.8" stroke-linecap="round" />
          <!-- Palm Tree Center -->
          <circle cx="0" cy="0" r="6" fill="#120202" stroke="url(#backGold-heritage)" stroke-width="1" />
          <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
        </template>

        <!-- 4. Royal Deck: Royal Crown & Starlight -->
        <template v-else>
          <path d="M-10 6 L-8 -6 L-3 -1 L0 -9 L3 -1 L8 -6 L10 6 Z" fill="url(#backGold-royal)" stroke="#38bdf8" stroke-width="0.8" />
          <circle cx="0" cy="11" r="2" fill="#e0f2fe" />
        </template>
      </g>
    </svg>

    <!-- ============================================================ -->
    <!-- 2. GOLDEN JOKER CARD                                         -->
    <!-- ============================================================ -->
    <svg
      v-else-if="joker"
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-[2.5px] sm:rounded-[4px]"
    >
      <defs>
        <linearGradient id="jokerBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff9e6" />
          <stop offset="35%" stop-color="#ffd56b" />
          <stop offset="70%" stop-color="#ffb833" />
          <stop offset="100%" stop-color="#c98a10" />
        </linearGradient>
        <linearGradient id="jokerFrame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8a5300" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#663b00" />
        </linearGradient>
      </defs>
      <!-- Base (Authentic Casino Radius rx="2.5") -->
      <rect x="1" y="1" width="98" height="138" rx="2.5" fill="url(#jokerBg)" stroke="url(#jokerFrame)" stroke-width="2" />
      <rect x="3.5" y="3.5" width="93" height="133" rx="1.5" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.6" />
      <rect x="5" y="5" width="90" height="130" rx="1" fill="none" stroke="#8a5300" stroke-width="0.5" opacity="0.35" />

      <!-- Corner Stars & Labels (Crystal Clear) -->
      <g transform="translate(10, 18)">
        <text x="0" y="0" font-size="12" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">★</text>
        <text x="0" y="12" font-size="11" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">J</text>
      </g>
      
      <g transform="translate(90, 122) rotate(180)">
        <text x="0" y="0" font-size="12" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">★</text>
        <text x="0" y="12" font-size="11" font-weight="900" font-family="sans-serif" fill="#7a4800" text-anchor="middle">J</text>
      </g>

      <!-- Center Joker Crest / Crowned Royal Crest -->
      <g transform="translate(50, 64)">
        <!-- Aura Circle -->
        <circle cx="0" cy="0" r="26" fill="#fff9eb" opacity="0.8" stroke="#d4af37" stroke-width="1.2" />
        <circle cx="0" cy="0" r="23" fill="none" stroke="#e8a820" stroke-width="0.8" stroke-dasharray="3,2" />

        <!-- Crown -->
        <path d="M-14 -12 L-10 -22 L-3 -15 L0 -24 L3 -15 L10 -22 L14 -12 Z" fill="#b91c1c" stroke="#7a4800" stroke-width="1" />
        <circle cx="-10" cy="-22" r="1.5" fill="#ffe066" />
        <circle cx="0" cy="-24" r="2" fill="#ffe066" />
        <circle cx="10" cy="-22" r="1.5" fill="#ffe066" />

        <!-- Royal Falcon / Joker Icon -->
        <text x="0" y="10" font-size="28" text-anchor="middle" dominant-baseline="middle">🃏</text>
      </g>

      <!-- Gold Banner "JOKER" -->
      <g transform="translate(50, 108)">
        <rect x="-34" y="-8" width="68" height="16" rx="3" fill="#8a4f00" stroke="#ffd700" stroke-width="1.2" />
        <text x="0" y="3" font-size="10" font-weight="900" font-family="sans-serif" fill="#fff3c4" text-anchor="middle" letter-spacing="1.5">JOKER</text>
      </g>
      <text x="50" y="126" font-size="8" font-weight="bold" font-family="sans-serif" fill="#7a4800" text-anchor="middle">جوكر مجابيد</text>
    </svg>

    <!-- ============================================================ -->
    <!-- 3. REGULAR PLAYING CARD (A, 2-10, J, Q, K)                  -->
    <!-- ============================================================ -->
    <svg
      v-else
      viewBox="0 0 100 140"
      class="w-full h-full block rounded-[2.5px] sm:rounded-[4px] bg-[#faf8f5]"
    >
      <defs>
        <!-- Heart Path -->
        <g id="suit-heart">
          <path d="M0 3 C0 0 -4 -3 -6 -3 C-9 -3 -11 0 -11 3 C-11 7 -4 11 0 16 C4 11 11 7 11 3 C11 0 9 -3 6 -3 C4 -3 0 0 0 3 Z" fill="#d32f2f" />
        </g>
        <!-- Diamond Path -->
        <g id="suit-diamond">
          <path d="M0 -11 L8 0 L0 11 L-8 0 Z" fill="#d32f2f" />
        </g>
        <!-- Spade Path -->
        <g id="suit-spade">
          <path d="M0 -10 C-3 -4 -10 1 -10 6 C-10 10 -6 12 -2 11 C-1 11 0 12 -1 15 L2 15 C1 12 2 11 3 11 C7 12 11 10 11 6 C11 1 4 -4 0 -10 Z" fill="#1e293b" />
        </g>
        <!-- Club Path -->
        <g id="suit-club">
          <path d="M0 -3 A5 5 0 1 1 3.5 4.5 A5 5 0 1 1 -3.5 4.5 A5 5 0 1 1 0 -3 M-1 5 L-2.5 12 L2.5 12 L1 5 Z" fill="#1e293b" />
        </g>

        <!-- ============================================================ -->
        <!-- LUXURY CASINO COURT CARD ART: DOUBLE-HEADED HALF-BUSTS        -->
        <!-- ============================================================ -->

        <!-- A. KING HALF-BUST (Majestic Sovereign) -->
        <g id="court-king-bust">
          <!-- Robes & Mantle -->
          <path d="M-22 0 L-18 -12 L18 -12 L22 0 Z" :fill="isRed ? '#991b1b' : '#1e3a8a'" stroke="#ca8a04" stroke-width="0.7" />
          <path d="M-15 -12 L15 -12 L17 0 L-17 0 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6" />
          <circle cx="-8" cy="-5" r="0.9" fill="#0f172a" />
          <circle cx="0" cy="-3" r="0.9" fill="#0f172a" />
          <circle cx="8" cy="-5" r="0.9" fill="#0f172a" />

          <!-- Royal Scimitar/Sword -->
          <path d="M14 -28 L17 -31 L18 -28 L16 0 L13 0 Z" fill="#e2e8f0" stroke="#475569" stroke-width="0.6" />
          <line x1="10" y1="-9" x2="20" y2="-9" stroke="#eab308" stroke-width="1.4" stroke-linecap="round" />
          <circle cx="15.5" cy="-6.5" r="1.3" fill="#facc15" />

          <!-- Flowing Royal Hair -->
          <path d="M-12 -33 C-17 -26 -16 -16 -11 -12 L11 -12 C16 -16 17 -26 12 -33 Z" fill="#78350f" stroke="#451a03" stroke-width="0.5" />

          <!-- Sovereign Face & Beard -->
          <path d="M-7 -31 L7 -31 L7 -19 C7 -14 0 -12 0 -12 C0 -12 -7 -14 -7 -19 Z" fill="#ffedd5" stroke="#fed7aa" stroke-width="0.3" />
          <!-- Eyes & Brows -->
          <line x1="-5" y1="-25" x2="-2" y2="-25" stroke="#0f172a" stroke-width="1.3" stroke-linecap="round" />
          <line x1="2" y1="-25" x2="5" y2="-25" stroke="#0f172a" stroke-width="1.3" stroke-linecap="round" />
          <!-- Mustache & Royal Beard -->
          <path d="M-6 -18 Q0 -21 6 -18 Q4 -15 0 -17 Q-4 -15 -6 -18 Z" fill="#451a03" />
          <path d="M-4 -17 Q0 -11 4 -17 L3 -13 Q0 -9 -3 -13 Z" fill="#451a03" />

          <!-- Majestic High Imperial Crown -->
          <rect x="-13" y="-36" width="26" height="4" rx="0.5" fill="#eab308" stroke="#78350f" stroke-width="0.7" />
          <circle cx="-7" cy="-34" r="1" fill="#dc2626" />
          <circle cx="0" cy="-34" r="1.2" fill="#15803d" />
          <circle cx="7" cy="-34" r="1" fill="#dc2626" />
          <path d="M-13 -36 L-11 -42 L-6 -37 L0 -44 L6 -37 L11 -42 L13 -36 Z" fill="#facc15" stroke="#854d0e" stroke-width="0.7" />
          <circle cx="0" cy="-44.5" r="1.2" fill="#fef08a" />
        </g>

        <!-- B. QUEEN HALF-BUST (Imperial Tiara & Scepter) -->
        <g id="court-queen-bust">
          <!-- Royal Robes & Mantle -->
          <path d="M-22 0 L-17 -11 L17 -11 L22 0 Z" :fill="isRed ? '#881337' : '#1e1b4b'" stroke="#ca8a04" stroke-width="0.7" />
          <!-- Pearl Necklace & Collar -->
          <path d="M-8 -11 Q0 -6 8 -11" stroke="#facc15" stroke-width="1" fill="none" />
          <circle cx="0" cy="-6" r="1.3" fill="#10b981" />

          <!-- Royal Scepter with Lotus Finial -->
          <line x1="-15" y1="-26" x2="-15" y2="0" stroke="#ca8a04" stroke-width="1.4" />
          <path d="M-18 -29 L-15 -34 L-12 -29 L-15 -27 Z" fill="#facc15" stroke="#854d0e" stroke-width="0.6" />
          <circle cx="-15" cy="-29" r="1" fill="#dc2626" />

          <!-- Elegant Tresses & Veil -->
          <path d="M-12 -33 C-17 -24 -16 -14 -10 -10 L10 -10 C16 -14 17 -24 12 -33 Z" fill="#92400e" stroke="#451a03" stroke-width="0.5" />

          <!-- Regal Queen Face -->
          <path d="M-6 -30 L6 -30 L6 -18 C6 -13 0 -11 0 -11 C0 -11 -6 -13 -6 -18 Z" fill="#fef2f2" stroke="#fecdd3" stroke-width="0.3" />
          <!-- Refined Eyes with Lashes -->
          <line x1="-4.5" y1="-23" x2="-1.5" y2="-23" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round" />
          <line x1="1.5" y1="-23" x2="4.5" y2="-23" stroke="#0f172a" stroke-width="1.2" stroke-linecap="round" />
          <!-- Rose Lips -->
          <path d="M-2 -16 Q0 -15 2 -16 Q0 -13 -2 -16 Z" fill="#e11d48" />

          <!-- Imperial Tiara Crown with 5 Pearls -->
          <path d="M-12 -33 Q0 -41 12 -33 L11 -35 Q0 -43 -11 -35 Z" fill="#eab308" stroke="#854d0e" stroke-width="0.7" />
          <circle cx="-9" cy="-35.5" r="1.1" fill="#ffffff" />
          <circle cx="-4.5" cy="-38.5" r="1.1" fill="#ffffff" />
          <circle cx="0" cy="-40" r="1.4" fill="#fef08a" />
          <circle cx="4.5" cy="-38.5" r="1.1" fill="#ffffff" />
          <circle cx="9" cy="-35.5" r="1.1" fill="#ffffff" />
        </g>

        <!-- C. JACK HALF-BUST (Noble Knight with Plumed Helm & Halberd) -->
        <g id="court-jack-bust">
          <!-- Plate Armor & Gorget -->
          <path d="M-22 0 L-17 -10 L17 -10 L22 0 Z" fill="#334155" stroke="#ca8a04" stroke-width="0.7" />
          <path d="M-17 -10 L-24 0 L-15 0 Z" fill="#ca8a04" stroke="#854d0e" stroke-width="0.6" />

          <!-- Battle Spear / Halberd -->
          <line x1="15" y1="-34" x2="15" y2="0" stroke="#78350f" stroke-width="1.8" />
          <polygon points="12,-32 15,-42 18,-32 15,-30" fill="#e2e8f0" stroke="#334155" stroke-width="0.6" />
          <circle cx="15" cy="-31" r="1" fill="#eab308" />

          <!-- Knight's Face -->
          <path d="M-6 -26 L6 -26 L6 -15 C6 -11 0 -10 0 -10 C0 -10 -6 -11 -6 -15 Z" fill="#ffedd5" stroke="#fed7aa" stroke-width="0.3" />
          <line x1="-4.5" y1="-21" x2="-1.5" y2="-21" stroke="#0f172a" stroke-width="1.3" stroke-linecap="round" />
          <line x1="1.5" y1="-21" x2="4.5" y2="-21" stroke="#0f172a" stroke-width="1.3" stroke-linecap="round" />

          <!-- Gilded Helm with Crimson Feather Plume -->
          <path d="M-11 -31 C-11 -39 11 -39 11 -31 L12 -26 L-12 -26 Z" fill="#64748b" stroke="#1e293b" stroke-width="0.7" />
          <rect x="-12" y="-28" width="24" height="2.5" fill="#eab308" />
          <!-- Crimson Plume -->
          <path d="M0 -39 C-5 -46 -2 -48 4 -46 C8 -44 6 -40 0 -39 Z" fill="#dc2626" stroke="#991b1b" stroke-width="0.6" />
        </g>
      </defs>

      <!-- Card Base and Border (Crisp Casino Radius rx="2.5") -->
      <rect x="1" y="1" width="98" height="138" rx="2.5" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4" />
      <rect x="3.5" y="3.5" width="93" height="133" rx="1.5" fill="none" stroke="#f1f5f9" stroke-width="0.6" />

      <!-- Top-Left Corner Index (Large, Bold, High-Contrast Typography) -->
      <g transform="translate(11, 18)">
        <text
          x="0"
          y="0"
          :font-size="rank === '10' ? 13 : 15.5"
          font-weight="900"
          font-family="system-ui, -apple-system, sans-serif"
          :fill="cardColor"
          text-anchor="middle"
        >
          {{ rank }}
        </text>
        <g transform="translate(0, 8.5) scale(0.62)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- Bottom-Right Corner Index (Rotated 180, Crystal Clear) -->
      <g transform="translate(89, 122) rotate(180)">
        <text
          x="0"
          y="0"
          :font-size="rank === '10' ? 13 : 15.5"
          font-weight="900"
          font-family="system-ui, -apple-system, sans-serif"
          :fill="cardColor"
          text-anchor="middle"
        >
          {{ rank }}
        </text>
        <g transform="translate(0, 8.5) scale(0.62)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- ============================================================ -->
      <!-- CASINO COURT CARD ART: DOUBLE-HEADED SYMMETRY (K, Q, J)      -->
      <!-- ============================================================ -->
      <g v-if="['J', 'Q', 'K'].includes(rank)" transform="translate(50, 70)">
        <!-- Court Portrait Outer Frame -->
        <rect x="-29" y="-45" width="58" height="90" rx="1.5" fill="#faf6f0" stroke="#cbd5e1" stroke-width="1" />
        <rect x="-27" y="-43" width="54" height="86" rx="1" fill="none" stroke="#d4af37" stroke-width="0.6" opacity="0.6" />
        <line x1="-27" y1="0" x2="27" y2="0" stroke="#d4af37" stroke-width="0.6" stroke-dasharray="2,2" opacity="0.5" />

        <!-- 1. KING (Double-Headed) -->
        <template v-if="rank === 'K'">
          <use href="#court-king-bust" />
          <use href="#court-king-bust" transform="rotate(180)" />
        </template>

        <!-- 2. QUEEN (Double-Headed) -->
        <template v-else-if="rank === 'Q'">
          <use href="#court-queen-bust" />
          <use href="#court-queen-bust" transform="rotate(180)" />
        </template>

        <!-- 3. JACK (Double-Headed) -->
        <template v-else-if="rank === 'J'">
          <use href="#court-jack-bust" />
          <use href="#court-jack-bust" transform="rotate(180)" />
        </template>

        <!-- Center Inset Suit Shield -->
        <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#d4af37" stroke-width="0.8" />
        <g transform="scale(0.55)">
          <use :href="suitHref" />
        </g>
      </g>

      <!-- Ace (Large Centered Suit) -->
      <g v-else-if="rank === 'A'" transform="translate(50, 70) scale(1.65)">
        <use :href="suitHref" />
      </g>

      <!-- Number Cards (Pip Layout) -->
      <g v-else>
        <g
          v-for="(pip, i) in numPips"
          :key="i"
          :transform="`translate(${pip.x}, ${pip.y}) ${pip.flip ? 'rotate(180)' : ''} scale(${pip.scale || 0.65})`"
        >
          <use :href="suitHref" />
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUiStore, type DeckType } from '~/stores/ui'

const props = withDefaults(
  defineProps<{
    rank?: string
    suit?: string
    joker?: boolean
    back?: boolean
    deck?: DeckType
    isSelected?: boolean
    isPlayable?: boolean
    isDimmed?: boolean
  }>(),
  {
    rank: 'A',
    suit: '♥',
    joker: false,
    back: false,
    isSelected: false,
    isPlayable: false,
    isDimmed: false,
  }
)

const ui = useUiStore()
const isHovered = ref(false)

const isRed = computed(() => props.suit === '♥' || props.suit === '♦')
const cardColor = computed(() => (isRed.value ? '#d32f2f' : '#1e293b'))

const suitHref = computed(() => {
  switch (props.suit) {
    case '♥': return '#suit-heart'
    case '♦': return '#suit-diamond'
    case '♠': return '#suit-spade'
    case '♣': return '#suit-club'
    default: return '#suit-spade'
  }
})

// Active Deck Theme Mapping
const deckThemeKey = computed<DeckType>(() => {
  if (props.deck && ['gold', 'emerald', 'heritage', 'royal'].includes(props.deck)) {
    return props.deck
  }
  const d = ui.activeDeck
  return ['gold', 'emerald', 'heritage', 'royal'].includes(d) ? d : 'gold'
})

const deckStrokeColor = computed(() => {
  switch (deckThemeKey.value) {
    case 'emerald': return '#10b981'
    case 'heritage': return '#eab308'
    case 'royal': return '#38bdf8'
    default: return '#d4af37'
  }
})

const deckCenterBg = computed(() => {
  switch (deckThemeKey.value) {
    case 'emerald': return '#022c22'
    case 'heritage': return '#1c0303'
    case 'royal': return '#0f172a'
    default: return '#0c3521'
  }
})

interface PipPos {
  x: number
  y: number
  scale?: number
  flip?: boolean
}

// Standard precise playing card pip layouts (ViewBox: 100 x 140, center at 50, 70)
const numPips = computed<PipPos[]>(() => {
  const r = props.rank
  switch (r) {
    case '2':
      return [
        { x: 50, y: 35 },
        { x: 50, y: 105, flip: true },
      ]
    case '3':
      return [
        { x: 50, y: 35 },
        { x: 50, y: 70 },
        { x: 50, y: 105, flip: true },
      ]
    case '4':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '5':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 50, y: 70 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '6':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '7':
      return [
        { x: 32, y: 35 },
        { x: 68, y: 35 },
        { x: 50, y: 52 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 32, y: 105, flip: true },
        { x: 68, y: 105, flip: true },
      ]
    case '8':
      return [
        { x: 32, y: 34 },
        { x: 68, y: 34 },
        { x: 50, y: 52 },
        { x: 32, y: 70 },
        { x: 68, y: 70 },
        { x: 50, y: 88, flip: true },
        { x: 32, y: 106, flip: true },
        { x: 68, y: 106, flip: true },
      ]
    case '9':
      return [
        { x: 32, y: 30 },
        { x: 68, y: 30 },
        { x: 32, y: 56 },
        { x: 68, y: 56 },
        { x: 50, y: 70 },
        { x: 32, y: 84, flip: true },
        { x: 68, y: 84, flip: true },
        { x: 32, y: 110, flip: true },
        { x: 68, y: 110, flip: true },
      ]
    case '10':
      return [
        { x: 32, y: 28 },
        { x: 68, y: 28 },
        { x: 50, y: 44 },
        { x: 32, y: 56 },
        { x: 68, y: 56 },
        { x: 32, y: 84, flip: true },
        { x: 68, y: 84, flip: true },
        { x: 50, y: 96, flip: true },
        { x: 32, y: 112, flip: true },
        { x: 68, y: 112, flip: true },
      ]
    default:
      return [{ x: 50, y: 70, scale: 1.5 }]
  }
})
</script>