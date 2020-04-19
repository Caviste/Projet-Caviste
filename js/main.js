let vinData = [];

const url = "http://cruth.phpnet.org/epfc/caviste/api/wines"; // URL de l'API
const btnReset = document.getElementById('reset');

// Récupération des données de l'API Caviste
let request = new XMLHttpRequest();
request.open("GET", url, true);

request.onload = function () {
  let data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    data.forEach((vin) => {
      vinData.push(vin);
    });
    showListWine(); // Affiche la liste de vin
  } else {
     if (request.status >= 400) {
      alert("Erreur du client web");
    }
  }
};

request.send();

// Ajoute une majuscule au début de la string
function ucFirst(str) {
  if (!str) return str;

  return str[0].toUpperCase() + str.slice(1);
}

// Efface toute valeur dans l'input strSearch
function resetSearch() {
  document.getElementById('strSearch').value = "";
}

// Affichage de la liste de vin
function showListWine() {
  let str = "";
  for (let i = 0; i < vinData.length; i++) {
    str += '<li class="list-group-item" id=' + i + " onclick=showDetails(" + i + ")>" + vinData[i].name + "</li>"; //Index = i-1
  }
  document.getElementById("liste").innerHTML = str;
}

// Affiche les détails du vin cliqué
function showDetails(index) {
  document.getElementById('idVin').value = index + 1;
  document.getElementById('nomVin').value = vinData[index].name;
  document.getElementById('raisins').value = vinData[index].grapes;
  document.getElementById('pays').value = vinData[index].country;
  document.getElementById('region').value = vinData[index].region;
  document.getElementById('year').value = vinData[index].year;
  document.getElementById('description').value = vinData[index].description;
  document.getElementById('image').src = "./pics/"+vinData[index].picture+"";
}

function searchWine() {
  /** La fonction se charge de trouver et afficher les noms de vins a partir d'une chaine de caracteres
   *  La fonction recupere le texte entre par l'user dans l'input text "strSearch"
   *  La fonction cherche s'il y a une chaine de caracteres correspondante dans vinData
   *  S'il y en a au moins une, elle affiche le ou les resultats
   */
  let str = "";
  let strSearch = document.getElementById('strSearch').value.trim();
  
  for (let i = 0; i < vinData.length; i++) { 
    if ( strSearch == parseInt(strSearch, 10)) {
      if (strSearch  < 1970) { // On recherche l'ID
        if (vinData[i].id.indexOf(strSearch) != -1) {
          str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>";
        }
      } else { // On recherche l'année
        if (vinData[i].year.indexOf(strSearch) != -1) {
          str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>";
        }
      }
    } else {
      if (vinData[i].name.indexOf(strSearch.toUpperCase()) != -1) {
        str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>";
      } else if (vinData[i].grapes.indexOf(ucFirst(strSearch)) != -1) {
        str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>";
      } else if ((vinData[i].country.indexOf(ucFirst(strSearch)) != -1) || (vinData[i].country.indexOf(strSearch.toUpperCase()) != -1)) {
        str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>";
      } else {
        if (vinData[i].region.indexOf(ucFirst(strSearch)) != -1) {
          str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>";
        }
      } 
    }
  }
  str += '<button id="reset" type="button" class="btn btn-danger" onclick=showListWine()>R&eacute;initialiser la liste</button>';
  document.getElementById("liste").innerHTML = str;

  btnReset.addEventListener('click', resetSearch);

}
