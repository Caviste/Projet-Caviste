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
document.getElementById("ajouter").addEventListener('click', function() {
  document.getElementById('supprimer').style.display="inline-block";
  document.getElementById('sauvegarder').style.display="inline-block";

});
// Empêche la redirection en appuyant sur Enter
$('#strSearch').keypress(
  function(event){
    if (event.which == '13') { // 13 = keyPress Enter
      event.preventDefault();
    }
});

$('#ajouter').click(function (event) {
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
  document.getElementById("image").src = "http://cruth.phpnet.org/epfc/caviste/public/pics/" + vin.picture;
  document.getElementById("description").value = vin.description;
  document.getElementById("couleur").value = vin.color;
  document.getElementById("capacite").value = vin.capacity;
  if (vin.extra !== null) {
    document.getElementById("extras").className = 'show';
    if (vin.extra["bio"] == true) {
      document.getElementById("bioTrue").checked = true;
    } else {
      document.getElementById("bioFalse").checked = true;
    }
   JSON.parse(vin.extra);
    if(vin.extra.promo !== undefined){
      console.log("Promo exists");
      let promoVin = JSON.parse(vin.extra);
      document.getElementById("prix").value = parseFloat(vin.price) - (parseFloat(vin.price) * parseFloat(promoVin.promo));
    }else{
      document.getElementById('prix').value = "";
      document.getElementById("prix").value = vin.price + " €";
    }
  } else {
    document.getElementById("extras").className ='hide';
  }
}

document.getElementById("recherche").addEventListener("click", searchWine);

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
  } else if (selectOpt == 5){
    invertYearSort();
  } else if(selectOpt == 6 ) {
    capacitySort();
  } else if(selectOpt == 7) {
    invertCapacitySort();
  } else if (selectOpt == 8){
    priceSort();
  } else{
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
    return b.year > a.year ? 1 : b.year < a.year ? -1 : 0
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
function invertCapacitySort(){
  let tmp = getData();
  tmp.sort(function(a,b){
    return b.capacity > a.capacity ? 1 : b.capacity < a.capacity ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par prix
function priceSort(){
  let tmp = getData();
  tmp.sort(function(a,b){
    return a.price > b.price ? 1 : a.price < b.price ? -1 : 0;
  });
  showListWine(tmp);
}

// Tri par prix inversée 
function invertPriceSort(){
  let tmp = getData();
  tmp.sort(function(a,b){
    return b.price > a.price ? 1 : b.price < a.price ? -1 : 0;
  });
  showListWine(tmp);
}

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
      if (typeof document.getElementById("strSearch").value === "string") {
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
  } else {
    alert("Veuillez écrire quelque chose dans la zone de recherche !");
  }
}

document.getElementById("btnSignUp").addEventListener("click", signUp);
document.getElementById("btnLogIn").addEventListener("click", logIn);

//USE: Bearer
function signUp() {
  console.log("SignIn");
  let username = document.getElementById("login").value.trim();
  let pwd = document.getElementById("mdp").value.trim();

  if (typeof Storage !== "undefined") {
    if (username.length === 0) {
      alert("Veuillez entrer un login valide!");
    } else if (typeof username !== "string") {
      alert("Le login doit être une chaîne de caractères!");
    } else {
      localStorage.username = username;
    }

    if (pwd.length === 0) {
      alert("Veuillez entrer un mot de passe valide!");
    } else if (typeof pwd !== "string") {
      alert("Le mot de passe doit être une chaîne de caractères!");
    } else {
      localStorage.password = pwd;
    }

    if (
      typeof localStorage.username !== "undefined" &&
      typeof localStorage.password !== "undefined"
    ) {
      if (!localStorage.isLoggedIn) {
        alert("Bienvenue sur Millésime, " + username + " !");
        localStorage.isLoggedIn = true;
        console.log(localStorage);
      } else {
        alert("Vous êtes déjà inscrit !");
      }
    }
  } else {
    console.log("L'information n'a pas pu être sauvegardée");
  }
}

function logIn() {
  console.log("LogIn");
  let username = document.getElementById("login").value.trim();
  let pwd = document.getElementById("mdp").value.trim();

  if (username === localStorage.username) {
    if (pwd === localStorage.password) {
      sessionStorage.username = username;
      sessionStorage.password = pwd;
      sessionStorage.isLoggedIn = true;
    } else {
      alert("Mot de passe incorrect !");
    }
  } else {
    alert("Le login ne correspond pas !");
  }

  if (
    sessionStorage.username !== "undefined" &&
    sessionStorage.password !== "undefined" &&
    sessionStorage.isLoggedIn
  ) {
    console.log("Logged in ? " + sessionStorage.isLoggedIn);
    alert("Vous êtes connecté(e) !");
  }
}
