// Variabili globali per i confetti
let random = Math.random,
  cos = Math.cos,
  sin = Math.sin,
  PI = Math.PI,
  PI2 = PI * 2,
  timer = undefined,
  frame = undefined,
  confetti = [];

// Parametri per i confetti
let particles = 10,
  spread = 40,
  sizeMin = 3,
  sizeMax = 12 - sizeMin,
  eccentricity = 10,
  deviation = 100,
  dxThetaMin = -0.1,
  dxThetaMax = -dxThetaMin - dxThetaMin,
  dyMin = 0.13,
  dyMax = 0.18,
  dThetaMin = 0.4,
  dThetaMax = 0.7 - dThetaMin;

// Temi di colore per i confetti
let colorThemes = [
  function () {
    return color(200 * random() | 0, 200 * random() | 0, 200 * random() | 0);
  },
  function () {
    let black = 200 * random() | 0;
    return color(200, black, black);
  },
  function () {
    let black = 200 * random() | 0;
    return color(black, 200, black);
  },
  function () {
    let black = 200 * random() | 0;
    return color(black, black, 200);
  },
  function () {
    return color(200, 100, 200 * random() | 0);
  },
  function () {
    return color(200 * random() | 0, 200, 200);
  },
  function () {
    let black = 256 * random() | 0;
    return color(black, black, black);
  },
  function () {
    return colorThemes[random() < 0.5 ? 1 : 2]();
  },
  function () {
    return colorThemes[random() < 0.5 ? 3 : 5]();
  },
  function () {
    return colorThemes[random() < 0.5 ? 2 : 4]();
  },
];

// Funzione per generare un colore
function color(r, g, b) {
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// Interpolazione cosinusoidale
function interpolation(a, b, t) {
  return (1 - cos(PI * t)) / 2 * (b - a) + a;
}

// Creazione di una distribuzione di Poisson 1D massimale su [0, 1]
let radius = 1 / eccentricity,
  radius2 = radius + radius;

function createPoisson() {
  let domain = [radius, 1 - radius],
    measure = 1 - radius2,
    spline = [0, 1];
  while (measure) {
    let dart = measure * random(),
      i,
      l,
      interval,
      a,
      b,
      c,
      d;

    for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
      a = domain[i],
        b = domain[i + 1],
        interval = b - a;
      if (dart < measure + interval) {
        spline.push(dart += a - measure);
        break;
      }
      measure += interval;
    }
    c = dart - radius, d = dart + radius;

    for (i = domain.length - 1; i > 0; i -= 2) {
      l = i - 1, a = domain[l], b = domain[i];
      if (a >= c && a < d)
        if (b > d) domain[l] = d;
        else domain.splice(l, 2);
      else if (a < c && b > c)
        if (b <= d) domain[i] = c;
        else domain.splice(i, 0, c, d);
    }

    for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
      measure += domain[i + 1] - domain[i];
  }

  return spline.sort();
}

// Creazione del contenitore principale
let container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100%';
container.style.height = '0';
container.style.overflow = 'visible';
container.style.zIndex = '9999';

// Costruttore dei confetti
function Confetto(theme) {
  this.frame = 0;
  this.outer = document.createElement('div');
  this.inner = document.createElement('div');
  this.outer.appendChild(this.inner);

  let outerStyle = this.outer.style,
    innerStyle = this.inner.style;
  outerStyle.position = 'absolute';
  outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
  outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
  innerStyle.width = '100%';
  innerStyle.height = '100%';
  innerStyle.backgroundColor = theme();

  outerStyle.perspective = '50px';
  outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
  this.axis = 'rotate3D(' +
    cos(360 * random()) + ',' +
    cos(360 * random()) + ',0,';
  this.theta = 360 * random();
  this.dTheta = dThetaMin + dThetaMax * random();
  innerStyle.transform = this.axis + this.theta + 'deg)';

  this.x = window.innerWidth * random();
  this.y = -deviation;
  this.dx = sin(dxThetaMin + dxThetaMax * random());
  this.dy = dyMin + dyMax * random();
  outerStyle.left = this.x + 'px';
  outerStyle.top = this.y + 'px';

  this.splineX = createPoisson();
  this.splineY = [];

  // In questo ciclo for è necessario usare "var" per l'esecuzione del sistema
  for (var i = 1, l = this.splineX.length - 1; i < l; ++i) 
    this.splineY[i] = deviation * random();
  this.splineY[0] = this.splineY[l] = deviation * random();

  this.update = function (height, delta) {
    this.frame += delta;
    this.x += this.dx * delta;
    this.y += this.dy * delta;
    this.theta += this.dTheta * delta;

    let phi = this.frame % 7777 / 7777,
      i = 0,
      j = 1;
    while (phi >= this.splineX[j]) i = j++;
    let rho = interpolation(
      this.splineY[i],
      this.splineY[j],
      (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
    );
    phi *= PI2;

    outerStyle.left = this.x + rho * cos(phi) + 'px';
    outerStyle.top = this.y + rho * sin(phi) + 'px';
    innerStyle.transform = this.axis + this.theta + 'deg)';
    return this.y > height + deviation;
  };
}

// Funzione per l'effetto di confetti
function poof() {
  if (!frame) {
    document.body.appendChild(container);

    let theme = colorThemes[0],
      count = 0;
    (function addConfetto() {
      let confetto = new Confetto(theme);
      confetti.push(confetto);
      container.appendChild(confetto.outer);
      timer = setTimeout(addConfetto, spread * random());
    })(0);

    let prev = undefined;
    requestAnimationFrame(function loop(timestamp) {
      let delta = prev ? timestamp - prev : 0;
      prev = timestamp;
      let height = window.innerHeight;

      for (let i = confetti.length - 1; i >= 0; --i) {
        if (confetti[i].update(height, delta)) {
          container.removeChild(confetti[i].outer);
          confetti.splice(i, 1);
        }
      }

      if (timer || confetti.length)
        return frame = requestAnimationFrame(loop);

      document.body.removeChild(container);
      frame = undefined;
    });

    // Timer per fermare la generazione di confetti dopo 4 secondi
    setTimeout(function () {
      clearTimeout(timer);
      timer = undefined;
    }, 4000); // Durata dell'effetto dei confetti (in millisecondi)
  }
}

// Oggetto per l'etichetta del grafico a torta
const doughnutLabel = {
  id: "doughnutLabel",
  beforeDraw: function (chart, args, pluginOptions) {
    const { ctx, data } = chart;
    ctx.save();
    const centerX = chart.width / 2;
    const centerY = chart.height / 2 - 65;

    const lines = pluginOptions.text.split("\n");
    const fontSize = pluginOptions.fontSize || 12;
    const lineHeight = pluginOptions.lineHeight || 1.5;
    const boldFont = `${fontSize * 1.2}px sans-serif`;
    const regularFont = `${fontSize * 0.9}px sans-serif`;

    ctx.shadowColor = pluginOptions.shadow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.textAlign = "center";

    lines.forEach((line, index) => {
      if (index < 2) {
        ctx.font = boldFont;
        if (index === 1) {
          ctx.fillStyle = pluginOptions.colorSecondLine;
        } else {
          ctx.fillStyle = pluginOptions.color;
        }
      } else {
        ctx.font = regularFont;
        ctx.fillStyle = pluginOptions.color;
      }

      ctx.fillText(line, centerX, centerY + index * fontSize * lineHeight);
    });

    ctx.restore();
  },
};

// Oggetto per l'ombra del grafico
const ShadowPlugin = {
  id: "shadowPlugin",
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
  },
};

// Funzione per ottenere i risultati del quiz dalla pagina precedente
document.addEventListener("DOMContentLoaded", function () {
  const quizResults = JSON.parse(localStorage.getItem("quizResults"));

  if (quizResults) {
    const correctAnswers = document.getElementById("correct-answers");
    const wrongAnswers = document.getElementById("wrong-answers");
    const correctAnswersPercentage = document.getElementById("correct-answers-percentage");
    const wrongAnswersPercentage = document.getElementById("wrong-answers-percentage");

    // Parte sotto al valore percentuale
    correctAnswers.innerHTML = `${quizResults.correct} / ${quizResults.total} questions`;
    wrongAnswers.innerHTML = `${quizResults.wrong} / ${quizResults.total} questions`;
    // Imposta il valore in percentuale
    const correctAnswersPercentageNumber = (quizResults.correct / parseInt(quizResults.total)) * 100;
    const wrongAnswersPercentageNumber = (quizResults.wrong / parseInt(quizResults.total)) * 100;
    // Imposta il valore in percentuale in numeri interi
    correctAnswersPercentage.innerHTML = `${correctAnswersPercentageNumber}%`;
    wrongAnswersPercentage.innerHTML = `${wrongAnswersPercentageNumber}%`;

    const ctx = document.getElementById("myChart").getContext("2d");

    let text, colorSecondLine;

    // Condizione per scrivere una delle due frasi all'interno del grafico
    if (correctAnswersPercentageNumber >= 60) {
      text =
        "Congratulations!\nYou passed the exam.\n\nWe'll send you the certificate \nin few minutes. \nCheck your email \n(including promotions/spam folder)"
      colorSecondLine = "#01FBFC";

      // Avvia l'effetto dei confetti
      poof();

    } else {
      text =
        "We are sorry\nYou failed the exam\n\nYou will be contacted by \nyour teacher in the next few days";
      colorSecondLine = "#C2128D";
    }

    // Imposta le proprietà del grafico
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Wrong", "Correct"],
        datasets: [
          {
            data: [quizResults.wrong, quizResults.correct],
            backgroundColor: ["#C2128D", "#00FFFF"],
            borderColor: ["#C2128D", "#00FFFF"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
          doughnutLabel: {
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            lineHeight: 1.5,
            color: "white",
            colorSecondLine: colorSecondLine,
            text: text,
          },
        },
      },
      plugins: [doughnutLabel, ShadowPlugin],      
    });
  }
  localStorage.removeItem("quizResults");
});

