const hitterLabelMap = {
  war: "WAR",
  games: "G",
  plate_appearances: "PA",
  hits: "H",
  home_runs: "HR",
  rbi: "RBI",
  stolen_bases: "SB",
  batting_average: "BA",
  on_base_percentage: "OBP",
  slugging_percentage: "SLG",
  ops: "OPS",
  ops_plus: "OPS+",
};

const pitcherLabelMap = {
  war: "WAR",
  wins: "W",
  losses: "L",
  games: "G",
  games_started: "GS",
  complete_games: "CG",
  shutouts: "SHO",
  saves: "SV",
  innings_pitched: "IP",
  hits_allowed: "H",
  earned_runs: "ER",
  home_runs_allowed: "HR",
  walks: "BB",
  strikeouts: "SO",
  era: "ERA",
  whip: "WHIP",
};

const hitterSeasonLabelMap = {
  war: "WAR",
  games: "G",
  pa: "PA",
  hits: "H",
  home_runs: "HR",
  rbi: "RBI",
  stolen_bases: "SB",
  ba: "BA",
  obp: "OBP",
  slg: "SLG",
  ops: "OPS",
};

const pitcherSeasonLabelMap = {
  war: "WAR",
  wins: "W",
  losses: "L",
  games: "G",
  games_started: "GS",
  complete_games: "CG",
  shutouts: "SHO",
  saves: "SV",
  innings_pitched: "IP",
  hits_allowed: "H",
  earned_runs: "ER",
  home_runs_allowed: "HR",
  walks: "BB",
  strikeouts: "SO",
  era: "ERA",
  whip: "WHIP",
};

// Common father/son player mappings for quick reference
const COMMON_FATHER_SON_PLAYERS = {
  "ken griffey": ["Ken Griffey Sr.", "Ken Griffey Jr."],
  "fernando tatis": ["Fernando Tatis Sr.", "Fernando Tatis Jr."],
  "cal ripken": ["Cal Ripken Sr.", "Cal Ripken Jr."],
  "bobby bonds": ["Bobby Bonds", "Barry Bonds"],
  "cecil fielder": ["Cecil Fielder", "Prince Fielder"],
  "tim raines": ["Tim Raines Sr.", "Tim Raines Jr."],
  "sandy alomar": ["Sandy Alomar Sr.", "Sandy Alomar Jr."],
  "pete rose": ["Pete Rose Sr.", "Pete Rose Jr."],
};

function extractStats(res) {
  if (res.error) return null;

  if (["career", "combined", "live"].includes(res.mode)) {
    return res.totals || res.stats;
  } else if (res.mode === "season") {
    return res.stats;
  }
  return null;
}

function formatAwardsForStructuredDisplay(awards) {
  //console.log("formatAwardsForStructuredDisplay called with:", awards);

  // Handle null/undefined awards
  if (!awards) {
    console.log("No awards data provided");
    return {
      championships: 0,
      tsnAllStar: 0, // Separate TSN All-Star count
      mlbAllStar: 0, // MLB All-Star Game appearances (if available)
      goldGlove: 0,
      silverSlugger: 0,
      mvp: 0,
      cyYoung: 0,
      royAward: 0,
      worldSeriesMvp: 0,
      relieverAward: 0,
      otherMajor: [],
    };
  }

  // Handle case where awards.summary doesn't exist but awards.awards might
  let summary = awards.summary;

  if (!summary && awards.awards && Array.isArray(awards.awards)) {
    console.log("No summary found, creating from awards array");
    // Create summary from awards array if summary is missing
    summary = {};
    awards.awards.forEach((award) => {
      const awardId = award.award_id || award.award;
      if (!summary[awardId]) {
        summary[awardId] = {
          count: 0,
          display_name: award.award,
          years: [],
        };
      }
      summary[awardId].count += 1;
      summary[awardId].years.push(award.year);
    });
    console.log("Created summary from awards array:", summary);
  }

  if (!summary) {
    console.log("No summary or awards array found");
    return {
      championships: 0,
      tsnAllStar: 0,
      mlbAllStar: 0,
      goldGlove: 0,
      silverSlugger: 0,
      mvp: 0,
      cyYoung: 0,
      royAward: 0,
      worldSeriesMvp: 0,
      relieverAward: 0,
      otherMajor: [],
    };
  }

  //console.log("Processing summary:", summary);

  // Enhanced mapping to properly distinguish TSN All-Stars from MLB All-Star Games
  const result = {
    // FIXED: Check for World Series championships in multiple places
    championships:
      (awards.world_series_championships &&
      Array.isArray(awards.world_series_championships)
        ? awards.world_series_championships.length
        : 0) ||
      awards.ws_count ||
      summary["WS"]?.count ||
      summary["World Series Champion"]?.count ||
      0,

    // TSN All-Star team selections (from awards table)
    tsnAllStar:
      summary["AS"]?.count ||
      summary["TSN All-Star"]?.count ||
      summary["The Sporting News All-Star"]?.count ||
      0,

    // MLB All-Star Game appearances
    mlbAllStar:
      (awards.mlbAllStar && Array.isArray(awards.mlbAllStar)
        ? awards.mlbAllStar.length
        : 0) ||
      awards.mlbAllStar ||
      0,

    goldGlove: summary["GG"]?.count || summary["Gold Glove"]?.count || 0,
    silverSlugger:
      summary["SS"]?.count || summary["Silver Slugger"]?.count || 0,
    mvp: summary["MVP"]?.count || summary["Most Valuable Player"]?.count || 0,
    cyYoung:
      summary["CYA"]?.count ||
      summary["CY"]?.count ||
      summary["Cy Young Award"]?.count ||
      0,
    royAward:
      summary["ROY"]?.count || summary["Rookie of the Year"]?.count || 0,
    worldSeriesMvp:
      summary["WSMVP"]?.count || summary["World Series MVP"]?.count || 0,
    relieverAward:
      summary["Reliever"]?.count || summary["Reliever of the Year"]?.count || 0,
    otherMajor: getOtherMajorAwards(summary),
  };

  // console.log("formatAwardsForStructuredDisplay result:", result);
  return result;
}

function getOtherMajorAwards(summary) {
  const majorAwardTypes = [
    "ALCS MVP",
    "NLCS MVP",
    "ASG MVP",
    "COMEB",
    "Hutch",
    "Roberto Clemente",
    "Hank Aaron",
    "Edgar Martinez",
    "Lou Gehrig",
    "Branch Rickey",
    "All-MLB - First Team",
    "All-MLB - Second Team",
    "Player of the Month",
    "Player of the Week",
  ];

  const other = [];

  // Check each award type in the summary
  Object.keys(summary).forEach((awardKey) => {
    const awardData = summary[awardKey];

    // Skip awards we've already categorized in the main function
    const mainAwards = [
      "WS",
      "World Series Champion",
      "AS",
      "The Sporting News All-Star",
      "MLB All-Star",
      "All-Star Game",
      "GG",
      "Gold Glove",
      "SS",
      "Silver Slugger",
      "MVP",
      "Most Valuable Player",
      "CYA",
      "CY",
      "Cy Young Award",
      "ROY",
      "Rookie of the Year",
      "WSMVP",
      "World Series MVP",
      "Reliever",
      "Reliever of the Year",
    ];

    if (!mainAwards.includes(awardKey)) {
      // Include this as an "other major award"
      other.push({
        name: awardData.display_name || awardKey,
        count: awardData.count,
      });
    }
  });

  return other;
}

function updateComparisonTable(resA, resB, nameA, nameB) {
  const tbody = document.getElementById("comparisonBody");
  const thA = document.getElementById("playerAName");
  const thB = document.getElementById("playerBName");
  const photoA = document.getElementById("photoA");
  const photoB = document.getElementById("photoB");

  // Apply capitalization to the names before displaying
  const capitalizedNameA = capitalizePlayerName(nameA) || "Player A";
  const capitalizedNameB = capitalizePlayerName(nameB) || "Player B";

  thA.querySelector(".player-name").textContent = capitalizedNameA;
  thB.querySelector(".player-name").textContent = capitalizedNameB;

  photoA.src = resA?.photo_url || "";
  photoB.src = resB?.photo_url || "";

  if (resA?.photo_url) photoA.style.display = "block";
  else photoA.style.display = "none";
  if (resB?.photo_url) photoB.style.display = "block";
  else photoB.style.display = "none";

  tbody.innerHTML = "";

  if (!resA || !resB) {
    tbody.innerHTML = `<tr><td colspan='3'>Error loading player data.</td></tr>`;
    return;
  }
  if (resA.error || resB.error) {
    tbody.innerHTML = `<tr><td colspan='3'>${
      resA.error || resB.error
    }</td></tr>`;
    return;
  }

  if (resA.player_type !== resB.player_type) {
    tbody.innerHTML = `<tr><td colspan='3'>Cannot compare pitcher and hitter statistics.</td></tr>`;
    return;
  }

  const mode = resA.mode;
  const playerType = resA.player_type || "hitter";

  // Debug logging for awards
  // console.log("=== AWARDS DEBUG ===");
  // console.log("Player A awards:", resA.awards);
  // console.log("Player B awards:", resB.awards);

  if (["career", "combined", "live"].includes(mode)) {
    const statsA = extractStats(resA);
    const statsB = extractStats(resB);

    const currentLabelMap =
      playerType === "pitcher" ? pitcherLabelMap : hitterLabelMap;

    for (const key of Object.keys(currentLabelMap)) {
      const statName = currentLabelMap[key];
      let valA = statsA[key] ?? 0;
      let valB = statsB[key] ?? 0;

      if (playerType === "pitcher") {
        const decimalStats = ["war", "era", "whip", "innings_pitched"];
        if (decimalStats.includes(key)) {
          if (key === "war") {
            valA = valA ? Number(valA).toFixed(1) : "0.0";
            valB = valB ? Number(valB).toFixed(1) : "0.0";
          } else if (key === "innings_pitched") {
            valA = valA ? Number(valA).toFixed(1) : "0.0";
            valB = valB ? Number(valB).toFixed(1) : "0.0";
          } else {
            valA = valA ? Number(valA).toFixed(2) : "0.00";
            valB = valB ? Number(valB).toFixed(2) : "0.00";
          }
        }
      } else {
        const decimalStats = [
          "war",
          "batting_average",
          "on_base_percentage",
          "slugging_percentage",
          "ops",
        ];
        if (decimalStats.includes(key)) {
          if (key === "war") {
            valA = valA ? Number(valA).toFixed(1) : "0.0";
            valB = valB ? Number(valB).toFixed(1) : "0.0";
          } else {
            valA = valA ? Number(valA).toFixed(3).replace(/^0/, "") : ".000";
            valB = valB ? Number(valB).toFixed(3).replace(/^0/, "") : ".000";
          }
        } else if (key === "ops_plus") {
          valA = valA ? Math.round(valA) : 0;
          valB = valB ? Math.round(valB) : 0;
        }
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${valA}</td>
        <td style="background-color: #f1f3f4;"><strong>${statName}</strong></td>
        <td>${valB}</td>
      `;
      tbody.appendChild(row);
    }
  }

  // AWARDS SECTION - Fixed to properly check for awards
  //console.log("Checking awards existence...");
  const hasAwardsA = resA.awards && (resA.awards.summary || resA.awards.awards);
  const hasAwardsB = resB.awards && (resB.awards.summary || resB.awards.awards);

  if (mode === "live" || mode === "season") {
    console.log("Live or season mode detected, skipping awards section");
  } else if (hasAwardsA || hasAwardsB) {
    // console.log("Has awards A:", hasAwardsA);
    // console.log("Has awards B:", hasAwardsB);

    if (hasAwardsA || hasAwardsB) {
      // console.log("Processing awards data...");

      const awardsA = formatAwardsForStructuredDisplay(resA.awards);
      const awardsB = formatAwardsForStructuredDisplay(resB.awards);

      // console.log("Formatted awards A:", awardsA);
      // console.log("Formatted awards B:", awardsB);

      // Define award rows to display (only show if at least one player has the award)
      const awardRows = [
        {
          key: "championships",
          label: "Championships",
          valueA: awardsA.championships,
          valueB: awardsB.championships,
        },
        { key: "mvp", label: "MVP", valueA: awardsA.mvp, valueB: awardsB.mvp },
        {
          key: "cyYoung",
          label: "Cy Young",
          valueA: awardsA.cyYoung,
          valueB: awardsB.cyYoung,
        },
        {
          key: "royAward",
          label: "Rookie of Year",
          valueA: awardsA.royAward,
          valueB: awardsB.royAward,
        },
        {
          key: "worldSeriesMvp",
          label: "World Series MVP",
          valueA: awardsA.worldSeriesMvp,
          valueB: awardsB.worldSeriesMvp,
        },
        {
          key: "mlbAllStar",
          label: "All-Star Games",
          valueA: awardsA.mlbAllStar,
          valueB: awardsB.mlbAllStar,
        },
        {
          key: "goldGlove",
          label: "Gold Glove",
          valueA: awardsA.goldGlove,
          valueB: awardsB.goldGlove,
        },
        {
          key: "silverSlugger",
          label: "Silver Slugger",
          valueA: awardsA.silverSlugger,
          valueB: awardsB.silverSlugger,
        },
        {
          key: "relieverAward",
          label: "Reliever of Year",
          valueA: awardsA.relieverAward,
          valueB: awardsB.relieverAward,
        },
      ];

      // Track if any awards were added
      let awardsAdded = 0;

      // Add Awards & Honors header before the first award (only if we have awards to show)
      let hasAnyAwards = awardRows.some(
        (row) => row.valueA > 0 || row.valueB > 0
      );
      if (hasAnyAwards && awardsAdded === 0) {
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `<th colspan="3" class="stat-header">Awards & Honors (Through 2024 Season)</th>`;
        tbody.appendChild(headerRow);
      }

      // Only show awards where at least one player has a non-zero value
      awardRows.forEach((awardRow, index) => {
        if (awardRow.valueA > 0 || awardRow.valueB > 0) {
          const row = document.createElement("tr");

          // Display values - show 0 for players without awards, actual count for those with awards
          const displayA = awardRow.valueA > 0 ? awardRow.valueA : "0";
          const displayB = awardRow.valueB > 0 ? awardRow.valueB : "0";

          row.innerHTML = `
          <td style="text-align: center; padding: 8px;">${displayA}</td>
          <td style="text-align: center; padding: 8px; font-weight: bold; background-color: #f1f3f4;">${awardRow.label}</td>
          <td style="text-align: center; padding: 8px;">${displayB}</td>
        `;
          tbody.appendChild(row);
          awardsAdded++;

          //console.log(
          //  `Added award row: ${awardRow.label} - A: ${displayA}, B: ${displayB}`
          //);
        }
      });

      // Add other major awards if any
      const allOtherAwards = [
        ...(awardsA.otherMajor || awardsA.awards || []),
        ...(awardsB.otherMajor || awardsB.awards || []),
      ];
      const uniqueOtherAwards = [...new Set(allOtherAwards.map((a) => a.name))];

      uniqueOtherAwards.forEach((awardName) => {
        const countA =
          (awardsA.otherMajor || awardsA.awards || []).find(
            (a) => a.name === awardName
          )?.count || 0;
        const countB =
          (awardsB.otherMajor || awardsB.awards || []).find(
            (a) => a.name === awardName
          )?.count || 0;

        if (countA > 0 || countB > 0) {
          const row = document.createElement("tr");

          // Show actual count or 0, not empty
          const displayA = countA > 0 ? countA : "0";
          const displayB = countB > 0 ? countB : "0";

          row.innerHTML = `
          <td style="text-align: center; padding: 8px;">${displayA}</td>
          <td style="text-align: center; padding: 8px; font-weight: bold; background-color: #f1f3f4;">${awardName}</td>
          <td style="text-align: center; padding: 8px;">${displayB}</td>
        `;
          tbody.appendChild(row);
          awardsAdded++;
        }
      });

      // If no awards were added, show a debug message
      if (awardsAdded === 0) {
        console.log("No awards found to display");
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="3" style="text-align: center; padding: 12px; color: #666; font-style: italic;">No major awards found for either player</td>`;
        tbody.appendChild(row);
      } else {
        // console.log(`Successfully added ${awardsAdded} award rows`);
      }
    } else {
      console.log("No awards data found for either player");
      // console.log("resA.awards:", resA.awards);
      // console.log("resB.awards:", resB.awards);
    }
  }
  // SEASON MODE HANDLING (unchanged)
  if (mode === "season") {
    const statsA = extractStats(resA);
    const statsB = extractStats(resB);

    const years = new Set();
    statsA.forEach((s) => years.add(s.year));
    statsB.forEach((s) => years.add(s.year));

    let yearsArray = Array.from(years);
    const sortOrder = document.getElementById("viewMode").value;
    if (sortOrder === "oldest") {
      yearsArray.sort((a, b) => a - b);
    } else {
      yearsArray.sort((a, b) => b - a);
    }

    const seasonLabelMap =
      playerType === "pitcher" ? pitcherSeasonLabelMap : hitterSeasonLabelMap;

    yearsArray.forEach((year) => {
      const playerAStat = statsA.find((s) => s.year === year) || {};
      const playerBStat = statsB.find((s) => s.year === year) || {};

      const yearRow = document.createElement("tr");
      yearRow.innerHTML = `<td colspan="3" style="text-align: center; font-weight: bold; background-color: #f0f0f0; padding: 8px;">${year}</td>`;
      tbody.appendChild(yearRow);

      for (const key of Object.keys(seasonLabelMap)) {
        const statName = seasonLabelMap[key];

        let valA = playerAStat[key] ?? 0;
        let valB = playerBStat[key] ?? 0;

        if (playerType === "pitcher") {
          const decimalStats = ["war", "era", "whip", "innings_pitched"];
          if (decimalStats.includes(key)) {
            if (key === "war") {
              valA = valA ? Number(valA).toFixed(1) : "0.0";
              valB = valB ? Number(valB).toFixed(1) : "0.0";
            } else if (key === "innings_pitched") {
              valA = valA ? Number(valA).toFixed(1) : "0.0";
              valB = valB ? Number(valB).toFixed(1) : "0.0";
            } else {
              valA = valA ? Number(valA).toFixed(2) : "0.00";
              valB = valB ? Number(valB).toFixed(2) : "0.00";
            }
          }
        } else {
          const decimalStats = ["war", "ba", "obp", "slg", "ops"];
          if (decimalStats.includes(key)) {
            if (key === "war") {
              valA = valA ? Number(valA).toFixed(1) : "0.0";
              valB = valB ? Number(valB).toFixed(1) : "0.0";
            } else {
              valA = valA ? Number(valA).toFixed(3).replace(/^0/, "") : ".000";
              valB = valB ? Number(valB).toFixed(3).replace(/^0/, "") : ".000";
            }
          }
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${valA}</td>
          <td style="background-color: #f1f3f4;"><strong>${statName}</strong></td>
          <td>${valB}</td>
        `;
        tbody.appendChild(row);
      }
    });
  }
}

// ENHANCED FETCH WITH DISAMBIGUATION AND TWO-WAY HANDLING
async function fetchStats(name, mode, playerType = null) {
  try {
    let backendMode = mode;
    if (mode === "newest" || mode === "oldest") {
      backendMode = "season";
    }

    // Build URL with player_type parameter if specified
    let url = `/player-two-way?name=${encodeURIComponent(
      name
    )}&mode=${backendMode}`;
    if (playerType) {
      url += `&player_type=${playerType}`;
    }

    // Use the two-way endpoint instead of disambiguate
    const response = await fetch(url);

    if (response.status === 422) {
      // Multiple players found - handle disambiguation
      const data = await response.json();
      return await handleDisambiguation(name, data.suggestions, backendMode);
    }

    if (response.status === 423) {
      // Two-way player found - handle player type selection
      const data = await response.json();
      return await handleTwoWayPlayerSelection(name, data.options, backendMode);
    }

    if (response.ok) {
      return await response.json();
    }

    // If 404 or other error, try the disambiguate endpoint
    const fallbackUrl = `/player-disambiguate?name=${encodeURIComponent(
      name
    )}&mode=${backendMode}`;
    const fallbackResponse = await fetch(fallbackUrl);

    if (fallbackResponse.status === 422) {
      const data = await fallbackResponse.json();
      return await handleDisambiguation(name, data.suggestions, backendMode);
    }

    if (fallbackResponse.ok) {
      return await fallbackResponse.json();
    }

    // Final fallback to original endpoint
    const originalResponse = await fetch(
      `/player?name=${encodeURIComponent(name)}&mode=${backendMode}`
    );
    return await originalResponse.json();
  } catch (e) {
    //console.error("Fetch error:", e);
    return { error: "Failed to fetch data" };
  }
}

// Define which stats are "higher is better" vs "lower is better"
const statConfigurations = {
  // Higher is better stats
  WAR: { higherIsBetter: true },
  G: { higherIsBetter: true },
  PA: { higherIsBetter: true },
  H: { higherIsBetter: true },
  HR: { higherIsBetter: true },
  RBI: { higherIsBetter: true },
  SB: { higherIsBetter: true },
  BA: { higherIsBetter: true },
  OBP: { higherIsBetter: true },
  SLG: { higherIsBetter: true },
  OPS: { higherIsBetter: true },
  "OPS+": { higherIsBetter: true },
  Championships: { higherIsBetter: true },
  "All-Star": { higherIsBetter: true },
  "Gold Glove": { higherIsBetter: true },
  "Silver Slugger": { higherIsBetter: true },

  // Team stats
  GP: { higherIsBetter: true }, // Games Played
  W: { higherIsBetter: true }, // Wins
  L: { higherIsBetter: false }, // Losses (lower is better)
  "R/Gm": { higherIsBetter: true }, // Runs per game
  "RA/Gm": { higherIsBetter: false }, // Runs allowed per game (lower is better)
  "Playoff Apps.": { higherIsBetter: true }, // Playoff appearances
  "WS Apps.": { higherIsBetter: true }, // World Series appearances
  "WS Championships": { higherIsBetter: true }, // Championships

  // Head-to-head records
  "Reg Season": { higherIsBetter: true }, // More wins is better
  "Playoff Games": { higherIsBetter: true },
  "Playoff Series": { higherIsBetter: true },
  Playoffs: { higherIsBetter: true },

  // Awards - these are the formatted versions that appear in your table
  "**All-MLB Team - First Team**": { higherIsBetter: true },
  "**All-MLB Team - Second Team**": { higherIsBetter: true },
  "**Player of the Month**": { higherIsBetter: true },
  "**Player of the Week**": { higherIsBetter: true },
  "**TSN All-Star**": { higherIsBetter: true },
  "**MVP**": { higherIsBetter: true },
  "**Cy Young**": { higherIsBetter: true },
  "**Rookie of the Year**": { higherIsBetter: true },
  "**World Series MVP**": { higherIsBetter: true },
  "**All-Star Game MVP**": { higherIsBetter: true },
  "**Silver Slugger**": { higherIsBetter: true },
  "**Gold Glove**": { higherIsBetter: true },
  "**Hank Aaron Award**": { higherIsBetter: true },
  "**Comeback Player**": { higherIsBetter: true },

  // Clean versions without asterisks (fallback)
  "All-MLB Team - First Team": { higherIsBetter: true },
  "All-MLB Team - Second Team": { higherIsBetter: true },
  "Player of the Month": { higherIsBetter: true },
  "Player of the Week": { higherIsBetter: true },
  "TSN All-Star": { higherIsBetter: true },
  MVP: { higherIsBetter: true },
  "Cy Young": { higherIsBetter: true },
  "Rookie of the Year": { higherIsBetter: true },
  "World Series MVP": { higherIsBetter: true },
  "All-Star Game MVP": { higherIsBetter: true },
  "Hank Aaron Award": { higherIsBetter: true },
  "Comeback Player": { higherIsBetter: true },

  // Pitching stats - lower is better for some
  ERA: { higherIsBetter: false },
  WHIP: { higherIsBetter: false },
  L: { higherIsBetter: false }, // Losses

  // Pitching stats - higher is better
  W: { higherIsBetter: true }, // Wins
  K: { higherIsBetter: true }, // Strikeouts
  SO: { higherIsBetter: true }, // Strikeouts
  SV: { higherIsBetter: true }, // Saves
  IP: { higherIsBetter: true }, // Innings Pitched
  CG: { higherIsBetter: true }, // Complete Games
  SHO: { higherIsBetter: true }, // Shutouts
};

function highlightBetterStats(tableId = "comparisonTable") {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length !== 3) return; // Skip if not a stat row (player A, stat label, player B)

    // Skip section headers
    if (row.classList.contains("section-header")) return;

    const playerACell = cells[0];
    const statLabelCell = cells[1];
    const playerBCell = cells[2];

    const statLabel = statLabelCell.textContent.trim();

    // Skip section headers by text content
    if (
      statLabel.includes("Head-to-Head") ||
      statLabel.includes("Overall Stats")
    )
      return;

    // Handle head-to-head records specially (format: "5-3" vs "3-5")
    if (isHeadToHeadStat(statLabel)) {
      highlightHeadToHeadRecord(playerACell, playerBCell, statLabel);
      return;
    }

    // Extract award name from formats like "2**All-MLB Team - Second Team**6"
    let cleanStatLabel = statLabel;
    const asteriskMatch = statLabel.match(/\*\*(.*?)\*\*/);
    if (asteriskMatch) {
      cleanStatLabel = asteriskMatch[1]; // Extract text between ** **
    }

    // Try to find matching stat configuration
    let statConfig =
      statConfigurations[cleanStatLabel] ||
      statConfigurations["**" + cleanStatLabel + "**"] ||
      statConfigurations[statLabel];

    // If still not found, try partial matching for complex award names
    if (!statConfig) {
      const labelLower = cleanStatLabel.toLowerCase();
      for (const [key, config] of Object.entries(statConfigurations)) {
        const keyLower = key.toLowerCase().replace(/\*\*/g, "");
        if (labelLower.includes(keyLower) || keyLower.includes(labelLower)) {
          statConfig = config;
          break;
        }
      }
    }

    if (!statConfig) {
      console.log(
        `No configuration found for stat: "${statLabel}" (cleaned: "${cleanStatLabel}")`
      );
      return; // Skip unknown stats
    }

    // Parse values - handle different number formats
    const playerAValue = parseStatValue(playerACell.textContent.trim());
    const playerBValue = parseStatValue(playerBCell.textContent.trim());

    if (playerAValue === null || playerBValue === null) return; // Skip if can't parse

    // Remove existing highlighting
    playerACell.classList.remove("better-stat", "tied-stat");
    playerBCell.classList.remove("better-stat", "tied-stat");

    // Apply highlighting based on comparison
    if (playerAValue === playerBValue) {
      // Tied stats (optional)
      playerACell.classList.add("tied-stat");
      playerBCell.classList.add("tied-stat");
    } else {
      const playerABetter = statConfig.higherIsBetter
        ? playerAValue > playerBValue
        : playerAValue < playerBValue;

      if (playerABetter) {
        playerACell.classList.add("better-stat");
      } else {
        playerBCell.classList.add("better-stat");
      }
    }
  });
}

function isHeadToHeadStat(statLabel) {
  const h2hStats = [
    "Reg Season",
    "Playoff Games",
    "Playoff Series",
    "Playoffs",
  ];
  return h2hStats.includes(statLabel);
}

function highlightHeadToHeadRecord(cellA, cellB, statLabel) {
  const valueA = cellA.textContent.trim();
  const valueB = cellB.textContent.trim();

  // Parse records like "5-3" to extract wins
  const matchA = valueA.match(/^(\d+)-(\d+)$/);
  const matchB = valueB.match(/^(\d+)-(\d+)$/);

  if (!matchA || !matchB) return;

  const winsA = parseInt(matchA[1]);
  const winsB = parseInt(matchB[1]);

  // Remove existing highlighting
  cellA.classList.remove("better-stat", "tied-stat");
  cellB.classList.remove("better-stat", "tied-stat");

  if (winsA === winsB) {
    cellA.classList.add("tied-stat");
    cellB.classList.add("tied-stat");
  } else if (winsA > winsB) {
    cellA.classList.add("better-stat");
  } else {
    cellB.classList.add("better-stat");
  }
}

function parseStatValue(valueStr) {
  // Handle different stat formats
  if (!valueStr || valueStr === "-" || valueStr === "N/A") return null;

  // Remove commas and convert to number
  const cleanValue = valueStr.replace(/,/g, "");
  const numValue = parseFloat(cleanValue);

  return isNaN(numValue) ? null : numValue;
}

// Function to call highlighting after comparison table is populated
function applyStatHighlighting() {
  // Wait a bit for the table to be fully rendered
  setTimeout(highlightBetterStats, 100);
}

async function handleTwoWayPlayerSelection(originalName, options, mode) {
  return new Promise((resolve) => {
    showTwoWaySelectionModal(options, originalName, resolve, mode);
  });
}

function showTwoWaySelectionModal(options, originalName, callback, mode) {
  // Remove any existing modal
  const existingModal = document.getElementById("two-way-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "two-way-modal";
  modal.className = "modal";
  modal.style.cssText = `
    display: block;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
  `;

  const html = `
    <div class="modal-content" style="
      background-color: #fff;
      margin: 15% auto;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      width: 90%;
      max-width: 500px;
    ">
      <h3 style="margin-top: 0; margin-bottom: 16px; color: #333; font-size: 20px;">
        Two-Way Player Detected
      </h3>
      <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">
        ${originalName} was both a significant pitcher and hitter. Please select which stats to display:
      </p>
      <div class="player-type-options" style="margin-bottom: 24px;">
        ${options
          .map(
            (option) => `
          <div class="player-type-option" data-type="${option.type}" style="
            padding: 16px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
          " onmouseover="this.style.borderColor='#007bff'; this.style.backgroundColor='#f8f9ff';" 
             onmouseout="this.style.borderColor='#e9ecef'; this.style.backgroundColor='white';">
            <div class="option-content">
              <strong style="display: block; font-size: 16px; color: #333; margin-bottom: 4px;">
                ${option.label}
              </strong>
              <div style="font-size: 13px; color: #666;">
                ${
                  option.type === "pitcher"
                    ? "Wins, Losses, ERA, Strikeouts, etc."
                    : "Batting Average, Home Runs, RBIs, etc."
                }
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <button class="modal-close" style="
        background-color: #6c757d;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      " onmouseover="this.style.backgroundColor='#5a6268';" 
         onmouseout="this.style.backgroundColor='#6c757d';">
        Cancel
      </button>
    </div>
  `;

  modal.innerHTML = html;
  document.body.appendChild(modal);

  // Add event handlers
  modal.querySelectorAll(".player-type-option").forEach((option) => {
    option.addEventListener("click", async function () {
      const selectedType = this.dataset.type;
      modal.remove();

      // Fetch stats for selected player type using the two-way endpoint
      try {
        const response = await fetch(
          `/player-two-way?name=${encodeURIComponent(
            originalName
          )}&mode=${mode}&player_type=${selectedType}`
        );
        const result = await response.json();
        callback(result);
      } catch (error) {
        callback({ error: "Failed to fetch selected player type data" });
      }
    });
  });

  modal.querySelector(".modal-close").addEventListener("click", function () {
    modal.remove();
    callback({ error: "User cancelled two-way selection" });
  });

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
      callback({ error: "User cancelled two-way selection" });
    }
  });
}

async function showTwoWayComparisonModal(nameA, nameB, optionsA, optionsB) {
  return new Promise((resolve) => {
    // Remove any existing modal
    const existingModal = document.getElementById("two-way-comparison-modal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "two-way-comparison-modal";
    modal.className = "modal";
    modal.style.cssText = `
      display: block;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
    `;

    const html = `
      <div class="modal-content" style="
        background-color: #fff;
        margin: 15% auto;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        width: 90%;
        max-width: 500px;
        text-align: center;
      ">
        <h3 style="margin-top: 0; margin-bottom: 20px; color: #333; font-size: 24px;">
          Two-Way Players Comparison
        </h3>
        <p style="margin-bottom: 32px; color: #666; line-height: 1.6; font-size: 16px;">
          Both <strong>${nameA}</strong> and <strong>${nameB}</strong> were significant pitchers and hitters.<br>
          Choose which stats to compare:
        </p>
        
        <!-- Main comparison buttons -->
        <div style="margin-bottom: 24px;">
          <button class="comparison-type-btn" data-types="pitcher,pitcher" style="
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 8px;
            margin: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            min-width: 180px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(40, 167, 69, 0.4)';" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(40, 167, 69, 0.3)';">
            Compare as Pitchers
            <div style="font-size: 12px; font-weight: normal; opacity: 0.9; margin-top: 4px;">
              ERA, Wins, Strikeouts, etc.
            </div>
          </button>
          
          <button class="comparison-type-btn" data-types="hitter,hitter" style="
            background: linear-gradient(135deg, #007bff, #6f42c1);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 8px;
            margin: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            min-width: 180px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 123, 255, 0.4)';" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0, 123, 255, 0.3)';">
            Compare as Hitters
            <div style="font-size: 12px; font-weight: normal; opacity: 0.9; margin-top: 4px;">
              Batting Avg, Home Runs, RBIs, etc.
            </div>
          </button>
        </div>

        <!-- Advanced options (collapsible) -->
        <details style="margin-bottom: 24px; text-align: left;">
          <summary style="
            cursor: pointer; 
            color: #666; 
            font-size: 14px; 
            text-align: center;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
          " onmouseover="this.style.backgroundColor='#f8f9fa'" 
             onmouseout="this.style.backgroundColor='transparent'">
            Advanced: Mix & Match Stats
          </summary>
          
          <div style="padding: 16px; background-color: #f8f9fa; border-radius: 8px; margin-top: 8px;">
            <div style="display: flex; gap: 16px; justify-content: space-between;">
              <!-- Player A Selection -->
              <div style="flex: 1; padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; background: white;">
                <h5 style="margin: 0 0 8px 0; color: #333; text-align: center; font-size: 14px;">${nameA}</h5>
                <div class="player-type-selection" data-player="A">
                  ${optionsA
                    .map(
                      (option) => `
                    <label style="display: block; margin-bottom: 4px; cursor: pointer; font-size: 13px;">
                      <input type="radio" name="playerAType" value="${
                        option.type
                      }" style="margin-right: 6px;">
                      ${option.type === "pitcher" ? "Pitching" : "Hitting"}
                    </label>
                  `
                    )
                    .join("")}
                </div>
              </div>

              <!-- Player B Selection -->
              <div style="flex: 1; padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; background: white;">
                <h5 style="margin: 0 0 8px 0; color: #333; text-align: center; font-size: 14px;">${nameB}</h5>
                <div class="player-type-selection" data-player="B">
                  ${optionsB
                    .map(
                      (option) => `
                    <label style="display: block; margin-bottom: 4px; cursor: pointer; font-size: 13px;">
                      <input type="radio" name="playerBType" value="${
                        option.type
                      }" style="margin-right: 6px;">
                      ${option.type === "pitcher" ? "Pitching" : "Hitting"}
                    </label>
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>
            
            <button id="compare-custom" style="
              background-color: #fd7e14;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              margin-top: 12px;
              width: 100%;
            ">Compare Custom Selection</button>
          </div>
        </details>

        <button class="modal-close" style="
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        " onmouseover="this.style.backgroundColor='#5a6268';" 
           onmouseout="this.style.backgroundColor='#6c757d';">
          Cancel
        </button>
      </div>
    `;

    modal.innerHTML = html;
    document.body.appendChild(modal);

    // Main comparison buttons functionality
    modal.querySelectorAll(".comparison-type-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const types = btn.dataset.types.split(",");
        modal.remove();
        resolve({
          playerAType: types[0],
          playerBType: types[1],
        });
      });
    });

    // Custom comparison functionality
    modal.querySelector("#compare-custom").addEventListener("click", () => {
      const playerAType = modal.querySelector(
        'input[name="playerAType"]:checked'
      )?.value;
      const playerBType = modal.querySelector(
        'input[name="playerBType"]:checked'
      )?.value;

      if (!playerAType || !playerBType) {
        alert("Please select stat types for both players");
        return;
      }

      modal.remove();
      resolve({
        playerAType: playerAType,
        playerBType: playerBType,
      });
    });

    // Cancel functionality
    modal.querySelector(".modal-close").addEventListener("click", () => {
      modal.remove();
      resolve({ error: "User cancelled two-way comparison" });
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve({ error: "User cancelled two-way comparison" });
      }
    });
  });
}

async function handleDisambiguation(originalName, suggestions, mode) {
  return new Promise((resolve) => {
    showDisambiguationModal(suggestions, originalName, resolve, mode);
  });
}

let currentDisambiguationPlayer = null;

function showDisambiguationModal(suggestions, originalName, callback, mode) {
  // Remove any existing modal
  const existingModal = document.getElementById("disambiguation-modal");
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");
  modal.id = "disambiguation-modal";
  modal.className = "modal";
  modal.style.cssText = `
    display: block;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
  `;

  const cleanName = originalName.split(" Jr.")[0].split(" Sr.")[0];

  const html = `
    <div class="modal-content" style="
      background-color: #fff;
      margin: 15% auto;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      width: 90%;
      max-width: 500px;
    ">
      <h3 style="margin-top: 0; margin-bottom: 16px; color: #333; font-size: 20px;">
        Multiple Players Found
      </h3>
      <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">
        Found multiple players named "${cleanName}". Please select which player:
      </p>
      <div class="player-options" style="margin-bottom: 24px;">
        ${suggestions
          .map(
            (player, index) => `
          <div class="player-option" data-name="${
            player.name
          }" data-playerid="${player.playerid}" style="
            padding: 16px;
            border: 2px solid #e9ecef;
            border-radius: 6px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          " onmouseover="this.style.borderColor='#007bff'; this.style.backgroundColor='#f8f9ff';" 
             onmouseout="this.style.borderColor='#e9ecef'; this.style.backgroundColor='white';">
            <div class="player-details">
              <strong style="display: block; font-size: 16px; color: #333; margin-bottom: 4px;">
                ${player.name}
              </strong>
              <div class="player-meta" style="font-size: 13px; color: #666;">
                Debut: ${player.debut_year} | Born: ${player.birth_year}
                ${player.playerid ? ` | ID: ${player.playerid}` : ""}
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      <button class="modal-close" style="
        background-color: #6c757d;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      " onmouseover="this.style.backgroundColor='#5a6268';" 
         onmouseout="this.style.backgroundColor='#6c757d';">
        Cancel
      </button>
    </div>
  `;

  modal.innerHTML = html;
  document.body.appendChild(modal);

  // Add event handlers
  modal.querySelectorAll(".player-option").forEach((option) => {
    option.addEventListener("click", async function () {
      const selectedName = this.dataset.name;
      const selectedPlayerId = this.dataset.playerid;
      //console.log(`User selected: ${selectedName} (ID: ${selectedPlayerId})`);
      modal.remove();

      // Hide any open dropdowns to prevent interference
      hideAllDropdowns();

      // Fetch stats for selected player using the exact name from suggestions
      try {
        // console.log(`Fetching stats for selected player: ${selectedName}`);
        const response = await fetch(
          `/player-two-way?name=${encodeURIComponent(
            selectedName
          )}&mode=${mode}`
        );
        // console.log(`Response status for selected player: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          // console.log("Successfully fetched selected player data:", result);
          // Add the selected name to the result so we can use it in the display
          result.selected_name = selectedName;
          result.original_search_name = originalName;
          callback(result);
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ error: `HTTP ${response.status}` }));
          console.error("Error fetching selected player:", errorData);
          callback(errorData);
        }
      } catch (error) {
        console.error("Error in disambiguation selection:", error);
        callback({ error: "Failed to fetch selected player data" });
      }
    });
  });

  modal.querySelector(".modal-close").addEventListener("click", function () {
    modal.remove();
    callback({ error: "User cancelled disambiguation" });
  });

  // Close modal when clicking outside
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      modal.remove();
      callback({ error: "User cancelled disambiguation" });
    }
  });
}

// Function to properly capitalize player names
function capitalizePlayerName(name) {
  if (!name) return name;

  // Handle special cases and particles that should remain lowercase
  const lowercaseWords = [
    "de",
    "del",
    "la",
    "le",
    "van",
    "von",
    "da",
    "dos",
    "el",
  ];
  const romanNumerals = [
    "ii",
    "iii",
    "iv",
    "v",
    "vi",
    "vii",
    "viii",
    "ix",
    "x",
  ];

  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      // Always capitalize first word
      if (index === 0) {
        return capitalizeWord(word);
      }

      // Handle Jr., Sr., III, etc.
      if (word.includes(".") || romanNumerals.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }

      // Keep certain particles lowercase (unless they're the first word)
      if (lowercaseWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }

      // Handle hyphenated names (like Mary-Jane)
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => capitalizeWord(part))
          .join("-");
      }

      // Handle apostrophes (like O'Connor, D'Angelo)
      if (word.includes("'")) {
        return word
          .split("'")
          .map((part) => capitalizeWord(part))
          .join("'");
      }

      // Regular capitalization
      return capitalizeWord(word);
    })
    .join(" ");
}

// Helper function to capitalize a single word
function capitalizeWord(word) {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Alternative simpler function if you just want basic title case
function simpleCapitalize(name) {
  if (!name) return name;

  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function comparePlayers() {
  const nameA = document.getElementById("playerA").value.trim();
  const nameB = document.getElementById("playerB").value.trim();
  const mode = document.getElementById("viewMode").value;

  if (!nameA || !nameB) {
    alert("Please enter both player names (first and last).");
    return;
  }

  // Hide any open dropdowns
  hideAllDropdowns();

  // Show loading indicator
  const tbody = document.getElementById("comparisonBody");
  tbody.innerHTML = `<tr><td colspan='4' style='text-align: center; padding: 20px;'>Loading player data...</td></tr>`;

  console.log(`=== COMPARING PLAYERS ===`);
  console.log(`Player A: ${nameA}`);
  console.log(`Player B: ${nameB}`);
  console.log(`Mode: ${mode}`);

  // First, try to fetch both players without player_type to detect if they're two-way
  const [initialResA, initialResB] = await Promise.all([
    fetchStatsInitial(nameA, mode),
    fetchStatsInitial(nameB, mode),
  ]);

  // Handle disambiguation for both players if needed
  let resA = initialResA;
  let resB = initialResB;

  if (resA && resA.error && resA.error.includes("Multiple players found")) {
    resA = await handleDisambiguation(nameA, resA.suggestions, mode);
  }

  if (resB && resB.error && resB.error.includes("Multiple players found")) {
    resB = await handleDisambiguation(nameB, resB.suggestions, mode);
  }

  // Check if both players are two-way players
  const playerAIsTwoWay = resA && resA.player_type === "two-way";
  const playerBIsTwoWay = resB && resB.player_type === "two-way";

  console.log(`Player A is two-way: ${playerAIsTwoWay}`);
  console.log(`Player B is two-way: ${playerBIsTwoWay}`);

  // Handle different two-way scenarios
  if (playerAIsTwoWay && playerBIsTwoWay) {
    // Both are two-way players - show coordinated selection modal
    const selectedTypes = await showTwoWayComparisonModal(
      nameA,
      nameB,
      resA.options,
      resB.options
    );
    if (selectedTypes.error) {
      tbody.innerHTML = `<tr><td colspan='4' style='text-align: center; padding: 20px;'>${selectedTypes.error}</td></tr>`;
      return;
    }

    // Fetch stats with selected types
    resA = await fetchStats(nameA, mode, selectedTypes.playerAType);
    resB = await fetchStats(nameB, mode, selectedTypes.playerBType);
  } else if (playerAIsTwoWay && !playerBIsTwoWay) {
    // Only Player A is two-way
    const selectedType = await handleTwoWayPlayerSelection(
      nameA,
      resA.options,
      mode
    );
    if (selectedType.error) {
      tbody.innerHTML = `<tr><td colspan='4' style='text-align: center; padding: 20px;'>${selectedType.error}</td></tr>`;
      return;
    }
    resA = selectedType;
  } else if (!playerAIsTwoWay && playerBIsTwoWay) {
    // Only Player B is two-way
    const selectedType = await handleTwoWayPlayerSelection(
      nameB,
      resB.options,
      mode
    );
    if (selectedType.error) {
      tbody.innerHTML = `<tr><td colspan='4' style='text-align: center; padding: 20px;'>${selectedType.error}</td></tr>`;
      return;
    }
    resB = selectedType;
  }

  // Use the selected names if available, otherwise use the input names
  const displayNameA = resA?.selected_name || nameA;
  const displayNameB = resB?.selected_name || nameB;

  updateComparisonTable(resA, resB, displayNameA, displayNameB);
  applyStatHighlighting();
}

async function fetchStatsInitial(name, mode) {
  try {
    let backendMode = mode;
    if (mode === "newest" || mode === "oldest") {
      backendMode = "season";
    }

    const url = `/player-two-way?name=${encodeURIComponent(
      name
    )}&mode=${backendMode}`;
    const response = await fetch(url);

    if (response.status === 422) {
      // Multiple players found - return for handling
      const data = await response.json();
      return { error: "Multiple players found", suggestions: data.suggestions };
    }

    if (response.status === 423) {
      // Two-way player found
      const data = await response.json();
      return data; // Return the two-way data for handling
    }

    if (response.ok) {
      return await response.json();
    }

    // Fallback to original endpoint
    const fallbackResponse = await fetch(
      `/player?name=${encodeURIComponent(name)}&mode=${backendMode}`
    );
    return await fallbackResponse.json();
  } catch (e) {
    console.error("Fetch error:", e);
    return { error: "Failed to fetch data" };
  }
}

document.getElementById("viewMode").addEventListener("change", comparePlayers);

// CUSTOM DROPDOWN FUNCTIONALITY
let searchTimeout;
let popularPlayersCache = null;
let currentDropdown = null;
const SEARCH_DELAY = 500;

// Show dropdown with players
function showDropdown(inputId, players) {
  let dropdownId;

  // Determine dropdown ID based on input ID
  if (inputId === "playerA") dropdownId = "dropdownA";
  else if (inputId === "playerB") dropdownId = "dropdownB";
  else if (inputId === "teamA") dropdownId = "dropdownTeamA";
  else if (inputId === "teamB") dropdownId = "dropdownTeamB";

  if (!dropdownId) return;

  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // Hide other dropdowns first
  hideAllDropdowns();

  dropdown.innerHTML = "";

  if (!players || players.length === 0) {
    dropdown.innerHTML =
      '<div class="dropdown-item" style="color: #999; cursor: default;">No players found</div>';
  } else {
    players.forEach((player) => {
      const item = document.createElement("div");
      item.className = "dropdown-item";

      if (typeof player === "string") {
        item.textContent = player;
        item.dataset.value = player;
      } else {
        const name = player.name || player.display;
        const display = player.display || player.name;

        item.innerHTML = `${name}${
          display !== name ? `<span class="player-years">${display}</span>` : ""
        }`;
        item.dataset.value = name;
      }

      item.addEventListener("click", () => {
        document.getElementById(inputId).value = item.dataset.value;
        hideDropdown(dropdownId);
        // Auto-compare if both fields are filled
        const isTeamInput = inputId.startsWith("team");
        if (isTeamInput) {
          const otherInput = inputId === "teamA" ? "teamB" : "teamA";
          if (document.getElementById(otherInput).value.trim()) {
            compareTeams();
          }
        } else {
          const otherInput = inputId === "playerA" ? "playerB" : "playerA";
          if (document.getElementById(otherInput).value.trim()) {
            comparePlayers();
          }
        }
      });

      dropdown.appendChild(item);
    });
  }

  dropdown.classList.add("show");
  currentDropdown = dropdownId;
}

// Hide specific dropdown
function hideDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.remove("show");
  if (currentDropdown === dropdownId) {
    currentDropdown = null;
  }
}

// Hide all dropdowns
function hideAllDropdowns() {
  ["dropdownA", "dropdownB", "dropdownTeamA", "dropdownTeamB"].forEach((id) => {
    const dropdown = document.getElementById(id);
    if (dropdown) {
      dropdown.classList.remove("show");
    }
  });
  currentDropdown = null;
}

// Load popular players
async function loadPopularPlayers(inputId) {
  if (popularPlayersCache) {
    showDropdown(inputId, popularPlayersCache);
    return;
  }

  try {
    const response = await fetch("/popular-players");
    if (response.ok) {
      const players = await response.json();
      popularPlayersCache = players;
      showDropdown(inputId, players);
    } else {
      const fallback = [
        "Mike Trout",
        "Aaron Judge",
        "Mookie Betts",
        "Ronald Acuña",
        "Juan Soto",
        "Gerrit Cole",
        "Jacob deGrom",
        "Clayton Kershaw",
        "Vladimir Guerrero Jr.",
        "Fernando Tatis Jr.",
        "Shane Bieber",
        "Freddie Freeman",
        "Manny Machado",
        "Jose Altuve",
        "Kyle Tucker",
      ];
      showDropdown(inputId, fallback);
    }
  } catch (error) {
    console.error("Error loading popular players:", error);
    const fallback = [
      "Mike Trout",
      "Aaron Judge",
      "Mookie Betts",
      "Ronald Acuña",
      "Juan Soto",
      "Gerrit Cole",
      "Jacob deGrom",
      "Clayton Kershaw",
    ];
    showDropdown(inputId, fallback);
  }
}

// Search players
async function searchPlayersEnhanced(query, inputId) {
  try {
    const response = await fetch(
      `/search-players?q=${encodeURIComponent(query)}`
    );
    if (response.ok) {
      const players = await response.json();
      const formattedPlayers = players.map((player) => ({
        name: player.original_name || player.name,
        display: player.display,
      }));
      showDropdown(inputId, formattedPlayers);
    }
  } catch (error) {
    console.error("Enhanced search error:", error);
    if (popularPlayersCache) {
      showDropdown(inputId, popularPlayersCache);
    }
  }
}

// Input event handler
function handlePlayerInput(e) {
  const query = e.target.value.trim();
  const inputId = e.target.id;

  clearTimeout(searchTimeout);

  if (query.length < 2) {
    searchTimeout = setTimeout(() => {
      loadPopularPlayers(inputId);
    }, 100);
    return;
  }

  searchTimeout = setTimeout(() => {
    searchPlayersEnhanced(query, inputId);
  }, SEARCH_DELAY);
}

// Click event handler
function handlePlayerClick(e) {
  const inputId = e.target.id;
  const query = e.target.value.trim();

  if (query.length < 2) {
    loadPopularPlayers(inputId);
  } else {
    searchPlayersEnhanced(query, inputId);
  }
}

// Focus event handler
function handlePlayerFocus(e) {
  const inputId = e.target.id;
  const query = e.target.value.trim();

  if (query.length < 2) {
    loadPopularPlayers(inputId);
  } else {
    searchPlayersEnhanced(query, inputId);
  }
}

// Handle keyboard navigation
function handleEnterKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const dropdownId = e.target.id === "playerA" ? "dropdownA" : "dropdownB";
    hideDropdown(dropdownId);
    comparePlayers();
  } else if (e.key === "Escape") {
    const dropdownId = e.target.id === "playerA" ? "dropdownA" : "dropdownB";
    hideDropdown(dropdownId);
  }
}

// Setup event listeners
function setupPlayerAutofill() {
  const playerAInput = document.getElementById("playerA");
  const playerBInput = document.getElementById("playerB");

  if (playerAInput) {
    playerAInput.addEventListener("input", handlePlayerInput);
    playerAInput.addEventListener("click", handlePlayerClick);
    playerAInput.addEventListener("focus", handlePlayerFocus);
    playerAInput.addEventListener("keydown", handleEnterKey);
  }

  if (playerBInput) {
    playerBInput.addEventListener("input", handlePlayerInput);
    playerBInput.addEventListener("click", handlePlayerClick);
    playerBInput.addEventListener("focus", handlePlayerFocus);
    playerBInput.addEventListener("keydown", handleEnterKey);
  }

  // Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (currentDropdown && !e.target.closest(".input-container")) {
      hideAllDropdowns();
    }
  });
}

// Simplified team stats - matching StatHead format exactly
const teamStatsLabelMap = {
  // Team Record
  gp: "GP",
  w: "W",
  l: "L",
  rpg: "R/Gm",
  rapg: "RA/Gm",

  // Playoff stats (you'll need to add these to your backend)
  playoff_apps: "Playoff Apps.",
  ws_apps: "WS Apps.",
  ws_championships: "WS Championships",
};

// Simplified fetch function - backend now returns combined stats
async function fetchTeamStats(team, mode) {
  try {
    const response = await fetch(
      `/team?team=${encodeURIComponent(team)}&mode=${mode}`
    );
    return await response.json();
  } catch (e) {
    console.error("Team fetch error:", e);
    return { error: "Failed to fetch team data" };
  }
}

// Fetch head-to-head record between two teams
async function fetchHeadToHeadRecord(teamA, teamB, mode) {
  try {
    let url = `/team/h2h?team_a=${encodeURIComponent(
      teamA
    )}&team_b=${encodeURIComponent(teamB)}`;

    // If in season mode, try to extract year for filtered H2H
    if (mode === "season") {
      const yearMatch =
        teamA.match(/\b(19|20)\d{2}\b/) || teamB.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        url += `&year=${yearMatch[0]}`;
      }
    }

    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    console.error(e);
    return { error: "Failed to fetch H2H data" };
  }
}

// Team comparison function
async function compareTeams() {
  const teamA = document.getElementById("teamA").value.trim();
  const teamB = document.getElementById("teamB").value.trim();
  const mode = document.getElementById("teamViewMode").value;

  if (!teamA || !teamB) {
    alert("Please enter both teams (e.g., '2024 Cubs' or 'Cubs')");
    return;
  }

  const tbody = document.getElementById("teamComparisonBody");
  tbody.innerHTML = `<tr><td colspan='3' style='text-align: center; padding: 20px;'>Loading team data...</td></tr>`;

  const [resA, resB] = await Promise.all([
    fetchTeamStats(teamA, mode),
    fetchTeamStats(teamB, mode),
  ]);

  updateTeamComparisonTable(resA, resB, teamA, teamB, mode);

  // Load team logos
  const logoA = document.getElementById("teamLogoA");
  const logoB = document.getElementById("teamLogoB");

  if (resA?.team_logo && logoA) {
    loadTeamLogo(resA.team_logo, logoA, resA.team_name);
  }

  if (resB?.team_logo && logoB) {
    loadTeamLogo(resB.team_logo, logoB, resB.team_name);
  }
}

function updateTeamComparisonTable(resA, resB, teamA, teamB, mode) {
  const tbody = document.getElementById("teamComparisonBody");
  const thA = document.getElementById("teamAName");
  const thB = document.getElementById("teamBName");

  // Update headers with team names
  thA.innerHTML = `
        <div class="team-header">
            <img id="teamLogoA" class="team-logo" style="display: none;" alt="Team A Logo">
            <span class="team-name">${resA?.team_name || teamA}</span>
        </div>
    `;

  thB.innerHTML = `
        <div class="team-header">
            <img id="teamLogoB" class="team-logo" style="display: none;" alt="Team B Logo">
            <span class="team-name">${resB?.team_name || teamB}</span>
        </div>
    `;

  tbody.innerHTML = "";

  if (!resA || !resB) {
    tbody.innerHTML = `<tr><td colspan='3'>Error loading team data.</td></tr>`;
    return;
  }

  if (resA.error || resB.error) {
    tbody.innerHTML = `<tr><td colspan='3'>${
      resA.error || resB.error
    }</td></tr>`;
    return;
  }

  const statsA = resA.stats;
  const statsB = resB.stats;

  // Head-to-Head Section
  addSectionToTable(tbody, "Head-to-Head");

  // Fetch and display H2H records
  fetchHeadToHeadRecord(teamA, teamB, mode)
    .then((h2hData) => {
      // Clear the loading message first
      const h2hRows = tbody.querySelectorAll("tr");
      if (h2hRows.length > 1) {
        // Remove any existing H2H data rows after the header
        for (let i = h2hRows.length - 1; i > 0; i--) {
          const row = h2hRows[i];
          if (row.textContent.includes("Head-to-Head")) break;
          if (row.textContent.includes("Overall Stats")) break;
          row.remove();
        }
      }

      if (h2hData && h2hData.head_to_head) {
        const h2h = h2hData.head_to_head;

        // Regular season record
        const regRecord = h2h.regular_season;
        const teamAReg = regRecord.team_a_wins || 0;
        const teamBReg = regRecord.team_b_wins || 0;
        addStatRowAfterSection(
          tbody,
          "Head-to-Head",
          `${teamAReg}-${teamBReg}`,
          "Reg Season",
          `${teamBReg}-${teamAReg}`
        );

        // Playoff record - use the correct data structure
        const playoffRecord = h2h.playoffs;
        let teamAPlayoff = 0;
        let teamBPlayoff = 0;

        // Check if we have game_wins data (individual games) or series_wins data
        if (playoffRecord.game_wins) {
          teamAPlayoff = playoffRecord.game_wins.team_a || 0;
          teamBPlayoff = playoffRecord.game_wins.team_b || 0;
          addStatRowAfterSection(
            tbody,
            "Head-to-Head",
            `${teamAPlayoff}-${teamBPlayoff}`,
            "Playoff Games",
            `${teamBPlayoff}-${teamAPlayoff}`
          );
        } else if (playoffRecord.series_wins) {
          // Fallback to series wins if game wins not available
          teamAPlayoff = playoffRecord.series_wins.team_a || 0;
          teamBPlayoff = playoffRecord.series_wins.team_b || 0;
          addStatRowAfterSection(
            tbody,
            "Head-to-Head",
            `${teamAPlayoff}-${teamBPlayoff}`,
            "Playoff Series",
            `${teamBPlayoff}-${teamAPlayoff}`
          );
        } else {
          // Legacy format fallback
          teamAPlayoff = playoffRecord.team_a_wins || 0;
          teamBPlayoff = playoffRecord.team_b_wins || 0;
          addStatRowAfterSection(
            tbody,
            "Head-to-Head",
            `${teamAPlayoff}-${teamBPlayoff}`,
            "Playoffs",
            `${teamBPlayoff}-${teamAPlayoff}`
          );
        }
      }

      // Add Overall Stats section after H2H
      addSectionToTable(tbody, "Overall Stats (Through 2024)");

      // Stats in exact StatHead order from the screenshot
      const statsOrder = [
        "gp",
        "w",
        "l",
        "rpg",
        "rapg",
        "playoff_apps",
        "ws_apps",
        "ws_championships",
      ];

      // Display stats in order
      statsOrder.forEach((key) => {
        if (teamStatsLabelMap[key]) {
          const statName = teamStatsLabelMap[key];
          let valA = statsA[key] !== undefined ? statsA[key] : 0;
          let valB = statsB[key] !== undefined ? statsB[key] : 0;

          // Format values
          valA = formatStatValue(key, valA);
          valB = formatStatValue(key, valB);

          addStatRow(tbody, valA, statName, valB);
        }
      });
      setTimeout(() => highlightBetterStats("teamComparisonTable"), 100);
    })
    .catch((error) => {
      console.error("H2H fetch error:", error);
      // Add fallback H2H data
      addStatRowAfterSection(tbody, "Head-to-Head", "0-0", "Reg Season", "0-0");

      // Still add Overall Stats section
      addSectionToTable(tbody, "Overall Stats");

      const statsOrder = [
        "gp",
        "w",
        "l",
        "rpg",
        "rapg",
        "playoff_apps",
        "ws_apps",
        "ws_championships",
      ];

      statsOrder.forEach((key) => {
        if (teamStatsLabelMap[key]) {
          const statName = teamStatsLabelMap[key];
          let valA = statsA[key] !== undefined ? statsA[key] : 0;
          let valB = statsB[key] !== undefined ? statsB[key] : 0;

          valA = formatStatValue(key, valA);
          valB = formatStatValue(key, valB);

          addStatRow(tbody, valA, statName, valB);
        }
      });
      setTimeout(() => highlightBetterStats("teamComparisonTable"), 100);
    });
}

function addSectionToTable(tbody, sectionName) {
  const row = document.createElement("tr");
  row.classList.add("section-header");
  row.innerHTML = `<td colspan='3' style='background-color: #e0e0e0; color: black; text-align: center; font-weight: bold; padding: 8px; font-size: 1.1rem;'>${sectionName}</td>`;
  tbody.appendChild(row);
}

function addStatRow(tbody, valA, statName, valB) {
  const row = document.createElement("tr");
  row.innerHTML = `
        <td style="text-align: center;">${valA}</td>
        <td style="background-color: #f1f3f4; text-align: center;"><strong>${statName}</strong></td>
        <td style="text-align: center;">${valB}</td>
    `;
  tbody.appendChild(row);
}

function addStatRowAfterSection(tbody, sectionName, valA, statName, valB) {
  // Find the section header
  const rows = tbody.querySelectorAll("tr");
  let insertIndex = -1;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i].textContent.includes(sectionName)) {
      insertIndex = i + 1;
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[j].classList.contains("section-header")) {
          break;
        }
        insertIndex = j + 1;
      }
      break;
    }
  }

  const row = document.createElement("tr");
  row.innerHTML = `
        <td style="text-align: center;">${valA}</td>
        <td style="background-color: #f1f3f4; text-align: center;"><strong>${statName}</strong></td>
        <td style="text-align: center;">${valB}</td>
    `;

  if (insertIndex >= 0 && insertIndex < tbody.children.length) {
    tbody.insertBefore(row, tbody.children[insertIndex]);
  } else {
    tbody.appendChild(row);
  }
}

function formatStatValue(statKey, value) {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return value;

  // Runs per game stats (show decimal)
  if (statKey === "rpg" || statKey === "rapg") {
    return numValue.toFixed(1);
  }

  // Everything else - whole numbers
  return Math.round(numValue).toString();
}

// Team logo functions (unchanged from your original code)
function loadTeamLogo(logoData, imgElement, teamName = "") {
  if (!logoData || !imgElement) {
    setDefaultTeamLogo(imgElement, teamName);
    return;
  }

  const urlsToTry = [];
  if (logoData.primary) urlsToTry.push(logoData.primary);
  if (logoData.fallbacks && Array.isArray(logoData.fallbacks)) {
    urlsToTry.push(...logoData.fallbacks);
  }

  tryNextLogoUrl(urlsToTry, 0, imgElement, teamName);
}

function tryNextLogoUrl(urls, index, imgElement, teamName) {
  if (index >= urls.length) {
    setDefaultTeamLogo(imgElement, teamName);
    return;
  }

  const img = new Image();
  const timeout = setTimeout(() => {
    img.onload = null;
    img.onerror = null;
    tryNextLogoUrl(urls, index + 1, imgElement, teamName);
  }, 5000);

  img.onload = function () {
    clearTimeout(timeout);
    imgElement.src = urls[index];
    imgElement.style.display = "block";
  };

  img.onerror = function () {
    console.log(`Logo URL failed: ${urls[index]}`);
    tryNextLogoUrl(urls, index + 1, imgElement, teamName);
  };

  img.src = urls[index];
}

function setDefaultTeamLogo(imgElement, teamName = "") {
  const initials = teamName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const svg = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" fill="#003366" stroke="#ffffff" stroke-width="2"/>
            <text x="30" y="38" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">
                ${initials || "?"}
            </text>
        </svg>
    `;

  imgElement.src = "data:image/svg+xml;base64," + btoa(svg);
  imgElement.style.display = "block";
}

// Mode switching (if you still need tabs)
function switchMode(mode) {
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".comparison-section").forEach((section) => {
    section.classList.remove("active");
  });
  document.getElementById(mode + "-section").classList.add("active");
}

// ADD THESE VARIABLES at the top with your existing variables
let teamSearchTimeout;
let popularTeamsCache = null;

// Load popular teams
async function loadPopularTeams(inputId) {
  const fallback = [
    "Yankees",
    "Dodgers",
    "Cardinals",
    "Red Sox",
    "Giants",
    "Cubs",
    "Phillies",
    "Braves",
    "Tigers",
    "Pirates",
    "Astros",
    "Mets",
    "Angels",
    "Padres",
    "Brewers",
    "Guardians",
    "Twins",
    "Royals",
    "Orioles",
    "Blue Jays",
    "2016 Cubs",
    "2020 Dodgers",
    "1998 Yankees",
    "2004 Red Sox",
    "2019 Nationals",
    "2017 Astros",
    "2018 Red Sox",
  ];
  showDropdown(inputId, fallback);
}

// Search teams
async function searchTeams(query, inputId) {
  const allTeams = [
    "Yankees",
    "Dodgers",
    "Cardinals",
    "Red Sox",
    "Giants",
    "Cubs",
    "Phillies",
    "Braves",
    "Tigers",
    "Pirates",
    "Astros",
    "Mets",
    "Angels",
    "Padres",
    "Brewers",
    "Guardians",
    "Twins",
    "Royals",
    "Orioles",
    "Blue Jays",
    "2016 Cubs",
    "2020 Dodgers",
    "1998 Yankees",
    "2004 Red Sox",
    // Add more teams as needed
  ];

  const filtered = allTeams.filter((team) =>
    team.toLowerCase().includes(query.toLowerCase())
  );
  showDropdown(inputId, filtered);
}

// Team input event handlers
function handleTeamInput(e) {
  const query = e.target.value.trim();
  const inputId = e.target.id;

  clearTimeout(teamSearchTimeout);

  if (query.length < 2) {
    teamSearchTimeout = setTimeout(() => {
      loadPopularTeams(inputId);
    }, 100);
    return;
  }

  teamSearchTimeout = setTimeout(() => {
    searchTeams(query, inputId);
  }, SEARCH_DELAY);
}

function handleTeamClick(e) {
  const inputId = e.target.id;
  const query = e.target.value.trim();

  if (query.length < 2) {
    loadPopularTeams(inputId);
  } else {
    searchTeams(query, inputId);
  }
}

function handleTeamFocus(e) {
  const inputId = e.target.id;
  const query = e.target.value.trim();

  if (query.length < 2) {
    loadPopularTeams(inputId);
  } else {
    searchTeams(query, inputId);
  }
}

// Handle Enter key for teams
function handleTeamEnterKey(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const dropdownId =
      e.target.id === "teamA" ? "dropdownTeamA" : "dropdownTeamB";
    hideDropdown(dropdownId);
    compareTeams();
  } else if (e.key === "Escape") {
    const dropdownId =
      e.target.id === "teamA" ? "dropdownTeamA" : "dropdownTeamB";
    hideDropdown(dropdownId);
  }
}

// Setup team autofill functionality
function setupTeamAutofill() {
  const teamAInput = document.getElementById("teamA");
  const teamBInput = document.getElementById("teamB");

  if (teamAInput) {
    teamAInput.addEventListener("input", handleTeamInput);
    teamAInput.addEventListener("click", handleTeamClick);
    teamAInput.addEventListener("focus", handleTeamFocus);
    teamAInput.addEventListener("keydown", handleTeamEnterKey);
  }

  if (teamBInput) {
    teamBInput.addEventListener("input", handleTeamInput);
    teamBInput.addEventListener("click", handleTeamClick);
    teamBInput.addEventListener("focus", handleTeamFocus);
    teamBInput.addEventListener("keydown", handleTeamEnterKey);
  }
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Set default values
  document.getElementById("playerA").value = "Kyle Schwarber";
  document.getElementById("playerB").value = "Kyle Tucker";
  document.getElementById("viewMode").value = "combined";

  document.getElementById("teamA").value = "Cubs";
  document.getElementById("teamB").value = "Dodgers";

  // Initialize custom dropdown functionality
  setupPlayerAutofill();
  setupTeamAutofill();
  // Run initial comparison
  comparePlayers();
  compareTeams();
});
