let btnStart = false;
let btnSend = false;

let numOfBricks = 24;
let currentPoints = 0;
// pohranjivanje podatka o najboljem ostvarenom rezultatu u local storage preglednika
if (!localStorage.getItem("highestScore"))
    localStorage.setItem("highestScore", 0); 
let ballSpeed = 5;
let newRow = 0;
// izračun broja potrebnih redaka cigli u odnosu na veličinu zaslona, tj. Canvasa
// veličina zaslona je window.innerWidth - 4 (-4 zbog bordera canvasa)
// 100 je veličina cigle, 20 je razmak između cigli
let maxBrickRows = Math.ceil((100 + 20) * numOfBricks / (window.innerWidth - 4));
// izračun broja potrebnih stupaca cigli u odnosu na veličinu zaslona, tj. Canvasa
let maxBrickCols = Math.floor(numOfBricks / maxBrickRows);
let bricksRow = maxBrickRows;
let bricksCol = maxBrickCols;
// računanje paddinga s lijeve i desne strane skupa cigli
let padding = ((window.innerWidth - 4) - (bricksCol * 100 + bricksCol * 20)) / 2;

// računanje slučajnog kuta (između 20 i 65 stupnjeva) za putanju loptice
const randAngle = Math.random() * (65 - 20) + 20;
// stvaranje loptice (objekt)
let ball = {
    // postavljanje x i y koordinata središta loptice tako da se nalazi na sredini palice
    x: (window.innerWidth - 4) / 2,
    y: (window.innerHeight - 4) - 60,
    r: 8, // radijus loptice
    speed: ballSpeed,
    // računanje x komponente vektora brzine
    mx: Math.cos(randAngle * Math.PI / 180) * ballSpeed,
    // računanje y komponente vektora brzine
    my: -Math.abs(Math.sin(randAngle * Math.PI / 180) * ballSpeed)
};

// kad korisnik pritisne gumb btnStart, promijeni se vrijednost varijable btnStart na true kako bi igra mogla početi
document.getElementById("btnStart").addEventListener("click", function () {
    btnStart = true;
    console.log("btnStart was clicked");
});

// kad korisnik pritisne gumb btnSend, dohvaćaju se vrijednosti koje je unio korisnik i prilagođava se broj cigli te brzina loptice
document.getElementById("btnSend").addEventListener("click", function () {
    btnSend = true;
    console.log("btnSend was clicked");
    numOfBricks = document.getElementById("userNumBricks").value;
    newSpeed = document.getElementById("userSpeed").value;
    // mijenja se brzina loptice
    ball.speed = newSpeed;
    ball.mx = Math.cos(randAngle * Math.PI / 180) * newSpeed;
    ball.my = -Math.abs(Math.sin(randAngle * Math.PI / 180) * ballSpeed);
    // isti izračun broja stupaca i redaka cigli kao i ranije, samo što je broj cigli odredio korisnik
    maxBrickRows = Math.ceil((100 + 20) * numOfBricks / (window.innerWidth - 4));
    maxBrickCols = Math.floor(numOfBricks / maxBrickRows);
    // ako se cigle ne mogu posložiti tako da su svi redci u potpunosti puni, računa se broj preostalih cigli
    newRow = numOfBricks - maxBrickCols * maxBrickRows;
    bricksRow = maxBrickRows;
    bricksCol = maxBrickCols;
    padding = ((window.innerWidth - 4) - (bricksCol * 100 + bricksCol * 20)) / 2;
});

let allBricks = [];

// funkcija za pokretanje igre (nakon onload događaja)
function startGame() {
    // generiraju se sve potrebne cigle (u slučaju da se koristi predefinirani broj cigli)
    for (let i = 0; i < bricksRow; i++) {
        allBricks[i] = [];
        for (let j = 0; j < bricksCol; j++) {
            // svaka cigla je novi objekt veličine 100 x 25px, cigle su razmaknute za 20px horizontalno i vertikalno, 
            // cigle su udaljene od vrha canvasa za 60
            allBricks[i][j] = new gameBrick(100, 25, padding + 100 * j + 20 * j, 60 + 20 * i + 20 * i, true);
        }
    }
    myGameArea.start(); // pokretanje igre
}

// stvaranje područja igre, tj. canvasa
var myGameArea = {
    // dinamično dodavanje canvas elementa u HTML
    canvas : document.createElement("canvas"),
    // funkcija za inicijalizaciju canvasa
    start : function() {
        this.canvas.id = "gameCanvas";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        // postavljanje intervala za pokretanje glavne petlje igre
        this.interval = setInterval(updateGameArea, 20);
        // postavljanje veličine canvasa tako da zauzima cijeli zaslon
        this.canvas.width = window.innerWidth - 4;
        this.canvas.height = window.innerHeight - 4;
    },
    // funkcija za zaustavljanje igre
    stop : function() {
        clearInterval(this.interval);
    },
    // funkcija za čišćenje canvasa
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// stvaranje objekta koji predstavlja palicu
const paddle = {
    width: 100,
    height: 10,
    x: (window.innerWidth - 4) / 2 - 50, // postavljanje palice na sredinu canvasa
    y: (window.innerHeight - 4) - 50, // palica je udaljena od dna canvasa za 50 px
    speed: 8, // brzina kretanja palice odnosno za koliko se pomiče pri pritisku na tipku
    mx: 0 // pomak palice po osi x
}

// funkcija za stvaranje cigle / konstruktor
function gameBrick(width, height, x, y, visible) {
    // postavljanje širine, visine, x i y koordinata vrha pravokutnika
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.visible = visible;
    // funkcija za crtanje cigle na canvas
    this.update = function() {
        if (visible) { // ako je loptica nije pogodila
            ctx = myGameArea.context;
            // dodavanje sjene oko pravokutnika
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#a3b8af";
            ctx.fillStyle = "#16b573";
            // crtanje pravokutnika / cigle na canvas
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

// funkcija za prikazivanje trenutnih bodova i najvećeg broja bodova koji se može ostvariti
function showPoints() {
    // najveći mogući broj bodova se dobije ako se unište sve cigle 
    const maxPoints = numOfBricks;

    const ctx = myGameArea.context;
    ctx.font = "20px Arial";
    // postavljanje teksta u gornji desni kut canvasa
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "red";
    ctx.fillText("Total points", myGameArea.canvas.width - 150, 20);
    ctx.fillText(`${currentPoints}`, myGameArea.canvas.width - 150, 40);
    ctx.fillText("Max points", myGameArea.canvas.width - 10, 20);
    ctx.fillText(`${maxPoints}`, myGameArea.canvas.width - 10, 40);
    // prikazivanje odgovarajuće poruke ako je korisnik uništio sve cigle
    if (currentPoints === maxPoints) {
        ctx.font = "100px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "#de3535";
        ctx.fillStyle = "red";
        ctx.fillText("YOU WIN!", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
        myGameArea.stop(); // zaustavlja se igra
        // poziva se funkcija za ažuriranje vrijednosti bodova u local storage-u
        updatePoints(currentPoints);
    }
}

// funkcija za crtanje palice na canvasu
function drawPaddle() {
    const ctx = myGameArea.context;
    ctx.shadowBlur = 7;
    // dodavanje sjene palici
    ctx.shadowColor = "#de3535";
    ctx.fillStyle = "red";
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// funkcija za crtanje loptice na canvasu
function drawGameBall() {
    const ctx = myGameArea.context;
    // crtanje kruga
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    ctx.shadowBlur = 0;
    // ispunjavanje kruga crvenom bojom
    ctx.fillStyle = "red";
    ctx.fill();
    // dodavanje obruba
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#8f1111";
    ctx.stroke();
}

// funkcija za promjenu položaja palice
function newPaddlePos() {
    // palica se pomiče po osi x ovisno o paddle.mx, tj. definiranom pomaku
    paddle.x = paddle.x + paddle.mx;
    // ako je palica udarila desni rub canvasa
    if (paddle.x + paddle.width > myGameArea.canvas.width) {
        // promijeni se x koordinata kako palica ne bi "izašla" s canvasa
        paddle.x = myGameArea.canvas.width - paddle.width;
    // ako je palica udarila lijevi rub canvasa
    } else if (paddle.x < 0) {
        paddle.x = 0;
    }
}

// funkcija za promjenu položaja loptice
function newBallPos() {
    // računanje pomaka lopte prema slučajno generiranom kutu
    ball.x += ball.mx;
    ball.y += ball.my;

    // sudar lopte s lijevim ili desnim zidom
    if (ball.x - ball.r < 0 || ball.x + ball.r > myGameArea.canvas.width) {
        // mijenja se smjer kretanja po osi x
        ball.mx = (-1) * ball.mx;
        // generiranje zvuka prilikom kolizije
        var myAudio3 = document.getElementById("audio3");
        myAudio3.play();
    }

    // sudar loptice s palicom
    // ako loptica udari gornju stranu palice
    if (ball.y + ball.r > paddle.y && ball.y + ball.r < paddle.y + paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        // mijenja se smjer kretanja po osi y
        ball.my = (-1) * ball.my;
        // generiranje zvuka prilikom kolizije
        var myAudio2 = document.getElementById("audio2");
        myAudio2.play();
    // ako loptica udari palicu s lijeve strane
    } else if (ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.height 
        && ball.x + ball.r > paddle.x && ball.x - ball.r < paddle.x) {
        // promjena smjera kretanja loptice
        ball.mx = (-1) * ball.mx;
        ball.my = (-1) * ball.my;
        // generiranje zvuka prilikom kolizije
        var myAudio2 = document.getElementById("audio2");
        myAudio2.play();
    // ako loptica udari palicu s desne strane
    } else if (ball.y + ball.r > paddle.y && ball.y - ball.r < paddle.y + paddle.height 
        && ball.x - ball.r < paddle.x + paddle.width && ball.x + ball.r > paddle.x + paddle.width) {
        // promjena smjera kretanja loptice
        ball.mx = (-1) * ball.mx;
        ball.my = (-1) * ball.my;
        // generiranje zvuka prilikom kolizije
        var myAudio2 = document.getElementById("audio2");
        myAudio2.play();
    }

    // sudar lopte s gornjim rubom canvasa
    if (ball.y - ball.r < 0) {
        // mijenja se smjer kretanja po osi y
        ball.my = (-1) * ball.my;
        // generiranje zvuka prilikom kolizije
        var myAudio3 = document.getElementById("audio3");
        myAudio3.play();
    }

    // sudar lopte s ciglom
    for (let i = 0; i < bricksRow; i++) {
        for (let j = 0; j < bricksCol; j++) {
            let brick = allBricks[i][j];
            if (brick.visible) {
                // sudar s donjom stranom cigle
                if (ball.y - ball.r > brick.y && ball.y - ball.r < brick.y + brick.height 
                    && ball.x + ball.r > brick.x && ball.x + ball.r < brick.x + brick.width) {
                        brick.visible = false; // mijenja se vidljivost cigle jer ju je loptica pogodila
                        // generiranje zvuka prilikom kolizije
                        var myAudio1 = document.getElementById("audio1");
                        myAudio1.play();
                        // povećavanje broja bodova nakon pogotka cigle
                        currentPoints++;
                        // provjera je li došlo do sudara s lijevom stranom cigle
                        if (ball.x - ball.r < brick.x && ball.y + ball.r < brick.y + brick.height) {
                            // mijenja se smjer kretanja po osi x
                            ball.mx = (-1) * ball.mx;
                            break;
                        }
                    // mijenja se smjer kretanja po osi y
                    ball.my = (-1) * ball.my;
                    break;
                //sudar s gornjom stranom cigle
                } else if (ball.y + ball.r > brick.y && ball.y + ball.r < brick.y + brick.height 
                    && ball.x + ball.r > brick.x && ball.x + ball.r < brick.x + brick.width) {
                        brick.visible = false;
                        // generiranje zvuka prilikom kolizije
                        var myAudio1 = document.getElementById("audio1");
                        myAudio1.play();
                        currentPoints++;
                        // mijenja se smjer kretanja po osi y
                        ball.my = (-1) * ball.my;
                        break;
                // sudar s desnom stranom cigle
                } else if (ball.y + ball.r > brick.y && ball.y + ball.r < brick.y + brick.height 
                    && ball.x + ball.r > brick.x + brick.width && ball.x - ball.r < brick.x + brick.width) {
                    // mijenja se smjer kretanja po osi x
                    ball.mx = (-1) * ball.mx;
                    brick.visible = false;
                    // generiranje zvuka prilikom kolizije
                    var myAudio1 = document.getElementById("audio1");
                    myAudio1.play();
                    currentPoints++;
                    break;
                }
            }
        }
    }

    // u slučaju da postoji redak koji nije u potpunosti pun, sve isto se provjeri za taj zadnji redak pri sudaru cigle i loptice
    if (newRow > 0) {
        for(let k = 0; k < newRow; k++) {
            let brick = allBricks[bricksRow][k];
            if (brick.visible) {
                // sudar s donjom stranom cigle
                if (ball.y - ball.r > brick.y && ball.y - ball.r < brick.y + brick.height 
                    && ball.x + ball.r > brick.x && ball.x + ball.r < brick.x + brick.width) {
                        brick.visible = false;
                        var myAudio1 = document.getElementById("audio1");
                        myAudio1.play();
                        currentPoints++;
                        if (ball.x - ball.r < brick.x) { // sudar s lijeva
                            ball.mx = (-1) * ball.mx;
                            break;
                        }
                    ball.my = (-1) * ball.my;
                    break;
                    //sudar s gornjom stranom cigle
                } else if (ball.y + ball.r > brick.y && ball.y + ball.r < brick.y + brick.height 
                    && ball.x + ball.r > brick.x && ball.x + ball.r < brick.x + brick.width) {
                        brick.visible = false;
                        var myAudio1 = document.getElementById("audio1");
                        myAudio1.play();
                        currentPoints++;
                        ball.my = (-1) * ball.my;
                        break;
                    // sudar s desne strane
                } else if (ball.y + ball.r > brick.y && ball.y + ball.r < brick.y + brick.height 
                    && ball.x + ball.r > brick.x + brick.width && ball.x - ball.r < brick.x + brick.width) {
                    ball.mx = (-1) * ball.mx;
                    brick.visible = false;
                    var myAudio1 = document.getElementById("audio1");
                    myAudio1.play();
                    currentPoints++;
                    break;
                }
            }
        }
    }

    // ako je loptica pala na dno canvasa, završava se igra
    if (ball.y + ball.r > myGameArea.canvas.height) {
        console.log("game over!");
        myGameArea.stop(); // zaustavljanje igre
        const ctx = myGameArea.context;
        // dodavanje odgovarajuće poruke na središte canvasa
        ctx.font = "100px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 7;
        ctx.shadowColor = "#de3535";
        ctx.fillStyle = "red";
        ctx.fillText("GAME OVER", myGameArea.canvas.width / 2, myGameArea.canvas.height / 2);
        // poziva se funkcija za ažuriranje vrijednosti bodova u local storage-u (naravno provjerava se je li ovo bolji rezultat)
        updatePoints(currentPoints);
    }
}

// dodavanje osluškivača pritiska na lijevu i desnu strelicu na tipkovnici
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
        paddle.mx = (-1) * paddle.speed; // pomicanje palice ulijevo za paddle.speed, tj. 8px
    } else if (e.key === "ArrowRight") {
        paddle.mx = paddle.speed; // pomicanje palice udesno
    }
});

// dodavanje osluškivača za prestanak pritiska
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        paddle.mx = 0; // zaustavlja se palica
    }
});

// funkcija za ažuriranje najboljeg rezultata pohranjenog u local storage-u
function updatePoints(points) {
    if (localStorage.getItem("highestScore")) {
        if (localStorage.getItem("highestScore") < points) {
            localStorage.setItem("highestScore", Number(points));
            console.log("new high score!")
        }
    }
}

// svako osvježavanje canvasa
function updateGameArea() {
    myGameArea.clear(); // očisti se canvas

    // ako je korisnik unio podatke, moramo ponovno generirati cigle jer se ne koristi predefinirani broj
    if (btnSend === true) {
        btnSend = false; // kako bi se cigle generirale samo jednom (na početku igre)
        btnStart = true; // pokretanje igre
        for (let i = 0; i < bricksRow; i++) {
            allBricks[i] = [];
            for (let j = 0; j < bricksCol; j++) {
                allBricks[i][j] = new gameBrick(100, 25, padding + 100 * j + 20 * j, 60 + 20 * i + 20 * i, true);
            }
        }
        // generiranje još jednog reda cigli ako je potrebno
        if (newRow > 0) {
            allBricks[bricksRow] = [];
            for(let k = 0; k < newRow; k++)
                allBricks[bricksRow][k] = new gameBrick(100, 25, padding + 100 * k + 20 * k, 60 + 20 * bricksRow + 20 * bricksRow, true);
        }

    }

    // crtanje svih cigli
    for (let i = 0; i < bricksRow; i++) {
        if (!allBricks[i]) {
            break;
        }
        for (let j = 0; j < bricksCol; j++) {
            if (allBricks[i][j] !== undefined) {
                if (allBricks[i][j].visible) // ako cigla nije uništena, prikaži je
                    allBricks[i][j].update();
            }
        }
    }
    // crtanje dodatnog reda (ako postoji)
    if (newRow > 0) {
        for(let k = 0; k < newRow; k++)
            if(allBricks[bricksRow][k].visible) // ako cigla nije uništena, prikaži je
                allBricks[bricksRow][k].update();
    }

    // ako je korisnik pritisnuo gumb btnStart / igra je počela
    if (btnStart ===  true) {
        // uklanjanje div-a s poljima za unos broja cigli i brzine
        let divQ = document.getElementById("dataDiv");
        divQ.style.display = "none";

        // ažuriranje položaja palice i loptice
        newPaddlePos();
        newBallPos();
    
        // crtanje palice i loptice
        drawPaddle();
        drawGameBall();
        // prikazivanje broja bodova u vrhu canvasa
        showPoints();
    }

}