async function fetchCurrentDeepDive() {
    const response = await fetch('https://drgapi.com/v1/deepdives');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
}

async function main() {
    try {
        const deepDiveData = await fetchCurrentDeepDive();

        const deepDive = deepDiveData.variants.find(variant => variant.type === "Deep Dive");
        const eliteDeepDive = deepDiveData.variants.find(variant => variant.type === "Elite Deep Dive");

        if (deepDive) setBiome(document.getElementById('bg-dd'), deepDive.biome);
        if (eliteDeepDive) setBiome(document.getElementById('bg-dde'), eliteDeepDive.biome);

        console.log("Successful Response");
    } catch (error) {
        console.error("Error fetching deep dive data:", error);
    }
}

function nextDeepDiveRefresh() {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    let daysUntilThursday = (4 - dayOfWeek + 7) % 7 || 7;
    const target = new Date(now);
    target.setUTCDate(now.getUTCDate() + daysUntilThursday);
    target.setUTCHours(0, 0, 0, 0);

    return target;
}

function startCountdown() {
const interval = setInterval(() => {
    const now = new Date();
    const target = nextDeepDiveRefresh();
    const diff = target - now;

    if (diff <= 0) {
    clearInterval(interval);
    startCountdown();
    } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("countdown").textContent =
        `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}, 1000);
}

startCountdown();
main();

function setBiome(section, biome) {
    switch (biome) {
        case "Azure Weald":
            section.classList.add('azure');
            break;
        case "Crystalline Caverns":
            section.classList.add('crystalline');
            break;
        case "Dense Biozone":
            section.classList.add('dense');
            break;
        case "Fungus Bogs":
            section.classList.add('fungus');
            break;
        case "Fungus Bogs":
            section.classList.add('fungus');
            break;
        case "Glacial Strata":
            section.classList.add('glacial');
            break;
        case "Hollow Bough":
            section.classList.add('hollow');
            break;
        case "Magma Core":
            section.classList.add('magma');
            break;
        case "Radioactive Exclusion Zone":
            section.classList.add('radioactive');
            break;
        case "Salt Pits":
            section.classList.add('salt');
            break;
        case "Salt Pits":
            section.classList.add('sandblasted');
        default:
            //nothing
    }
}

/*`<div class="warning modifier">
    <img src="img/warnings/cave_leech_cluster.webp" width="30">
    <span>Cave Leech Cluster</span>
</div>

<div class="anomaly modifier">
    <img src="img/anomalies/critical_weakness.webp" width="30">
    <span>Critical Weakness</span>
</div>`*/

document.querySelectorAll('.dd-content').forEach(section => {
    const cards = section.querySelectorAll('.card');
    const classSelector = section.querySelector('.class-selector select');
    let currentCardIndex = 0;
    let finalStageReached = false;

    const classContent = {
        driller: [
            { hint: "Driller Hint 1" },
            { hint: "Driller Hint 2" },
            { hint: "Revealing everything..." }
        ],
        engineer: [
            { hint: "Engineer Hint 1" },
            { hint: "Engineer Hint 2" },
            { hint: "Revealing everything..." }
        ],
        gunner: [
            { hint: "Gunner Hint 1" },
            { hint: "Gunner Hint 2" },
            { hint: "Revealing everything..." }
        ],
        scout: [
            { hint: "Scout Hint 1" },
            { hint: "Scout Hint 2" },
            { hint: "Revealing everything..." }
        ]
    };

    const missionContent = [
        "Mission 1",
        "Mission 2",
        "Mission 3"
    ];

    function resetCards() {
        const selectedClass = classSelector.value.toLowerCase();
        currentCardIndex = 0;
        finalStageReached = false;

        cards.forEach((card, index) => {
            card.setAttribute('data-clicked', 'false');
            card.classList.remove('driller', 'engineer', 'gunner', 'scout');
            card.querySelector('.card-front').classList.remove('driller', 'engineer', 'gunner', 'scout');

            switch(selectedClass) {
                case 'engineer':
                    card.classList.add('engineer');
                    card.querySelector('.card-front').classList.add('engineer');
                    break;
                case 'gunner':
                    card.classList.add('gunner');
                    card.querySelector('.card-front').classList.add('gunner');
                    break;
                case 'scout':
                    card.classList.add('scout');
                    card.querySelector('.card-front').classList.add('scout');
                    break;
                default:
                    card.classList.add('driller');
                    card.querySelector('.card-front').classList.add('driller');
            }
            
            card.classList.remove('disabled');
            card.querySelector('.card-inner').classList.remove('flipped');

            setTimeout(() => {
                card.querySelector('.card-back').textContent = classContent[selectedClass][index].hint;
            }, 250);

            if (index !== currentCardIndex) {
                card.classList.add('disabled');
                card.style.pointerEvents = 'none';
            } else {
                card.style.pointerEvents = 'auto';
            }
        });
    }

    resetCards();

    classSelector.addEventListener('change', resetCards);

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (finalStageReached || card.classList.contains('disabled') || card.getAttribute('data-clicked') === 'true') return;
            
            classSelector.disabled = true;

            card.setAttribute('data-clicked', 'true');
            card.querySelector('.card-inner').classList.toggle('flipped');

            if (index === cards.length - 1) {
                setTimeout(() => {

                    cards.forEach((c, cardIndex) => {
                        c.querySelector('.card-inner').classList.remove('flipped');

                        setTimeout(() => {
                            c.querySelector('.card-back').textContent = missionContent[cardIndex];
                        }, 250);

                        setTimeout(() => {
                            c.querySelector('.card-inner').classList.add('flipped');
                        }, 500);

                        setTimeout(() => {
                            c.classList.add('disabled');
                            c.style.pointerEvents = 'none';
                        }, 750);
                    });

                    finalStageReached = true;
                    
                    setTimeout(() => {
                        classSelector.disabled = false;
                    }, 750);
                }, 1000);
            } else {
                currentCardIndex++;
                cards[currentCardIndex].classList.remove('disabled');
                cards[currentCardIndex].style.pointerEvents = 'auto';
                classSelector.disabled = false;
            }
        });
    });
});