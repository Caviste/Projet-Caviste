// trier par couleur, bio & prix ascendant/descendant
// Wiki
// mit // cc // open-source license
const url = "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines"; // URL de l'API
let showReset = false;
let vinData = [];

// Récupération des données de l'API Caviste
let request = new XMLHttpRequest();
request.open("GET", url, true);

request.onload = function () {
  let dataResp = JSON.parse(this.response);
  if (request.status == 200 && request.readyState == 4) {
    dataResp.forEach((vin) => {
      vinData.push(vin);
    });
    showListWine(vinData); // Affiche la liste de vin
  } else {
    if (request.status >= 400) {
      alert("Récupération des données de l'API");
    }
  }
};
request.send();

// Reset le choix de tri
var options = document.querySelectorAll("#trier option");
for (let i = 0; i < options.length; i++) {
  options[i].selected = options[i].defaultSelected;
}

// Ajoute une majuscule au début de la string
function ucFirst(str) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

// Efface toute valeur dans l'input strSearch
function resetSearch() {
  document.getElementById("strSearch").value = "";
}

//Bouton ajouter -affichage des btn sauvegarder et supprimer
document.getElementById("ajouter").addEventListener("click", function () {
  document.getElementById("supprimer").style.display = "inline-block";
  document.getElementById("sauvegarder").style.display = "inline-block";
});

// Empêche la redirection en appuyant sur Enter
$("#strSearch").keypress(function (event) {
  // 13 = keyPress Enter
  if (event.which == "13") {
    event.preventDefault();
  }
});

$("#ajouter").click(function (event) {
  event.preventDefault();
  // TODO call fct to enable details modif
});

// Affichage de la liste de vin
function showListWine(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += '<li class="list-group-item" id=' + arr[i].id + ">" + arr[i].name + "</li>";
  }

  document.getElementById("liste").innerHTML = str;

  // Affiche un bouton de Reset
  if (showReset) {
    str += '<button id="reset" type="button" class="btn btn-danger">R&eacute;initialiser la liste</button>';
    document.getElementById("liste").innerHTML = str;

    const btnReset = document.getElementById("reset");
    btnReset.addEventListener("click", function () {
      resetSearch();
      showListWine(vinData);
    });
  }

  showReset = false; // Réinitialisation à false pour ne plus afficher le bouton

  for (let i = 0; i < arr.length; i++) {
    document.getElementById("liste").getElementsByTagName("li")[i].addEventListener("click", function () {
        showDetails(arr[i].id);
      });
  }
}

// Affiche les détails du vin cliqué
function showDetails(index) {
  let vin = vinData.find((element) => element.id == index);
  document.getElementById("idVin").value = vin.id;
  document.getElementById("nomVin").value = vin.name;
  document.getElementById("raisins").value = vin.grapes;
  document.getElementById("pays").value = vin.country;
  document.getElementById("region").value = vin.region;
  document.getElementById("year").value = vin.year;
  document.getElementById("image").src =
    "http://cruth.phpnet.org/epfc/caviste/public/pics/" + vin.picture;
  document.getElementById("description").value = vin.description;
  document.getElementById("couleur").value = vin.color;
  document.getElementById("capacite").value = vin.capacity + " CL";

  if (vin.extra !== null) {
    document.getElementById("extras").className = "show";
    if (vin.extra["bio"] == true) {
      document.getElementById("bioTrue").checked = true;
    } else {
      document.getElementById("bioFalse").checked = true;
    }

    let extra = JSON.parse(vin.extra);

    if (extra.promo !== null) {
      let promoVin = parseFloat(extra.promo);
      document.getElementById("prix").value = parseFloat(vin.price) - parseFloat(vin.price) * parseFloat(promoVin) + " €";
    } else {
      if (vin.price === "0") {
        document.getElementById("prix").value = "Info indisponible";
      } else {
        document.getElementById("prix").value = vin.price + " €";
      }
    }
  } else {
    document.getElementById("prix").value = vin.price + " €";
    document.getElementById("extras").className = "hide";

    if (vin.color === "") {
      document.getElementById("couleur").value = "Info indisponible";
    }

    if (vin.capacity === "0") {
      document.getElementById("capacite").value = "Info indisponible";
    }

    if (vin.price === "0") {
      document.getElementById("prix").value = "Info indisponible";
    } else {
      document.getElementById("prix").value = vin.price + " €";
    }
  }
}

// Mode de tri suivant l'option cliquée
function sortMethods(selected) {
  let selectOpt = selected.value;
  if (selectOpt == 1) {
    alphaSort();
  } else if (selectOpt == 2) {
    invertSort();
  } else if (selectOpt == 3) {
    cepageSort();
  } else if (selectOpt == 4) {
    yearSort();
  } else if (selectOpt == 5) {
    invertYearSort();
  } else if (selectOpt == 6) {
    capacitySort();
  } else if (selectOpt == 7) {
    invertCapacitySort();
  } else if (selectOpt == 8) {
    priceSort();
  } else {
    invertPriceSort();
  }
}

// Récupère les infos de l'array vinData
function getData() {
  let arr = [];

  vinData.forEach((vin) => {
    arr.push(vin);
  });

  return arr;
}

// Tri alphabétique A-Z
function alphaSort() {
  let tmp = getData();

  tmp.sort(function (a, b) {
    return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri Inversé Z-A
function invertSort() {
  let tmp = getData();

  tmp.sort(function (a, b) {
    return b.name > a.name ? 1 : b.name < a.name ? -1 : 0;
  });

  showListWine(tmp);
}

// Tri par raisin
function cepageSort() {
  let tmp = getData();

  tmp.sort(function (a, b) {
    return a.grapes > b.grapes ? 1 : a.grapes < b.grapes ? -1 : 0;
  });

  showListWine(tmp);
}

// Tri par année
function yearSort() {
  let tmp = getData();

  tmp.sort(function (a, b) {
    return a.year > b.year ? 1 : a.year < b.year ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par année inversée
function invertYearSort() {
  let tmp = getData();

  tmp.sort(function (a, b) {
    return b.year > a.year ? 1 : b.year < a.year ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par capacité
function capacitySort() {
  let tmp = getData();
  tmp.sort(function (a, b) {
    return a.capacity > b.capacity ? 1 : a.capacity < b.capacity ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par capacité inversée
function invertCapacitySort() {
  let tmp = getData();
  tmp.sort(function (a, b) {
    return b.capacity > a.capacity ? 1 : b.capacity < a.capacity ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par prix
function priceSort() {
  let tmp = getData();
  tmp.sort(function (a, b) {
    return a.price > b.price ? 1 : a.price < b.price ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par prix inversée
function invertPriceSort() {
  let tmp = getData();
  tmp.sort(function (a, b) {
    return b.price > a.price ? 1 : b.price < a.price ? -1 : 0;
  });
  showListWine(tmp);
}

document.getElementById("recherche").addEventListener("click", searchWine);

$(document).ready(function(){
  $('#strSearch').on('keyup',function(){
    let searchValue = $(this).val().toLowerCase();
    $("#liste li").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1)
    });
  });
});

function searchWine() {
  /** La fonction se charge de trouver et afficher les noms de vins a partir d'une chaine de caracteres, ou un nombre
   *  La fonction recupere le texte entre par l'user dans l'input "strSearch"
   *  La fonction cherche le vin correspondant a l'input dans l'API
   *  S'il y en a au moins une, elle affiche le ou les resultats
   *  Si l'user clique sur "Rechercher", showReset devient true, ce qui affichera un bouton pour reset la liste
   **/

  let queryArr = [];
  showReset = true;
  let str = "";
  let strSearch = document.getElementById("strSearch").value.trim();
  if (document.getElementById("strSearch").value !== "") {
    if (strSearch == parseInt(strSearch)) {
      let request = new XMLHttpRequest();
      request.open("GET", url + "/" + parseInt(strSearch), true);
      request.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
          let reply = JSON.parse(this.response);
          showListWine(reply);
        }
      };
      request.send();
    } else {
      if (typeof strSearch === "string") {
        let arrRegions = [];
        let arrGrapes = [];
        vinData.forEach((vin)=> {
          if(!arrRegions.includes(vin["region"])) {
            arrRegions.push(vin["region"]);
          }
        });
        vinData.forEach((vin) => {
          if(!arrGrapes.includes(vin["grapes"])) {
            arrGrapes.push(vin["grapes"]);
          }
        });
        console.log(arrGrapes);
        console.log(strSearch);
        if ($.inArray(ucFirst(strSearch), arrRegions) !== -1) {
          fetch(url + "/regions/" + strSearch)
          .then((resp) => resp.json())
          .then(function (data) {
            data.forEach((vin) => {
              queryArr.push(vin);
            });
            showListWine(queryArr);
          })
        
        } else if (arrGrapes.indexOf(strSearch) !== -1) { //TODO: Bug when searching for Pinot (single word instead of full grape name)
          fetch(url + "/grapes/" + strSearch)
          .then((resp) => resp.json())
          .then(function (data) {
            data.forEach((vin) => {
              queryArr.push(vin);
            });
            showListWine(queryArr);
          })
        }
      }
    }
  } else {
    alert("Veuillez écrire quelque chose dans la zone de recherche !");
  }
}

document.getElementById("btnSignUp").addEventListener("click", signUp);
//document.getElementById("btnLogIn").addEventListener("click", logIn);

//USE: Bearer
function signUp() {
  // TODO 
  // Mock token, fakes being sent from server
  localStorage.setItem("UniqueUserToken", JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"));

  let url = "http://jsonplaceholder.typicode.com/users"
  let token = JSON.parse(sessionStorage.getItem('UniqueUserToken'));  
  let h = new Headers();
  h.append('Authentication', `Bearer ${token}`);

  let req = new Request(url, {
    method: 'GET',
    mode: 'cors',
  });

  fetch(req)
    .then(resp => resp.json())
    .then(data => {
      console.log(data[1]);
    })
    .catch(err => {
      console.log(err.message);
    })
}

/* Chart JS*/
/* Hide les div des charts */
$('#mainPays').hide();
$('#mainRaisins').hide();
$('#closePays').hide();

/* Afficher les deux chart (Pays et Raisins) aprés un click sur le btn "Statistiques" */
$('#clickMe').click(function(){

  /* Chart pays */
  $('#mainPays').animate({
  }, 5000, function() {
    $('#mainPays').show();
    $('#closePays').show();
  });

  const cadre = document.querySelector("#cadrePays");
  const ctx = cadre.getContext('2d');
  Chart.defaults.global.defaultFontColor = 'black';

  // Crée un array contenant tous les pays des vins
  let arrCountry = [];
  vinData.forEach((vin) => {
    if (!arrCountry.includes(vin["country"])){
      arrCountry.push(vin["country"]);
    }
  });

  // Crée un array contenant tous les nombres de vins, par pays
  let arrNb = [];
  for (let i = 0; i < arrCountry.length; i++) {
    arrNb.push(countWineByCountry(vinData, arrCountry[i]));
  }

  function countWineByCountry(liste, country) {
    let cpt = 0;    
    for(let vin of liste) {
      if(vin.country==country) {
        cpt++;
      }
    }
    return cpt;
  }

  const myData = {
    labels: arrCountry,
    data: arrNb
  };

  let myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: myData.labels,
      datasets: [{
        label: 'Nombre de vins',
        data: myData.data,
        backgroundColor: [
          // Pick colors
          'rgba(244, 67, 54, 0.4)',
          'rgba(102, 187, 106, 0.4)',
          'rgba(255, 167, 38, 0.4)',
          'rgba(3, 169, 244,0.4)',
          'rgba(244, 143, 177, 0.4)',
        ],
        borderColor: [
          // Pick colors
          'rgb(244, 67, 54)',
          'rgb(139, 195, 74)',
          'rgb(255, 167, 38)',
          'rgb(3, 169, 244)',
          'rgb(244, 143, 177)',
        ],
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio:false,
      responsive: true,
        title: {
          display: true,
          text: 'Nombre des vins par Pays',
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          padding :10,
          fontSize : 20,
          scales: {
              yAxes: [{
                ticks: {
                  beginAtZero: true
                }
              }]
          }
        }  
    }
  });
  
  // Bouton Close Graph Pays
  $('#closePays').click(function(){
    $("#mainPays").css("display","none");
  });

   /* Chart Raisins */
  $('#mainRaisins').animate({
  }, 5000, function() {
    $('#mainRaisins').show();
  });

  const cadreRaisins = document.querySelector("#cadreRaisins");
  const ctxRaisins = cadreRaisins.getContext('2d');
  Chart.defaults.global.defaultFontColor = 'black';

  // Crée un array contenant tous les raisins des vins
  let arrGrapes = [];
  vinData.forEach((vin) => {
    if (!arrGrapes.includes(vin["grapes"])){
      arrGrapes.push(vin["grapes"]);
    }
  });

  // Crée un array contenant tous les raisins de vins, par pays
  let arrNbR = [];
  for (let i = 0; i < arrGrapes.length; i++) {
    arrNbR.push(countWineByGrapes(vinData, arrGrapes[i]));
  }

  function countWineByGrapes(liste, grapes) {
    let cptR = 0;    
    for(let vin of liste) {
      if(vin.grapes==grapes) {
        cptR++;
      }
    }
    return cptR;
  }

  const myDataR = {
    labels: arrGrapes,
    data: arrNbR
  };
  let myChartR = new Chart(ctxRaisins, {
    type: 'pie',
    data: {
      labels: myDataR.labels,
      datasets: [{
        label: 'Nombre de raisins',
        data: myDataR.data,
        backgroundColor: [
          // Pick colors
          'rgba(244, 67, 54, 0.4)',
          'rgba(102, 187, 106, 0.4)',
          'rgba(255, 167, 38, 0.4)',
          'rgba(3, 169, 244,0.4)',
          'rgba(244, 143, 177, 0.4)',
          'rgba(51, 70, 255, 0.4)',
          'rgba(255, 51, 51, 0.4)',
          'rgba(255, 212, 51, 0.4)',
          'rgba(51, 255, 255 , 0.4)',
        ],
        borderColor: [
          // Pick colors
          'rgb(244, 67, 54)',
          'rgb(139, 195, 74)',
          'rgb(255, 167, 38)',
          'rgb(3, 169, 244)',
          'rgb(244, 143, 177)',//
          'rgb(51, 70, 255)',
          'rgb(255, 51, 51)',
          'rgb(255, 212, 51)',
          'rgb(51, 255, 255 )',
        ],
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio:false,
      responsive: true,
      title: {
        display: true,
        text: 'Nombre des vins par raisins',
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        padding :10,
        fontSize : 20,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }  
    }
  });
  // Bouton Close Graph Pays
  $('#closeRaisins').click(function(){
    $("#mainRaisins").css("display","none");
  });
});

