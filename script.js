async function fetchCurrentDeepDive() {
    const response = await fetch('https://drgapi.com/v1/deepdives');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
}

let loading = true;

let DDdata = [];
let EDDdata = [];
let missionContentNormal = [];
let missionContentElite = [];

let classContentNormal = {
    driller: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }],
    engineer: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }],
    gunner: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }],
    scout: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }]
};

let classContentElite = {
    driller: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }],
    engineer: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }],
    gunner: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }],
    scout: [{ hint: "" }, { hint: "" }, { hint: "Revealing everything..." }]
};

function checkDensity(dd, variant) {
    let score = 0;
    let swarmmag = false;
    const content = variant === "Elite Deep Dive" ? classContentElite : classContentNormal;

    dd.stages.forEach(stage => {
        if (stage.primary.includes("Industrial Sabotage")) score += 3;
        if (stage.primary.includes("Dreadnought")) score += 2;
        if (stage.secondary.includes("Dreadnought")) score += 1;
        if (stage.primary.includes("Mule")) score -= 1;
        if (stage.warning && stage.warning.includes("Swarmaggedon")) swarmmag = true;
    });

    if (score > 2) {
        content["driller"][0].hint = "It smells like expired tuna.";
        content["engineer"][0].hint = "I feel like calling an orbital strike.";
        content["gunner"][0].hint = "I hear big guys we need to fight.";
        content["scout"][0].hint = "It seems like I'm the big shot here.";
    } else if (score < -1) {
        content["driller"][0].hint = "It smells like roasted marshmallows.";
        content["engineer"][0].hint = "I feel like an overpriced lawnmower.";
        content["gunner"][0].hint = "I hear lots of bugs to squish.";
        content["scout"][0].hint = "It seems like I might need swarm clear.";
    } else {
        content["driller"][0].hint = "It smells like rock and stone.";
        content["engineer"][0].hint = "I feel like rock and stone.";
        content["gunner"][0].hint = "I hear rock and stone.";
        content["scout"][0].hint = "It seems like rock and stone.";
    }

    if (swarmmag) content["scout"][0].hint = "It seems like I might need swarm clear";
}

function checkLength(dd, variant) {
    let score = 0;
    const content = variant === "Elite Deep Dive" ? classContentElite : classContentNormal;
    const long = ["Industrial Sabotage", "Escort Duty", "On-Site Refining"];
    const drag = ["Low Oxygen"];
    const short = ["Egg", "Aquarq"];

    dd.stages.forEach(stage => {
        if (long.some(type => stage.primary.includes(type))) score += 2;
        if (stage.warning && drag.some(type => stage.warning.includes(type))) score += 1;
        if (short.some(type => stage.primary.includes(type))) score -= 1;
    });

    let hint;
    if (score > 2) hint = "<br>We're going overtime..";
    else if (score < 0) hint = "<br>We're finishing early!";
    else hint = "<br>We're staying the course.";

    ["driller", "engineer", "gunner", "scout"].forEach(role => {
        content[role][0].hint += hint;
    });
}

function checkDanger(dd, variant) {
    let score = 0;
    const content = variant === "Elite Deep Dive" ? classContentElite : classContentNormal;
    const unplayable = ["Haunted Cave"];
    const heavyDanger = ["Duck and Cover", "Low Oxygen"];
    const slightDanger = ["Shield Disruption", "Mactera Plague"];

    const caveleech = ["Cave Leech Cluster"];
    const heavy = ["Low Oxygen", "Haunted Cave"];
    const allover = ["Duck and Cover", "Swarmaggedon", "Exploder Infestation"];
    const short = ["Duck and Cover"];

    let caveleechbool = false, heavybool = false, alloverbool = false, shortbool = false;

    dd.stages.forEach(stage => {
        if (stage.warning && unplayable.some(type => stage.warning.includes(type))) score += 5;
        if (stage.warning && heavyDanger.some(type => stage.warning.includes(type))) score += 2;
        if (stage.warning && slightDanger.some(type => stage.warning.includes(type))) score += 1;
        if (stage.warning && caveleech.some(type => stage.warning.includes(type))) caveleechbool = true;
        if (stage.warning && heavy.some(type => stage.warning.includes(type))) heavybool = true;
        if (stage.warning && allover.some(type => stage.warning.includes(type))) alloverbool = true;
        if (stage.warning && short.some(type => stage.warning.includes(type))) shortbool = true;
    });

    if (score > 3) {
        ["driller", "engineer", "gunner", "scout"].forEach(role => {
            content[role][1].hint = "Oh no...";
        });
    } else if (score > 1) {
        ["driller", "engineer", "gunner", "scout"].forEach(role => {
            content[role][1].hint = "I don't like where this is going..";
        });
    } else {
        ["driller", "engineer", "gunner", "scout"].forEach(role => {
            content[role][1].hint = "It is oddly calm.";
        });
    }

    if (caveleechbool) content["scout"][1].hint += "<br>PSA: Look out, look up!";
    if (heavybool) {
        ["driller", "engineer", "gunner"].forEach(role => {
            content[role][1].hint += "<br>The air feels heavy.";
        });
    }
    if (alloverbool) {
        ["engineer", "gunner", "scout"].forEach(role => {
            content[role][1].hint += "<br>Oh god, they're all over the place!";
        });
    }
    if (shortbool) content["driller"][1].hint += "<br>I'm too short for this!";
}

async function main() {
    try {
        const deepDiveData = await fetchCurrentDeepDive();

        deepDiveData.variants.forEach(variant => {
            checkDensity(variant, variant.type);
            checkLength(variant, variant.type);
            checkDanger(variant, variant.type);

            if (variant.type === "Deep Dive") {
                DDdata.push(variant);
            } else if (variant.type === "Elite Deep Dive") {
                EDDdata.push(variant);
            }
        });

        DDdata.forEach(variant => {
            variant.stages.forEach(stage => {
                missionContentNormal.push(createStageHTML(stage));
            });
        });

        EDDdata.forEach(variant => {
            variant.stages.forEach(stage => {
                missionContentElite.push(createStageHTML(stage));
            });
        });

        console.log("DDdata:", DDdata);
        console.log("EDDdata:", EDDdata);

        const deepDive = deepDiveData.variants.find(variant => variant.type === "Deep Dive");
        const eliteDeepDive = deepDiveData.variants.find(variant => variant.type === "Elite Deep Dive");

        if (deepDive) setBiome(document.getElementById('biome-dd'), document.getElementById('bg-dd'), deepDive.biome);
        if (eliteDeepDive) setBiome(document.getElementById('biome-dde'), document.getElementById('bg-dde'), eliteDeepDive.biome);

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

function setBiome(subtitle, backdrop, biome) {
    subtitle.textContent = biome;
    switch (biome) {
        case "Azure Weald":
            backdrop.classList.add('azure');
            break;
        case "Crystalline Caverns":
            backdrop.classList.add('crystalline');
            break;
        case "Dense Biozone":
            backdrop.classList.add('dense');
            break;
        case "Fungus Bogs":
            backdrop.classList.add('fungus');
            break;
        case "Glacial Strata":
            backdrop.classList.add('glacial');
            break;
        case "Hollow Bough":
            backdrop.classList.add('hollow');
            break;
        case "Magma Core":
            backdrop.classList.add('magma');
            break;
        case "Radioactive Exclusion Zone":
            backdrop.classList.add('radioactive');
            break;
        case "Salt Pits":
            backdrop.classList.add('salt');
            break;
        case "Sandblasted Corridors":
            backdrop.classList.add('sandblasted');
            break;
    }
}

function createStageHTML(stage) {
    const primaryObjectiveHTML = `
        <div class="primary objective">
            <img src="img/missions/${getImageName(stage.primary)}.webp" width="82">
            <span>${stage.primary}</span>
        </div>`;

    const secondaryObjectiveHTML = `
        <div class="secondary objective">
            <img src="img/missions/${getImageName(stage.secondary)}.webp" width="64">
            <span>${stage.secondary}</span>
        </div>`;

    const anomalyHTML = stage.anomaly ? `
        <div class="anomaly modifier">
            <img src="img/anomalies/${getImageName(stage.anomaly)}.webp" width="30">
            <span>${stage.anomaly}</span>
        </div>` : '';

    const warningHTML = stage.warning ? `
        <div class="warning modifier">
            <img src="img/warnings/${getImageName(stage.warning)}.webp" width="30">
            <span>${stage.warning}</span>
        </div>` : '';

    return primaryObjectiveHTML + secondaryObjectiveHTML + anomalyHTML + warningHTML;
}

const missionDict = {
    "Well" : "on-site_refining",
    "Morkite" : "mining_expedition",
    "Egg" : "egg_hunt",
    "Refining" : "on-site_refining",
    "Mule" : "salvage_operation",
    "Aquarq" : "point_extraction",
    "Escort" : "escort_duty",
    "Dreadnought" : "elimination",
    "Industrial" : "industrial_sabotage",
    "Scan" : "deep_scan"
}

function getImageName(inputString) {
    for (const key in missionDict) {
        if (inputString.toLowerCase().includes(key.toLowerCase())) {
            return missionDict[key];
        }
    }
    return inputString.toLowerCase().replace(/[\s+()]/g, '_');
}

startCountdown();
main();

const flipSound = [
    'snd/flip1.ogg', 
    'snd/flip2.ogg', 
    'snd/flip3.ogg'
];

function playFlipSound() {
    const sound = flipSound[Math.floor(Math.random() * flipSound.length)];
    
    const audio = new Audio(sound);
    
    audio.playbackRate = Math.random() * 0.4 + 0.9;
    
    audio.play();
}

function setBiome(subtitle, backdrop, biome) {
    subtitle.textContent = biome;
    switch (biome) {
        case "Azure Weald":
            backdrop.classList.add('azure');
            break;
        case "Crystalline Caverns":
            backdrop.classList.add('crystalline');
            break;
        case "Dense Biozone":
            backdrop.classList.add('dense');
            break;
        case "Fungus Bogs":
            backdrop.classList.add('fungus');
            break;
        case "Fungus Bogs":
            backdrop.classList.add('fungus');
            break;
        case "Glacial Strata":
            backdrop.classList.add('glacial');
            break;
        case "Hollow Bough":
            backdrop.classList.add('hollow');
            break;
        case "Magma Core":
            backdrop.classList.add('magma');
            break;
        case "Radioactive Exclusion Zone":
            backdrop.classList.add('radioactive');
            break;
        case "Salt Pits":
            backdrop.classList.add('salt');
            break;
        case "Salt Pits":
            backdrop.classList.add('sandblasted');
    }
}

document.querySelectorAll('.dd-content').forEach(section => {
    const cards = section.querySelectorAll('.card');
    const classSelector = section.querySelector('.class-selector select');
    let currentCardIndex = 0;
    let revealed = false;

    isElite = section.classList.contains('elite');
    const classContent = isElite ? classContentElite : classContentNormal;
    const missionContent = isElite ? missionContentElite : missionContentNormal;

    function resetCards() {
        const selectedClass = classSelector.value.toLowerCase();
        if (currentCardIndex > 0) playFlipSound();
        currentCardIndex = 0;
        revealed = false;

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
                card.querySelector('.card-back').innerHTML = classContent[selectedClass][index].hint;
            }, 250);

            if (index !== currentCardIndex) {
                card.classList.add('disabled');
                card.style.pointerEvents = 'none';
            } else {
                card.style.pointerEvents = 'auto';
            }
        });
        loading = false;
    }

    setTimeout(() => {resetCards();}, 250);

    classSelector.addEventListener('change', resetCards);

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            if (loading || revealed || card.classList.contains('disabled') || card.getAttribute('data-clicked') === 'true') return;
            
            classSelector.disabled = true;

            playFlipSound();

            card.setAttribute('data-clicked', 'true');
            card.querySelector('.card-inner').classList.toggle('flipped');

            if (index === cards.length - 1) {
                setTimeout(() => {

                    cards.forEach((c, cardIndex) => {
                        c.querySelector('.card-inner').classList.remove('flipped');
                        playFlipSound();

                        setTimeout(() => {
                            c.querySelector('.card-back').innerHTML = missionContent[cardIndex];
                        }, 250);

                        setTimeout(() => {
                            c.querySelector('.card-inner').classList.add('flipped');
                            playFlipSound();
                        }, 500);

                        setTimeout(() => {
                            c.classList.add('disabled');
                            c.style.pointerEvents = 'none';
                        }, 750);
                    });

                    revealed = true;
                    
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
