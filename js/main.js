//Remplace onreadystatechange par onload
//ajouter les champs promo, bio, prix, etc
//trier par couleur, bio & prix ascendant/descendant
// plus de onclick
// fonction anonyme si on appelle fonction + attribut
// photos pas en local -> ajouter à l'url de l'api -> http://cruth.phpnet.org/epfc/caviste/pics/pic.jpg
// Wiki


let vinData = [];
let showReset = false;
const url = "http://cruth.phpnet.org/epfc/caviste/api/wines"; // URL de l'API

// R�cup�ration des donn�es de l'API Caviste
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

// Ajoute une majuscule au d�but de la string
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

// Affiche les d�tails du vin cliqu�
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
   *  La fonction cherche le vin correspondant a l'input dans l'API
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
    if( typeof document.getElementById('strSearch').value === 'string' ) {
    let strSearch = document.getElementById('strSearch').value.trim();
    fetch(url + "/search/" + strSearch)
    .then((resp) => resp.json())
    .then(function(data) {
      data.forEach((vin) => {
        queryArr.push(vin);
      });
      showListWine(queryArr);
    });
  }
}
    
}

function signIn() {
  console.log("SignIn");
  let username = document.getElementById('login').value.trim();
  let pwd = document.getElementById('mdp').value.trim();

  if (typeof(Storage) !== 'undefined') {
    if (username.length === 0) {
      alert('Veuillez entrer un login valide!');
    } else if (typeof username !== "string") {
      alert('Le login doit être une chaîne de caractères!');
    } else {
      localStorage.username  = username;
    }

    if (pwd.length === 0) {
      alert('Veuillez entrer un mot de passe valide!');
    } else if (typeof pwd !== "string") {
      alert('Le mot de passe doit être une chaîne de caractères!');
    } else {
      localStorage.password  = pwd;
    }

    if ((typeof localStorage.username !== "undefined") && (typeof localStorage.password !== "undefined")) {
      if (!localStorage.isLoggedIn) {
        alert('Bienvenue sur Millésime, ' + username + " !");
        console.log(localStorage);
      } else {
        alert('Vous êtes déjà inscrit !');
      }
    }
  } else {
    console.log("L'information n'a pas pu être sauvegardée");
  }
}

function logIn() {
  console.log("LogIn");
  let username = document.getElementById('login').value.trim();
  let pwd = document.getElementById('mdp').value.trim();

  if (username === localStorage.username) {
    if (pwd === localStorage.password ) {
      sessionStorage.username = username;
      sessionStorage.password = pwd;
      sessionStorage.isLoggedIn = true;
    } else {
      alert('Mot de passe incorrect !');
    }
  } else {
    alert('Le login ne correspond pas !');
  }

  if ((sessionStorage.username !== "undefined") && (sessionStorage.password !== "undefined") && (sessionStorage.isLoggedIn)) {
    console.log("Logged in ? " + sessionStorage.isLoggedIn);
  }
}
  

