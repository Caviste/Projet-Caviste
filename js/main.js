//Récuperation des infos de l'API
let vinData = [];
let request = new XMLHttpRequest();
let url = "http://cruth.phpnet.org/epfc/caviste/api/wines"; // URL de l'API

request.open("GET", url, true);

request.onload = function () {
  let data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    data.forEach((vin) => {
      vinData.push(vin);
    });
    showListWine(); // Affiche la liste de vin
  } else {
    console.log("error");
  }
};

request.send();

// Affichage dynamique de la liste de vin
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
  let strSearch = document.getElementById('strSearch').value;

  for (let i = 0; i < vinData.length; i++) { 
    if (vinData[i].name.indexOf(strSearch.toUpperCase()) != -1) {
      str += '<li class="list-group-item" id='+i+' onclick=showDetails('+i+')>' + vinData[i].name + "</li>"; //Index = i-1
    }
  }
  str += '<button id="reset" type="button" class="btn btn-danger" onclick=showListWine()>R&eacute;initialiser la liste</button>';
  document.getElementById("liste").innerHTML = str;
}
