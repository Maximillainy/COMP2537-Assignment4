let pokemons = [];
let difficulity = "easy";
let totalClicks;
let totalMatches;
let pairCount;
let pairsLeft;
let timer;
let totaltime;
let checking = false;
let toggle = false;
let flipInterval;
let firstCard = null;
let secondCard = null;

const startGame = async (difficulty, pokemons) => {
    const gameGrid = $("#game_grid");
    gameGrid.empty();

    const config = {
        easy: {pairCount: 3, pairsLeft: 3, totalTime: 20, gridDimensions: {width: "600px", height: "400px", columns: "repeat(3, 1fr)", rows: "repeat(2, 1fr)"}},
        medium: {pairCount: 6, pairsLeft: 6, totalTime: 60, gridDimensions: {width: "800px", height: "600px", columns: "repeat(4, 1fr)", rows: "repeat(3, 1fr)"}},
        hard: {pairCount: 12, pairsLeft: 12, totalTime: 90, gridDimensions: {width: "800px", height: "800px", columns: "repeat(4, 1fr)", rows: "repeat(4, 1fr)"}}
    };

    let {gridDimensions} = config[difficulty];
    totaltime = config[difficulty]["totalTime"];
    pairCount = config[difficulty]["pairCount"];
    pairsLeft = config[difficulty]["pairsLeft"];

    let cards = [];
    for (let i = 0; i < pairCount; i++) {
        let imageID = Math.floor(Math.random() * pokemons.length);
        for (let j = 0; j < 2; j++) {
            cards.push(`
                <div class="card">
                <img id="img${imageID}-${j}" class="front_face" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${imageID}.png" alt="pokemon">
                <img class="back_face" src="back.webp" alt="pokeBall">
                </div>
            `);
        }
    }

    cards = cards.sort(() => Math.random() - 0.5);

    gameGrid.css({
        width: gridDimensions.width,
        height: gridDimensions.height,
        "grid-template-columns": gridDimensions.columns,
        "grid-template-rows": gridDimensions.rows
    });

    cards.forEach((card) => gameGrid.append(card));
};


function updateTimer() {
    const timerElement = document.getElementById("gameTime");
    const matchElement = document.getElementById("totalMatches");
    const tpairElement = document.getElementById("totalPairs");
    const pairElement = document.getElementById("pairsLeft");
    const clicksElement = document.getElementById("totalClicks");
    timer++;

    if (timer == totaltime) {
        clearInterval(timerInterval);
        clearInterval(flipInterval);
        timerElement.textContent = ``;
        $("#stats").append(`
        <h1">Game over!</h1>
        <br>
        `);
    } else if (pairsLeft == 0) {
        clearInterval(timerInterval);
        clearInterval(flipInterval);
        timerElement.textContent = ``;
        $("#stats").append(`
        <h1>You Win!</h1>
        <br>
        `);
    } else {
        clicksElement.textContent = `Total Clicks: ${totalClicks}`;
        tpairElement.textContent = `Total Pairs: ${pairCount}`;
        pairElement.textContent = `Pairs left: ${pairsLeft}`;
        matchElement.textContent = `Matches: ${totalMatches}`;
        timerElement.textContent = `You got ${totaltime} seconds. ${timer} seconds passed`;
    }
}

const startStats = () => {
    timer = 0;
    totalClicks = 0;
    totalMatches = 0;
    clearInterval(flipInterval);
    $("#stats").empty();
    $("#stats").append(`
        <h2 id="totalClicks"></h2>
        <h2 id="totalPairs"></h2>
        <h2 id="pairsLeft"></h2>
        <h2 id="totalMatches"></h2>
        <h2 id="gameTime"></h2>
    `);
    timerInterval = setInterval(updateTimer, 1000);
};

const resetCards = () => {
    firstCard = null;
    secondCard = null;
};

const game = (event) => {
    if (checking) {
        console.log("checking cards");
        return;
    }

    const currentCard = $(event);
    const imgFront = currentCard.find(".front_face").get(0);
    if (!imgFront) {
        console.log("no image found");
        return;
    }

    if ((firstCard && currentCard.is(firstCard)) || (secondCard && currentCard.is(secondCard)) || currentCard.hasClass("match")) {
        return;
    }

    if (!firstCard) {
        currentCard.toggleClass("flip");
        console.log("first card selected");
        firstCard = currentCard;
        totalClicks++;
    } else {
        currentCard.toggleClass("flip");

        console.log("second card selected");
        secondCard = currentCard;
        totalClicks++;

        if (firstCard.find(".front_face").get(0).src === secondCard.find(".front_face").get(0).src) {
            console.log("match");
            firstCard.addClass("match");
            secondCard.addClass("match");
            resetCards();
            totalMatches++;
            pairsLeft--;
        } else {
            checking = true;
            console.log("no match");
            setTimeout(() => {
                firstCard.toggleClass("flip");
                secondCard.toggleClass("flip");
                resetCards();
                checking = false;
            }, 1000);
        }
    }
};


const toggleTheme = (toggle) => {
    if (toggle) {
        $("body").css({"background-color": "black"});
        $("#stats").css({"color": "white"})
        $("#game_grid").css({"background-color": "black"});
        $(".card").css({"background-color": "black"});
    } else {
        $("body").css({"background-color": "white"});
        $("#stats").css({"color": "black"})
        $("#game_grid").css({"background-color": "white"});
        $(".card").css({"background-color": "white"});
    }
};

const flipCards = () => {
    const cards = $(".card");
    cards.toggleClass("flip");
    setTimeout(() => {
        cards.toggleClass("flip");
    }, 1000);

    flipInterval = setInterval(() => {
        alert("Power Up!");
        const facedownCards = $(".card:not(.flip)");
        facedownCards.toggleClass("flip");
        setTimeout(() => {
            facedownCards.toggleClass("flip");
        }, 1000);
    }, 1000 * 15);
};

const setup = async () => {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=810&offset=0");
    pokemons = response.data.results;

    $("body").on("click", ".difficulty", function (e) {
        $(".difficultyBtn").removeClass("active");
        $(this).addClass("active");
        difficulity = e.target.value;
    });

    $("body").on("click", ".start", function (e) {
        startGame(difficulity, pokemons);
        startStats();
        flipCards();
    });

    $("body").on("click", ".reset", function (e) {location.reload()});
    $("body").on("click", ".card", function (e) {game(this)});
    $("body").on("click", ".toggle", function (e) {toggleTheme(toggle = !toggle)});
};

$(document).ready(setup);
