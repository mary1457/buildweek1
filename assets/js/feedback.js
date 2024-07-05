const text = document.getElementById("myText");
const stars = document.querySelectorAll("span");
let indicecliccato = 0;
let click = false;
window.addEventListener("load", init);

// Funzione che colora le stelle al nostro click
function init() {
  stars.forEach((element, i) => {
    element.addEventListener("click", function () {
      if (i === 0 && click === false) {
        click = true;
        colorstar(i);
        indicecliccato = i;
      } else if (i === 0 && click) {
        stars[0].style.color = "white";
        indicecliccato = 0;
        click = false;
      } else {
        colorstar(i);
        indicecliccato = i;
      }
    });

    // Abbiamo utilizzato un Event Listener per il mouseover su una stella
    // dove all'interno richiama la funzione per rimuovere la selezione da tutte le stella
    // e quella per selezionare la stella su cui si è posato il mouse
    element.addEventListener("mouseover", function () {
      deselect();
      colorstar(i);
    });

    element.addEventListener("mouseout", function () {
      deselect();
      if (indicecliccato > 0 || click) {
        colorstar(indicecliccato);
      }
    });
  });
}

// Utilizziamo questa funzione per colorare le stelle attraverso un ciclo
function colorstar(i) {
  for (let y = 0; y <= i; y++) {
    stars[y].style.color = "#00FFFF";
  }
}

function deselect() {
  stars.forEach((element, i) => {
    element.style.color = "white";
  });
}

// Event listener per il tasto enter nella textarea
text.addEventListener("keydown", function (event) {
  //se il tasto enter viene premuto
  if (event.key === "Enter") {
    //mostra un messaggio di conferma e resetta il valore della text area
    alert("We have received your feedback!");
    text.value = "";
  }
});
link2.addEventListener("click", function () {
  text.value = "";
});
