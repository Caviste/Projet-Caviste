let vinData = [];
let showReset = false;
const url = "http://cruth.phpnet.org/epfc/caviste/api/wines"; // URL de l'API

// Rï¿½cupï¿½ration des donnï¿½es de l'API Caviste
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
      alert("Erreur du client web");
    }
  }
};

request.send();

var options = document.querySelectorAll('#trier option');
for (let i = 0, l = options.length; i < l; i++) {
    options[i].selected = options[i].defaultSelected;
}

// Ajoute une majuscule au dï¿½but de la string
function ucFirst(str) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

// Efface toute valeur dans l'input strSearch
function resetSearch() {
  document.getElementById('strSearch').value = "";
}

// Affichage de la liste de vin
function showListWine(arr) {
  let str = "";
  for (let i = 0; i < arr.length; i++) {
    str += '<li class="list-group-item" id=' + arr[i].id + " onclick=showDetails(" + arr[i].id  + ")>" + arr[i].name + "</li>"; //Index = i-1
  }
  if (showReset) {
    // Affiche un bouton de Reset
    str += '<button id="reset" type="button" class="btn btn-danger" onclick=showListWine(vinData)>R&eacute;initialiser la liste</button>';
    document.getElementById("liste").innerHTML = str;
    const btnReset = document.getElementById('reset');
    btnReset.addEventListener('click', resetSearch);
  }
  document.getElementById("liste").innerHTML = str;
  showReset = false;
}

function alphaSort() {
  vinData.sort(function(a,b) {
    return a["name"].localeCompare(b["name"]);
  });
  showListWine(vinData);
} 

function invertSort() {
  vinData.sort(function(a,b) {
    return b["name"].localeCompare(a["name"]);
  });
  showListWine(vinData);
}

function cepageSort() {
  vinData.sort(function(a,b) {
    return a["grapes"].localeCompare(b["grapes"]);
  });
  showListWine(vinData);
}

// Affiche les dï¿½tails du vin cliquï¿½
function showDetails(index) {
  let realId = index - 1;
  document.getElementById('idVin').value = vinData[realId].id;
  document.getElementById('nomVin').value = vinData[realId].name;
  document.getElementById('raisins').value = vinData[realId].grapes;
  document.getElementById('pays').value = vinData[realId].country;
  document.getElementById('region').value = vinData[realId].region;
  document.getElementById('year').value = vinData[realId].year;
  document.getElementById('description').value = vinData[realId].description;
  document.getElementById('image').src = "./pics/"+vinData[realId].picture+"";
}

function searchWine() {
  /** La fonction se charge de trouver et afficher les noms de vins a partir d'une chaine de caracteres
   *  La fonction recupere le texte entre par l'user dans l'input text "strSearch"
   *  La fonction cherche s'il y a une chaine de caracteres correspondante dans vinData
   *  S'il y en a au moins une, elle affiche le ou les resultats
   *  Si l'user clique sur "Rechercher", showReset devient true, ce qui affichera un bouton pour reset la liste
   */
  let queryArr = [];
  showReset = true;
  let str = "";
  let strSearch = document.getElementById('strSearch').value.trim();
  if (strSearch == parseInt(strSearch)) {
    let request = new XMLHttpRequest();
    request.open("GET", url + "/" + parseInt(strSearch), true);
    request.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let reply = JSON.parse(this.response);
        queryArr.push(reply);
        showListWine(queryArr);
      }
    }
    request.send();
  } else {
    //Ecrire requête GET


    // récup noms des vins
    // -> vinData a tous les vins
    //créer un nouvel array
    let newVins = []

    // push nouvel array
    vinData.forEach((vin) => {
      newVins.push(vin);
    }); // Ok

    // check input == nom array
    // Si dans l'array newVins il y a strSearch dans les noms
    if(newVins.name.indexOf(strSearch) != -1) {
      
    }  
      
  }
  

}
