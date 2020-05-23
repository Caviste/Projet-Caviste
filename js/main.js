// Wiki
// mit // cc // open-source license
sessionStorage.clear();
const url = "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines"; // URL de l'API
const restCountriesURL = "https://restcountries.eu/rest/v2/name/"; // URL API RESTCountries
let showReset = false;
let wineClicked = false;
let wineLiked = false;
let vinData = [];
let arrLikedWines = [];

// Récuperation des données de l'API
fetch("https://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines")
  .then((response) => response.json())
  .then(function (data) {
    for (let prop in data) {
      vinData.push(data[prop]);
    }
    showListWine(vinData);
  })
  .catch((error) => {
    console.error("Erreur: ", error);
  });

// Reset le choix de tri
var options = document.querySelectorAll("#trier option");
for (let i = 0; i < options.length; i++) {
  options[i].selected = options[i].defaultSelected;
}

/**
 * Ajoute une majuscule au début de la string
 * @param {string} str La chaine de caractère à modifier
 * @return {string} La chaine de caractère modifiée
 */

function ucFirst(str) {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

// Efface toute valeur dans l'input strSearch
function resetSearch() {
  document.getElementById("strSearch").value = "";
}

// Empêche la redirection en appuyant sur Enter
$("#strSearch").keypress(function (event) {
  // key 13 = key Enter
  if (event.which == "13") {
    event.preventDefault();
  }
});

/**
 * Affichage de la liste de vin
 * Crée une liste de vin et l'incorpore dans le document
 * @param {Array} arr Le tableau contenant des vins
 */

function showListWine(arr) {
  let str = "";

  for (let i = 0; i < arr.length; i++) {
    str +=
      '<li class="list-group-item" id=' +
      arr[i].id +
      ">" +
      arr[i].name +
      "</li>";
  }

  document.getElementById("liste").innerHTML = str;

  // Affiche un bouton de Reset pour réinitialiser la liste de vin
  if (showReset) {
    str +=
      '<button id="reset" type="button" class="btn btn-danger">R&eacute;initialiser la liste</button>';
    document.getElementById("liste").innerHTML = str;

    const btnReset = document.getElementById("reset");
    btnReset.addEventListener("click", function () {
      resetSearch();
      showListWine(vinData);
    });
  }

  showReset = false; // Réinitialisation à false pour ne plus afficher le bouton

  for (let i = 0; i < arr.length; i++) {
    document
      .getElementById("liste")
      .getElementsByTagName("li")
      [i].addEventListener("click", function () {
        showDetails(arr[i].id);
      });
  }
}

/**
 * Affiche les détails du vin cliqué dans les inputs dédiés pour
 * @param {number} index L'index (id) du vin
 */

function showDetails(index) {
  wineClicked = true;
  let vin = vinData.find((element) => element.id == index); // Retrouve le vin dans l'array vinData grâce à son id
  $("#idVin").val(vin.id);
  $("#nomVin").val(vin.name);
  $("#raisins").val(vin.grapes);
  $("#pays").val(vin.country);
  $("#region").val(vin.region);
  $("#year").val(vin.year);
  $("#image").attr(
    "src",
    "http://cruth.phpnet.org/epfc/caviste/public/pics/" + vin.picture
  );
  $("#hiddenWineId").val(vin.id);

  //Use RESTCOUNTRIES API;
  let codeCountry;
  fetch(restCountriesURL + vin.country)
    .then(function (res) {
      return res.json();
    })
    .then((data) => initialize(data))
    .catch((error) => console.log("Erreur: ", error));

  /**
   * Affichage dynamique du pays du vin
   * @param {object} countriesData
   */
  function initialize(countriesData) {
    let countries = countriesData;
    codeCountry = countries[0].alpha2Code;
    $("#countryFlagsImg").attr(
      "src",
      "https://www.countryflags.io/" + codeCountry + "/flat/32.png"
    );
    $("#countryFlagsImg").css("display", "inline-block");
  }

  $("#description").text("" + vin.description + "");
  $("#couleur").val(vin.color);
  $("#capacite").val(vin.capacity + " CL");

  if (vin.extra !== null) {
    let extra = JSON.parse(vin.extra);
    $("#extras").toggleClass("hidden show");

    if (extra["bio"] == true) {
      $("#bioTrue").prop("checked", true);
    } else {
      $("#bioFalse").prop("checked", true);
    }

    if (extra["promo"] !== undefined) {
      let promoVin = parseFloat(extra.promo);
      $("#prix").val(
        parseFloat(vin.price) - parseFloat(vin.price) * promoVin + " €"
      );
    } else {
      if (vin.price === "0") {
        $("#prix").text("Info indisponible");
      } else {
        $("#prix").val(vin.price + " €");
      }
    }

    if (vin.capacity === "0") {
      $("#capacite").val("Info indisponible");
    }
  } else {
    document.getElementById("extras").className = "hide";
    if (vin.price === "0") {
      $("#prix").val("Info indisponible");
    } else {
      $("#prix").val(vin.price + " €");
    }

    if (vin.capacity === "0") {
      $("#capacite").val("Info indisponible");
    }
  }

  if (vin.color === "") {
    $("#couleur").val("Info indisponible");
  } else if (vin.capacity === "0") {
    $("#capacite").val("Info indisponible");
  }

  showComments();
  checkLiked();
  fetchNbLikes(vin.id);
  fetchComments(vin.id);
  getPics();
}

// Modifie l'apparence du bouton Like si l'user a déjà aimé ce vin
function checkLiked() {
  if (sessionStorage.length) {
    // Checks if user has already liked the wine
    if (arrLikedWines.indexOf($("#idVin").val()) !== -1) {
      $("#likeButton").attr("class", "btn btn-success");
      $("#iconLike").text(" Liked !");
    } else {
      $("#iconLike").text(" Like Wine");
      $("#likeButton").attr("class", "btn btn-danger");
    }
  }
}

/**
 * Récupère le nombre de Like d'un vin
 * Affiche ce nombre dans le bouton nbLike
 * @param {number} idVin L'id du vin
 */
function fetchNbLikes(idVin) {
  fetch(url + "/" + idVin + "/likes-count")
    .then((res) => res.json())
    .then((data) => {
      if (data.total <= 1) {
        $("#nbLike").text(" " + data.total + " Like");
      } else {
        $("#nbLike").text(" " + data.total + " Likes");
      }
    });
}

/**
 * Récupère les commentaires du vin en appelant l'API Caviste
 * Affiche ces commentaires dans le le div tabs
 * Ajoute des boutons à chaque commentaire pour modifier et/ou supprimer ce commentaire
 * @param {number} idVin L'id du vin
 */
function fetchComments(idVin) {
  let arrComment = [];

  let request = new XMLHttpRequest();
  request.open(
    "GET",
    "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/" +
      idVin +
      "/comments",
    true
  );

  request.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let reply = JSON.parse(this.response);
      reply.forEach((comment) => {
        arrComment.push(comment);
      });

      let str = "";

      for (let i = 0; i < arrComment.length; i++) {
        str +=
          "<div class='containerComment'><strong>User " +
          arrComment[i]["user_id"] +
          "</strong><br><p>Commentaire: " +
          arrComment[i].content +
          "</p><i id ='iconEdit' class='far fa-edit' onclick='modifyComment(" +
          arrComment[i]["id"] +
          "," +
          arrComment[i]["wine_id"] +
          ")'></i><i id='iconDlt' class='far fa-trash-alt' onclick='deleteComment(" +
          arrComment[i]["id"] +
          "," +
          arrComment[i]["wine_id"] +
          ")'></i><br></div>";
      }

      $("#tabs").css("display", "block");

      if (str == []) {
        $("#comments").css("height", "100px");
        $("#comments").text("Pas de commentaires pour ce vin");
      } else {
        $("#comments").css("height", "200px");
        document.getElementById("comments").innerHTML = str;
      }
    }
  };

  request.onerror = function () {
    alert("Une erreur est survenue durant la communication avec l'API !");
  };

  request.send();
}

$("#iconAdd").click(function () {
  if (
    sessionStorage["username"] !== undefined &&
    sessionStorage["pwd"] !== undefined
  ) {
    let addComment = prompt("Entrez un commentaire !");

    if (addComment === null) {
      return; // Arrête l'execution si l'user n'a rien écrit
    }

    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("pwd");
    let btoaHash = btoa(username + ":" + password);

    let idWine = $("#idVin").val();
    let toSend = { content: addComment };
    toSend = JSON.stringify(toSend);

    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      if (this.status === 200) {
        console.log("ok");
        fetchComments(idWine);
      } else {
        console.log(this.responseText);
      }
    };

    xhr.open("POST", url + "/" + idWine + "/comments", true);

    xhr.setRequestHeader("Authorization", "Basic " + btoaHash);
    xhr.send(toSend);
  } else {
    alert("Veuillez vous identifier !");
  }
});

/**
 * Modifie un commentaire
 * L'user doit être authentifié pour modifier le commentaire
 * @param {number} idComment L'id du commentaire
 * @param {number} idWine L'id du vin
 */
function modifyComment(idComment, idWine) {
  if (
    sessionStorage["username"] !== undefined &&
    sessionStorage["pwd"] !== undefined
  ) {
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("pwd");
    let btoaHash = btoa(username + ":" + password);

    let modifiedComment = prompt("Entrez un nouveau commentaire");

    let toSend = { content: modifiedComment };
    toSend = JSON.stringify(toSend);

    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      fetchComments(idWine);
    };

    xhr.open("PUT", url + "/" + idWine + "/comments/" + idComment, true);
    xhr.setRequestHeader("Authorization", "Basic " + btoaHash);

    xhr.send(toSend);
  } else {
    alert("Veuillez vous identifier !");
  }
}

/**
 * Supprime un commentaire
 * L'user doit être authentifié pour supprimer le commentaire
 * @param {number} idComment L'id du commentaire
 * @param {number} idWine L'id du vin
 */
function deleteComment(idComment, idWine) {
  if (
    sessionStorage["username"] !== undefined &&
    sessionStorage["pwd"] !== undefined
  ) {
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("pwd");
    let btoaHash = btoa(username + ":" + password);

    let deleteConfirm = confirm(
      "Voulez-vous vraiment supprimer ce commentaire ?"
    );
    if (deleteConfirm) {
      $.ajax({
        url: url + "/" + idWine + "/comments/" + idComment,
        type: "DELETE",
        contentType: "application/json",
        async: true,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoaHash);
        },
        success: function () {
          fetchComments(idWine);
        },
        error: (e) => console.log(e),
      });
    }
  } else {
    alert("Veuillez vous identifier !");
  }
}

/**
 * Affiche les vins favoris de l'utilisateur
 */
function showFavedWines() {
  let arrFavourite = [];
  if (sessionStorage.length) {
    let requestFav = new XMLHttpRequest();
    requestFav.open("GET", "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/users/1/likes/wines", true);

    requestFav.onload = function () {
      if (this.readyState == 4 && this.status == 200) {
        let replyFav = JSON.parse(this.response);

        replyFav.forEach((vinFav) => {
          arrFavourite.push(vinFav);
        });

        let strFav =
          "<table class='table'><thead><tr><th scope='col'>Nom</th><th scope='col'>Pays</th><th scope='col'>Région</th></tr></thead><tbody>";
        for (let i = 0; i < arrFavourite.length; i++) {
          strFav +=
            "<tr>" +
            "<td>" +
            arrFavourite[i].name +
            "</td>" +
            "<td>" +
            arrFavourite[i].country +
            "<td>" +
            arrFavourite[i].region +
            "</td></tr>";
        }
        strFav += "</tbody></table>";
        document.getElementById("favourite").innerHTML = strFav;
      }
    };
    requestFav.onerror = function () {
      alert("Une erreur est survenue durant la communication avec l'API !");
    };
    requestFav.send();
  } else {
    let strFav = "<span id='mustLogIn'>Veuillez vous connecter pour consulter vos vins pr&eacute;f&eacute;r&eacute;s</span>";
    document.getElementById("favourite").innerHTML = strFav;
  }
}

/**
 * Fonction like d'un vin
 * Elle ajoutera le vin aimé parmis les vins favoris de l'utilisateur
 * Si l'utilisateur reclique sur le bouton, le vin sera enlevé de ses favoris
 * L'utilisateur doit être identifié pour aimer un vin 
 */
$("#likeButton").click(function () {
  if (
    sessionStorage["username"] !== undefined &&
    sessionStorage["pwd"] !== undefined
  ) {
    if (wineClicked) {
      let username = sessionStorage.getItem("username");
      let password = sessionStorage.getItem("pwd");
      let btoaHash = btoa(username + ":" + password);
      let wineId = $("#idVin").val();
      let liked = false;

      if (!arrLikedWines.includes(wineId)) {
        liked = true;
      }

      let toSend = { like: liked };
      toSend = JSON.stringify(toSend);

      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        if (this.status === 200) {
          if (liked) {
            arrLikedWines.push(wineId);
            $("#likeButton").attr("class", "btn btn-success");
            $("#iconLike").text(" Liked !");
          } else {
            let idx = arrLikedWines.indexOf(wineId);
            arrLikedWines.splice(idx, 1);
            $("#iconLike").text(" Like Wine");
            $("#likeButton").attr("class", "btn btn-danger");
          }
          fetchNbLikes(wineId);
        } else {
          alert(xhr.responseText);
        }
      };

      xhr.open("PUT", url + "/" + wineId + "/like", true);
      xhr.setRequestHeader("Authorization", "Basic " + btoaHash);
      xhr.send(toSend);
    } else {
      alert("Choisissez un vin avant de l'aimer !");
    }
  } else {
    alert("Veuillez vous identifier pour aimer ce vin !");
  }
});

/**
 * Remplis le select selectCountries avec les pays référencés par l'API Caviste
 */ 
let selectCountries = $("#selectCountries");
selectCountries.empty();
selectCountries.append('<option selected="true" disabled>Pays</option>');
selectCountries.prop("selectedIndex", 0);

let countryUrl = "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/countries";

$.getJSON(countryUrl, function (data) {
  $.each(data, function (key, info) {
    selectCountries.append(
      $("<option></option>").attr("value", key).text(info["country"])
    );
  });
});

/**
 * Filtrage de vins en fonction des choix de l'utilisateur
 * L'utilisateur choisit un pays et un option de tri
 * Les vins affichés seront ceux qui répondent à ces critères
 * 
 */
$("#filtrer").click(function () {
  event.preventDefault();
  showReset = true;
  let arrReply = [];
  let pays = $("#selectCountries option:selected").text();
  let sortMethod = $("#selectMethods option:selected").text().toLowerCase();

  let xmlReq = new XMLHttpRequest();
  
  xmlReq.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let reply = JSON.parse(this.response);

      for (data in reply) {
        arrReply.push(reply[data]);
      }

      if (sortMethod === "year") {
        arrReply.sort((a, b) => a.year - b.year);
      } else if (sortMethod === "name") {
        arrReply.sort(function (a, b) {
          return a["name"] > b["name"] ? 1 : a["name"] < b["name"] ? -1 : 0;
        });
      } else if (sortMethod === "grapes") {
        arrReply.sort(function (a, b) {
          return a["grapes"] > b["grapes"] ? 1 : a["grapes"] < b["grapes"] ? -1 : 0;
        });
      }
      showListWine(arrReply);
    }
  };

  xmlReq.onerror = function () {
    alert("Une erreur est survenue durant la communication avec l'API !");
  };

  xmlReq.open("GET", url + "?key=country&val=" + pays + "&sort=" + sortMethod, true);
  xmlReq.send();
});

$(document).ready(function () {

    /**
     * Filtrage dynamique de la liste des vins
     * Le filtrage s'effectue automatiquement lors de la présence d'un caractère dans la zone strSearch
     * Le filtrage ne s'effectue qu'avec des lettres et ne filtre que les noms qui correspondent à la chaine de caractères.
     * Un icone s'affiche pour réinitialiser la zone de saisie s'il y a au moins 1 caractère de présent dans la zone strSearch
     */
    $("#strSearch").keyup(function () {
    let searchValue = $(this).val().toLowerCase();

    $("#liste li").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
    });

    if ($(this).val().length < 1) {
        $("#resetList").fadeOut(150, function () {
        $("#resetList").hide();
        });
    } else {
        $("#resetList").fadeIn(150, function () {
        $("#resetList").show();
        });
    }
    });

  showFavedWines();
});

if ($("#strSearch").val().length === 0) {
  $("#resetList").fadeOut(150, function () {
    $("#resetList").hide();
  });
}

/**
 * Réinitialise la zone strSearch lors d'un click sur l'icone (X)
 */
$("#resetList").click(function () {
  showReset = false;
  resetSearch();
  showListWine(vinData);
  $(this).fadeOut(150, function () {
    $(this).css("display", "none");
  });
});

// Appel de la fonction searchWine lors d'un click sur le bouton Rechercher
$("#recherche").click(searchWine);

function searchWine() {
  /**
   * La fonction récupère l'input de l'utilisateur dans la zone strSearch
   * Si l'input est un nombre, la fonction communiquera avec l'API pour rechercher le vin ayant ce nombre comme ID
   * Si l'input est une chaîne de caractère, la fonction cherchera la region correspondante à l'input
   */
  let queryArr = [];
  showReset = true;
  let strSearch = $("#strSearch").val().trim();

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

      request.onerror = function () {
        alert("Une erreur est survenue durant la communication avec l'API !");
      };

      request.send();
    } else {
      if (typeof strSearch === "string") {
        strSearch = ucFirst(strSearch);
        let arrRegions = [];
        let arrFound = [];

        vinData.forEach((vin) => {
          if (!arrRegions.includes(vin["region"])) {
            arrRegions.push(vin["region"]);
          }
        });

        if ($.inArray(strSearch, arrRegions) !== -1) {
          vinData.forEach((vin) => {
            if (vin.region == ucFirst(strSearch)) {
              arrFound.push(vin);
            }
          });
          showListWine(arrFound);
        }
      }
    }
  } else {
    alert("Veuillez écrire quelque chose dans la zone de recherche !");
  }
}

/**
 * Tableau hardcoded des utilisateurs
 * Aucune requête de disponible pour récupérer les infos des utilisateurs présents dans l'API Caviste
 */
let hardCodedUsers = [
  {
    username: "nathan",
    id: 24,
  },
  {
    username: "radad",
    id: 3,
  },
  {
    username: "ced",
    id: 1,
  },
];

$("#btnLogIn").click(logIn);

// Appel de la fonction logIn lorsque la touche enter est activée
$("#frmSignUp").keypress(function (event) {
  // key 13 = key Enter
  if (event.which == "13") {
    logIn();
  }
});

/**
 * Fonction logIn
 * Vérifie si les données entrées dans le formulaire de connexion correspondent aux users hardcodés dans le tableau hardCodedUsers
 * 
 */
function logIn() {
  if (!sessionStorage.length) {
    if ($("#login").val() !== "" && $("#mdp").val() !== "") {
      if (
        hardCodedUsers.find((element) => element.username == $("#login").val()) !== undefined) {
        sessionStorage.setItem("username", $("#login").val());
        sessionStorage.setItem("pwd", $("#mdp").val());

        // Ferme le formulaire logIn & affiche l'icone signOut
        $("#frmBack").css("display", "none");
        $("#iconLogin").css("display", "none");
        $("#iconSignOut").css("display", "block");

        userLikes(); // Retrieves liked wines from user
        showFavedWines(); 
      } else {
        alert("Utilisateur inconnu !");
      }
    } else {
      alert("Les identifiants ne peuvent pas être vides !");
    }
  } else {
    alert("Vous êtes déjà connecté(e) !");
  }
}

$("#iconSignOut").click(signOut);


/**
 * Déconnecte l'utilisateur 
 * Supprime ses identifiants dans sessionStorage
 */
function signOut() {
  //If session exists
  if (sessionStorage.length) {
    sessionStorage.clear();

    $("#iconLogin").css("display", "block");
    $("#iconSignOut").css("display", "none");

    alert("Vous vous êtes bien déconnecté(e).");

    resetBtnLike();
    showFavedWines();
  } else {
    alert("Vous êtes déjà déconnecté(e) !");
  }
}

function resetBtnLike() {
  $("#iconLike").text(" Like Wine");
  $("#likeButton").attr("class", "btn btn-danger");
}

function userLikes() {
  let userId = 0;

  let urlLike =
    "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/users";

  for (let i = 0; i < hardCodedUsers.length; i++) {
    if (hardCodedUsers[i].username === sessionStorage["username"]) {
      userId = hardCodedUsers[i].id;
    }
  }

  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    if (this.status === 200) {
      let data = this.responseText;

      data = JSON.parse(data);

      data.forEach((vin) => {
        arrLikedWines.push(vin.id);
      });
    } else {
      alert(xhr.responseText);
    }
  };

  xhr.open("GET", urlLike + "/" + userId + "/likes/wines", true);
  xhr.send();
}

/* Chart JS*/
/* Hide les div des charts */
$("#mainPays").hide();
$("#mainRaisins").hide();

// Afficher les deux chart (Pays et Raisins) après un click sur le btn "Statistiques"
$("#divStat").click(function () {
  /* Chart pays */
  $("#mainPays").animate({}, 5000, function () {
    $("#mainPays").show();
    $("#closePays").show();
  });

  const cadre = document.querySelector("#cadrePays");
  const ctx = cadre.getContext("2d");
  Chart.defaults.global.defaultFontColor = "black";

  // Crée un array contenant tous les pays des vins
  let arrCountry = [];
  vinData.forEach((vin) => {
    if (!arrCountry.includes(vin["country"])) {
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
    for (let vin of liste) {
      if (vin.country == country) {
        cpt++;
      }
    }
    return cpt;
  }

  const myData = {
    labels: arrCountry,
    data: arrNb,
  };

  let myChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: myData.labels,
      datasets: [
        {
          label: "Nombre de vins",
          data: myData.data,
          backgroundColor: [
            // Pick colors
            "rgba(244, 67, 54, 0.4)",
            "rgba(102, 187, 106, 0.4)",
            "rgba(255, 167, 38, 0.4)",
            "rgba(3, 169, 244,0.4)",
            "rgba(244, 143, 177, 0.4)",
          ],
          borderColor: [
            // Pick colors
            "rgb(244, 67, 54)",
            "rgb(139, 195, 74)",
            "rgb(255, 167, 38)",
            "rgb(3, 169, 244)",
            "rgb(244, 143, 177)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: true,
        text: "Nombre des vins par pays",
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        padding: 10,
        fontSize: 20,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    },
  });

  // Bouton Close Graph Pays
  $("#closePays").click(function () {
    $("#mainPays").css("display", "none");
  });

  /* Chart Raisins */
  $("#mainRaisins").animate({}, 5000, function () {
    $("#mainRaisins").show();
  });

  const cadreRaisins = document.querySelector("#cadreRaisins");
  const ctxRaisins = cadreRaisins.getContext("2d");
  Chart.defaults.global.defaultFontColor = "black";

  // Crée un array contenant tous les raisins des vins
  let arrGrapes = [];
  vinData.forEach((vin) => {
    if (!arrGrapes.includes(vin["grapes"])) {
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
    for (let vin of liste) {
      if (vin.grapes == grapes) {
        cptR++;
      }
    }
    return cptR;
  }

  const myDataR = {
    labels: arrGrapes,
    data: arrNbR,
  };
  let myChartR = new Chart(ctxRaisins, {
    type: "pie",
    data: {
      labels: myDataR.labels,
      datasets: [
        {
          label: "Nombre de raisins",
          data: myDataR.data,
          backgroundColor: [
            // Pick colors
            "rgba(244, 67, 54, 0.4)",
            "rgba(102, 187, 106, 0.4)",
            "rgba(255, 167, 38, 0.4)",
            "rgba(3, 169, 244,0.4)",
            "rgba(244, 143, 177, 0.4)",
            "rgba(51, 70, 255, 0.4)",
            "rgba(255, 51, 51, 0.4)",
            "rgba(255, 212, 51, 0.4)",
            "rgba(51, 255, 255 , 0.4)",
          ],
          borderColor: [
            // Pick colors
            "rgb(244, 67, 54)",
            "rgb(139, 195, 74)",
            "rgb(255, 167, 38)",
            "rgb(3, 169, 244)",
            "rgb(244, 143, 177)",
            "rgb(51, 70, 255)",
            "rgb(255, 51, 51)",
            "rgb(255, 212, 51)",
            "rgb(51, 255, 255 )",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: true,
        text: "Nombre de vins par raisins",
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        padding: 10,
        fontSize: 20,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    },
  });

  // Bouton Close Graph Pays
  $("#closeRaisins").click(function () {
    $("#mainRaisins").css("display", "none");
  });
});

// Bouton scrollToTop
let mybutton = document.getElementById("btnScroll");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

if ($(window).width() === 768 || $(window).width() === 834) {
  $("#message").css("display", "block");
  $("#closeMessage").click(function () {
    $("#message").css("display", "none");
  });
}

//fonction popper
const search = document.querySelector("#strSearch");
const searchMessage = document.querySelector("#tooltip");

const graph = document.querySelector("#ChartGraph");
const graphMessage = document.querySelector("#tooltipChart");

const btnSearch = document.querySelector("#recherche");
const btnSearchTooltip = document.querySelector("#btnSearchTooltip");

const selectPays = document.querySelector("#selectCountries");
const paysTooltip = document.querySelector("#paysTooltip");

const selectTri = document.querySelector("#selectMethods");
const triTooltip = document.querySelector("#sortTooltip");

$("#strSearch").mouseenter(showPopper(search, searchMessage, "top"));
$("#recherche").mouseenter(showPopper(btnSearch, btnSearchTooltip, "top"));
$("#selectCountries").mouseenter(showPopper(selectPays, paysTooltip, "top"));
$("#selectMethods").mouseenter(showPopper(selectTri, triTooltip, "top"));
$("#ChartGraph").mouseenter(showPopper(graph, graphMessage, "right"));

let popperInstance = null;

function showPopper(selector, message, position) {
  function create() {
    popperInstance = Popper.createPopper(selector, message, {
      modifiers: [
        {
          name: "offset",
          options: {
            offset: [0, 8],
          },
        },
      ],
      placement: position,
    });
  }

  function destroy() {
    if (popperInstance) {
      popperInstance.destroy();
      popperInstance = null;
    }
  }

  function show() {
    message.setAttribute("data-show", "");
    create();
  }

  function hide() {
    message.removeAttribute("data-show");
    destroy();
  }

  const showEvents = ["mouseenter", "focus"];
  const hideEvents = ["mouseleave", "blur"];

  showEvents.forEach((event) => {
    selector.addEventListener(event, show);
  });

  hideEvents.forEach((event) => {
    selector.addEventListener(event, hide);
  });
}

//Style du nav
let tabComment = $("#tabComments");
let tabDescription = $("#tabDescription");
let tabFavourite = $("#tabFavourite");

function showComments() {
  document.getElementById("tabComments").className = "nav-link active";
  document.getElementById("tabFavourite").className = "nav-link";
  $("#comments").css("display", "block");
  $("#favourite").css("display", "none");
  $("#iconAdd").css("display", "block");
}

function showFavourite() {
  document.getElementById("tabComments").className = "nav-link";
  document.getElementById("tabFavourite").className = "nav-link active";
  $("#favourite").css("display", "block");
  $("#comments").css("display", "none");
  $("#iconAdd").css("display", "none");
}

tabComment.click(function () {
  showComments();
});

tabFavourite.click(function () {
  showFavourite();
});

$("#iconLogin").click(function () {
  $("#frmBack").css("display", "block");
  $("#iconLogin").css("display", "none");
});
$("#btnClose").click(function () {
  $("#frmBack").css("display", "none");
  $("#iconLogin").css("display", "block");
});

let inpFile = document.getElementById("inpFile");
inpFile.addEventListener("change", function () {
  let lblFile = document.getElementById("lblFile");
  lblFile.innerHTML = inpFile.files[0].name;
});

// img upload
$("#btnUpload").click(function () {
  event.preventDefault();
  let frm = document.forms["FormAfficher"];
  console.log(frm);
  if (
    sessionStorage["username"] !== undefined &&
    sessionStorage["pwd"] !== undefined
  ) {
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("pwd");
    let btoaHash = btoa(username + ":" + password);

    let idWine = document.getElementById("idVin").value;
    const frm = document.forms["frmUpload"];
    const upload = new FormData();

    let pictureSelect = document.getElementById("inpFile");

    let picturesList = pictureSelect.files[0];

    upload.append("userfile", picturesList);
    const xhr = new XMLHttpRequest();

    xhr.onload = function () {
      if (this.status === 200) {
        alert("Upload réussi !");
      } else {
        alert(
          "Vous avez atteint le nombre de photo maximal pour ce vin (max 3 ajouts possibles)"
        );
      }
    };

    xhr.onerror = function () {
      if (this.status === 404) {
        alert("Une erreur est survenue, la photo n'a pu être uploader");
      }
    };

    xhr.open("POST", url + "/" + idWine + "/pictures", true);
    xhr.setRequestHeader("Authorization", "Basic " + btoaHash);
    xhr.send(upload);
  } else {
    alert("Vous devez être identifié(e) !");
  }
});

// img get
function getPics() {
  let urlUploads = "http://cruth.phpnet.org/epfc/caviste/public/uploads/";
  let arrPics = [];
  let id = $("#idVin").val();

  fetch(url + "/" + id + "/pictures", {
    method: "GET",
    headers: new Headers({
      Authorization: "Basic " + btoa("nathan:epfc"),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.length >= 1) {
        data.forEach((pic) => {
          arrPics.push(pic);
        });
        // slick-slide slick-slide slick-current slick-active
            // ensures slick hasn't already been initialized
        if (!$("#carousel").hasClass("slick-initialized slick-slider")) {
        
            if (arrPics.length > 0) {
                for (let i = 0; i < arrPics.length; i++) {
                let img =
                    "<img class='added' src=" +
                    urlUploads +
                    arrPics[i].url +
                    " id=" +
                    arrPics[i].id +
                    ">";
                $(".slickC").append(img);
                }
    
                $(".slickC").slick({
                dots: false,
                arrows: true,
                autoplay: false,
                });
            }
        } else {
            $(".slickC").slick("unslick");
            $(".added").remove();
            
            getPics();
        }
        
      } else {
            if ($("#carousel").hasClass("slick-initialized slick-slider")) {
                $(".slickC").slick("destroy");
                $(".added").remove();
            }
        }
    });
}


// img delete
function deletePic(idPic) {
  if (
    sessionStorage["username"] !== undefined &&
    sessionStorage["pwd"] !== undefined
  ) {
    let username = sessionStorage.getItem("username");
    let password = sessionStorage.getItem("pwd");
    let btoaHash = btoa(username + ":" + password);
    let idVin = $("#idVin").val();
    fetch(url + "/" + idVin + "/pictures/" + idPic, {
      method: "DELETE",
      headers: new Headers({
        Authorization: "Basic " + btoaHash,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success === true) {
          getPics();
        }
      });
  } else {
    alert("Vous devez être identifié(e) !");
  }
}
