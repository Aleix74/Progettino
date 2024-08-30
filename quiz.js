$(function () {
  $("[rel='tooltip']").tooltip();
});

// var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
//         var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
//             return new bootstrap.Tooltip(tooltipTriggerEl)
// })

// document.addEventListener('DOMContentLoaded', () => {
//   const checkboxes = document.querySelectorAll('.form-group input[type="checkbox"]'); //Seleziona tutti gli input di tipo "checkbox" all'interno del form con classe "form-group"
//   // const questionCategories = document.querySelectorAll('.question-category');
//   const specificQuestionCategoryIds = [1, 2, 3, 4, 5, 6]; //Id delle categorie di domande specifiche dove i radio button devono essere disabilitati

//   const selectedMezzi = [];  //Array per memorizzare i mezzi selezionati
//   const selectedName = {  //Oggetto per mappare i nomi dei mezzi con i loro identificatori
//     "autobus": "autobus",
//     "minibus": "minibus",
//     "autovetture": "autovetture",
//     "scooter": "scooter",
//     "biciclette": "biciclette",
//     "trasporto_acqua": "trasporto_acqua"
//   };

//   // Disabilita tutti i radio button nelle categorie di domande specificate
//   specificQuestionCategoryIds.forEach(id => {
//     // Seleziona la categoria di domanda usando l'ID
//     const questionCategory = document.getElementById(id.toString());
//     if (questionCategory) {
//       // Seleziona tutti i radio button all'interno della categoria di domanda
//       const radios = questionCategory.querySelectorAll('input[type="radio"]');
//       // Disabilita ogni radio button
//       radios.forEach(radio => {
//         radio.disabled = true;
//       });
//     }
//   });

//   // Aggiungi un listener per il cambiamento di stato dei checkbox
//   checkboxes.forEach((checkbox) => {
//     checkbox.addEventListener('change', () => {
//       selectedMezzi.length = 0; //Resetta l'array dei mezzi selezionati
//       checkboxes.forEach((cb) => {
//         if (cb.checked) {
//           selectedMezzi.push(cb.name);//Aggiungi il valore del checkbox selezionato all'array
//         }
//       });
//       console.log(selectedMezzi);// Stampa l'array dei mezzi selezionati nella console

//       // Itera attraverso le categorie di domande specifiche
//       specificQuestionCategoryIds.forEach(id => {
//         const questionCategory = document.getElementById(id.toString());
//         if (questionCategory) {
//           const radios = questionCategory.querySelectorAll('input[type="radio"]');
//           radios.forEach(radio => {
//             const isEnabled = selectedMezzi.includes(selectedName[radio.name]);
//             radio.disabled = !isEnabled; // Abilita o disabilita il pulsante radio in base alla selezione del mezzo
//           });
//         }
//       });
//     });
//   });
// });

//   // Funzione per calcolare il punteggio
//   function calculateScore() {
//     let score = 0;
//     $('input[type="checkbox"]:checked, input[type="radio"]:checked').each(function() {
//       score += parseInt($(this).val());
//     });
//     return score;
//   }

//   // Funzione per gestire il submit del form
//   $('#quizForm').on('submit', function(event) {
//     event.preventDefault(); // Impedisce il comportamento di default del submit
//     const score = calculateScore();
//     $.ajax({
//       type: 'POST',
//       url: 'esito.html',
//       data: { score: score },
//       success: function() {
//         window.location.href = 'esito.html?score=' + score; // Reindirizza a esito.html con il punteggio nella query string
//       }
//     });
//   });

// Funzione per mostrare il punteggio in esito.html
// $(document).ready(function() {
//   if (window.location.href.indexOf('esito.html')!== -1) {
//     const urlParams = new URLSearchParams(window.location.search);
//     const score = urlParams.get('score');
//     document.getElementById('score-container').innerText = `Il tuo punteggio è: ${score}`;
//   }
// });

// Funzione per calcolare il punteggio

function calculateScore() {
  let score = 0;
  $('input[type="checkbox"]:checked, input[type="radio"]:checked').each(
    function () {
      score += parseInt($(this).val());
    }
  );
  console.log("Punteggio finale: " + score);
  return score;
}

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(
    '.form-group input[type="checkbox"]'
  ); //Seleziona tutti gli input di tipo "checkbox" all'interno del form con classe "form-group"
  // const questionCategories = document.querySelectorAll('.question-category');
  const specificQuestionCategoryIds = [1, 2, 3, 4, 5, 6]; //Id delle categorie di domande specifiche dove i radio button devono essere disabilitati

  const selectedMezzi = []; //Array per memorizzare i mezzi selezionati
  const selectedName = {
    //Oggetto per mappare i nomi dei mezzi con i loro identificatori
    autobus: "autobus",
    minibus: "minibus",
    autovetture: "autovetture",
    scooter: "scooter",
    biciclette: "biciclette",
    trasporto_acqua: "trasporto_acqua",
  };

  // Disabilita tutti i radio button nelle categorie di domande specificate
  specificQuestionCategoryIds.forEach((id) => {
    // Seleziona la categoria di domanda usando l'ID
    const questionCategory = document.getElementById(id.toString());
    if (questionCategory) {
      // Seleziona tutti i radio button all'interno della categoria di domanda
      const radios = questionCategory.querySelectorAll('input[type="radio"]');
      // Disabilita ogni radio button
      radios.forEach((radio) => {
        radio.disabled = true;
      });
    }
  });

  // Aggiungi un listener per il cambiamento di stato dei checkbox
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      selectedMezzi.length = 0; //Resetta l'array dei mezzi selezionati
      checkboxes.forEach((cb) => {
        if (cb.checked) {
          selectedMezzi.push(cb.name); //Aggiungi il valore del checkbox selezionato all'array
        }
      });
      console.log(selectedMezzi); // Stampa l'array dei mezzi selezionati nella console

      // Itera attraverso le categorie di domande specifiche
      specificQuestionCategoryIds.forEach((id) => {
        const questionCategory = document.getElementById(id.toString());
        if (questionCategory) {
          const radios = questionCategory.querySelectorAll(
            'input[type="radio"]'
          );
          radios.forEach((radio) => {
            const isEnabled = selectedMezzi.includes(selectedName[radio.name]);
            radio.disabled = !isEnabled; // Abilita o disabilita il pulsante radio in base alla selezione del mezzo
          });
        }
      });
    });
  });
});

const form = document.querySelector("#quizForm");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Submit evento attivato!");
  const score = calculateScore();
  console.log("Score:", score);

  // Redirect to esito.html with the score in the query parameter
  window.location.href = "esito.html?score=" + score;
  form.reset();
});

window.addEventListener("popstate", (event) => {
  window.scrollTo(0, 0);
});

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

document.addEventListener("DOMContentLoaded", () => {
  window.scrollTo(0, 0);
});

function saveEsito(){
    console.log(user);
    cookie
    var punteggio = document.getElementById('scoreResult').innerText.slice(20,document.getElementById('scoreResult').innerText.length).trim();
//   pool.query(
//     `INSERT INTO quiz (hotel_id, punteggio) VALUES ($1, $2) ON CONFLICT (hotel_id)
//      DO UPDATE SET punteggio = EXCLUDED.punteggio`,//ON CONFLICT (hotel_id) DO UPDATE per gestire il caso in cui il hotel_id esista già nella tabella. In tal caso, il punteggio viene aggiornato.
//     [userId, score],
//     (err, results) => {
//         if (err) {
//             console.error('Errore durante l\'inserimento del punteggio nel database:', err);
//             res.status(500).json({ error: 'Errore del server' });
//         } else {
//             res.status(200).send("Punteggio salvato con successo");
//         }
//     }
// );
}

// Salva la posizione di scroll prima che l'utente navighi via
// window.addEventListener('beforeunload', () => {
//   sessionStorage.setItem('scrollPosition', window.scrollY);
// });

// Forza lo scroll all'inizio quando si torna indietro alla pagina
// window.addEventListener('pageshow', (event) => {
//   if (event.persisted) {
//     window.scrollTo(0, 0);
//   }
// });

// Controlla la posizione di scroll al caricamento della pagina
// window.addEventListener('load', () => {
//   const scrollPosition = sessionStorage.getItem('scrollPosition');
//   if (scrollPosition !== null) {
//     window.scrollTo(0, 0);
//     sessionStorage.removeItem('scrollPosition');
//   }
// });

// function getQueryParams() {
//   const params = new URLSearchParams(window.location.search);
//   return {
//     score: params.get('score')
//   };
// }

// // Mostra il punteggio nella pagina
// const queryParams = getQueryParams();
// document.getElementById('score-container').innerText = `Il tuo punteggio è: ${queryParams.score}`;
// Invia il punteggio al server
//   fetch('/submit-quiz', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: score ,
//   })
//   .then(response => {
//     if (!response.ok) {
//         return response.text().then(text => {
//             throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
//         });
//     }
//     return response.json(); // Attempt to parse the response as JSON
// })
//   .then(data => {
//     console.log('Success:', data);
//     window.location.href = '/esito';
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//   });

//   form.reset();
// });

// form.addEventListener('submit', (event) => {
//   event.preventDefault();
//   const score = calculateScore();
//   console.log('Score:', score);
//   // Redirect to the server with the score as a query parameter
//   window.location.href = '/quiz?score=' + score;
//   form.reset();
// });

// function checkAuth() {
//   fetch('/quiz', {
//       method: 'GET',
//       credentials: 'include'
//   }).then(response => {
//       if (response.redirected) {
//           window.location.href = response.url;
//       } else {
//           window.location.href = '/quiz';
//       }
//   });
// }
