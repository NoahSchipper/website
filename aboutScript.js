const skills = [
  {
    title: "JavaScript",
    type: "Language",
    use: "Schipper Translate backend, website work (like this display)",
    icon: "⚡",
  },
  {
    title: "HTML/CSS",
    type: "Languages",
    use: "Schipper Translate frontend, website styling",
    icon: "🎨",
  },
  {
    title: "Java",
    type: "Language",
    use: "Blackjack game, educational programs and GUI applications",
    icon: "☕",
  },
  {
    title: "Python",
    type: "Language",
    use: "basic programs and explorations",
    icon: "🐍",
  },
  {
    title: "C/Assembly",
    type: "Languages",
    use: "Low-level programming, learning about computer architecture",
    icon: "⚙️",
  },
  {
    title: "C++",
    type: "Language",
    use: "Learning about object-oriented programming, data structures, and algorithms",
    icon: "➕",
  },
  {
    title: "SQL",
    type: "Language",
    use: "Database management, data retrieval, and manipulation",
    icon: "🗄️🔍",
  },
  {
    title: "VS Code",
    type: "IDE",
    use: "Code editing, debugging, and project development",
    icon: "🟦♾️",
  },
  {
    title: "BlueJ",
    type: "IDE",
    use: "Java development, educational projects",
    icon: "🐦🔵",
  },
  {
    title: "Git & GitHub",
    type: "Version Control",
    use: "Team collaboration, project tracking, and versioning",
    icon: "🛠️",
  },
  {
    title: "API Integration",
    type: "API",
    use: "Schipper Translate uses API calls to translate text between languages",
    icon: "🧩",
  },
  {
    title: "Excel",
    type: "Spreadsheet Software",
    use: "Educational projects, data analysis, and calculations",
    icon: "📊",
  },
];

let dealt = false;

window.dealCards = function () {
  if (dealt) return;
  dealt = true;

  const deck = document.querySelector(".deck-stack");
  if (deck) deck.style.display = "none";

  const container = document.getElementById("cardContainer");

  setTimeout(() => {
    const containerWidth = container.offsetWidth;
    const idealSpacing = 200;
    const minSpacing = 100;

    const spacing =
      (skills.length - 1) * idealSpacing > containerWidth
        ? Math.max(minSpacing, containerWidth / (skills.length - 1))
        : idealSpacing;

    const centerOffset = ((skills.length - 1) / 2) * spacing;
    const midpoint = (skills.length - 1) / 2;

    // STEP 1: Create card data with z-index calculations
    const cardData = skills.map((skill, index) => {
      const direction = index < midpoint ? -1 : 1;
      const distanceFromCenter = Math.abs(index - midpoint);
      const baseRotation = direction * distanceFromCenter * 5;

      let zIndex;
      if (index < midpoint) {
        // Left side: further from center = lower z-index
        zIndex = skills.length - distanceFromCenter;
      } else if (index > midpoint) {
        // Right side: further from center = lower z-index (same as left side)
        zIndex = skills.length - distanceFromCenter;
      } else {
        // Center card
        zIndex = skills.length + 1;
      }

      return {
        skill,
        index,
        zIndex,
        baseRotation,
        distanceFromCenter
      };
    });

    // STEP 2: Sort by z-index (lowest first) so DOM order matches z-index order
    const sortedCards = [...cardData].sort((a, b) => a.zIndex - b.zIndex);

    // STEP 3: Create and add cards to DOM in sorted order
    sortedCards.forEach(({ skill, index, zIndex, baseRotation }, sortedIndex) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
      <h3>${skill.icon} ${skill.title}</h3>
      <p><strong>Type:</strong> ${skill.type}</p>
      <p><strong>Use:</strong> ${skill.use}</p>
    `;

      card.style.setProperty('z-index', zIndex.toString(), 'important');
      card.setAttribute('data-original-zindex', zIndex); // Store original z-index
      card.setAttribute('data-original-index', index); // Store original position
      container.appendChild(card);

      // Use the original index for timing, but ensure all cards get the reveal class
      setTimeout(() => {
        card.classList.add("revealed");
        card.style.transform = `
        translateX(${index * spacing - centerOffset}px)
        translateX(-50%)
        rotate(${baseRotation}deg)
      `;
      }, index * 300);

      // Reset tilt on hover
      card.addEventListener("mouseenter", () => {
        // Move card to end of container (brings it to front)
        container.appendChild(card);
        card.style.transform = `
        translateX(${index * spacing - centerOffset}px)
        translateX(-50%)
        rotate(0deg)
      `;
      });

      card.addEventListener("mouseleave", () => {
       
        // Find where this card should be positioned in DOM based on its z-index (not array index)
        const allCards = Array.from(container.children);
        const cardZIndex = parseInt(card.getAttribute('data-original-zindex'));
        
        // Find the correct position by looking at other cards' z-index values
        let insertBeforeCard = null;
        for (let otherCard of allCards) {
          const otherZIndex = parseInt(otherCard.getAttribute('data-original-zindex'));
          if (otherZIndex > cardZIndex) {
            insertBeforeCard = otherCard;
            break;
          }
        }
        
        // Insert the card back in its correct z-index position
        if (insertBeforeCard) {
          container.insertBefore(card, insertBeforeCard);
        } else {
          container.appendChild(card); // If no card found, it goes at the end (highest z-index)
        }
        
        card.style.transform = `
        translateX(${index * spacing - centerOffset}px)
        translateX(-50%)
        rotate(${baseRotation}deg)
      `;
      });
    });

    // Fallback: ensure all cards are revealed after max delay
    setTimeout(() => {
      const allCards = container.querySelectorAll('.card');
      allCards.forEach(card => {
        if (!card.classList.contains('revealed')) {
          card.classList.add('revealed');
        }
      });
    }, (skills.length * 300) + 500);
  });
};



