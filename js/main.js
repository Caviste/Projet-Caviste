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
        let arrRegions = ["California","Mendoza","Southern Rhone / Gigondas","Bordeaux","Oregon","Rioja","Burgundy","California Central Coast","Washington","Tuscany"];
        let arrGrapes = ["Pinot Noir","Pinot Gris", "Grenache","Syrah","Merlot","Tempranillo","Chardonnay","Sauvignon Blanc","Syrah","Sangiovese"];

        if ($.inArray(strSearch, arrRegions) !== -1) {
          fetch(url + "/regions/" + strSearch)
          .then((resp) => resp.json())
          .then(function (data) {
            data.forEach((vin) => {
              queryArr.push(vin);
            });
            showListWine(queryArr);
          })
        } else if ($.inArray(strSearch, arrGrapes) !== -1) {
          fetch(url + "/grapes/" + strSearch)
          .then((resp) => resp.json())
          .then(function (data) {
            data.forEach((vin) => {
              queryArr.push(vin);
            });
            showListWine(queryArr);
          })
        } else {
          fetch(url + "/search/" + strSearch)
          .then((resp) => resp.json())
          .then(function (data) {
            data.forEach((vin) => {
              queryArr.push(vin);
            });
            showListWine(queryArr);
          });
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
$('#main').hide();
$('#ChartGraph').click(function(event){
  const cadre = document.querySelector("#cadre");
  const ctx = cadre.getContext('2d');

  let nbUSA = countWineByCountry(vinData,'USA');
  let nbFrance = countWineByCountry(vinData,'France');
  let nbSpain = countWineByCountry(vinData,'Spain');
  let nbTotal = nbUSA+nbFrance+nbSpain;

  nbUSA =(nbUSA*100)/nbTotal; 
  nbFrance =(nbFrance*100)/nbTotal;
  nbSpain =(nbSpain*100)/nbTotal;

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
    labels: ['USA', 'France', 'Spain'],
    data: [nbUSA, nbFrance, nbSpain]
  };

  let myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: myData.labels,
          datasets: [{
              label: 'Nombre de vins',
              data: myData.data,
              backgroundColor: [
                  'rgba(0, 0, 0, 0.2)',
                  'rgba(255, 247, 10, 0.2)',
                  'rgba(255, 0, 0, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 3
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
  });
  $('#main').show();//???
});