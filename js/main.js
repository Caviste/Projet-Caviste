// trier par couleur, bio & prix ascendant/descendant
// Wiki
// mit // cc // open-source license
const url = "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines"; // URL de l'API
const restCountriesURL = "https://restcountries.eu/rest/v2/name/"; // URL API RESTCountries
let showReset = false;
let wineClicked = false;
let vinData = [];

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

// Ajoute une majuscule au début de la string
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
  // 13 = keyPress Enter
  if (event.which == "13") {
    event.preventDefault();
  }
});

// Affichage de la liste de vin
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

  // Affiche un bouton de Reset
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
    document.getElementById("liste").getElementsByTagName("li")[i].addEventListener("click", function () {
        showDetails(arr[i].id);
    });
  }
}

// Affiche les détails du vin cliqué
function showDetails(index) {
    $('#isLiked').attr('value', "true");
    let vin = vinData.find((element) => element.id == index);
    wineClicked = true;
    $("#idVin").val(vin.id);
    $("#nomVin").val(vin.name);
    $("#raisins").val(vin.grapes);
    $("#pays").val(vin.country);
    $("#region").val(vin.region);
    $("#year").val(vin.year);
    $("#image").attr("src", "http://cruth.phpnet.org/epfc/caviste/public/pics/" + vin.picture);
    $("#hiddenWineId").val(vin.id);

    //Use RESTCOUNTRIES API;
    let codeCountry;
    fetch(restCountriesURL + vin.country)
        .then(function (res) {
        return res.json();
        })
        .then((data) => initialize(data))
        .catch((error) => console.log("Erreur: ", error));

    function initialize(countriesData) {
        let countries = countriesData;
        codeCountry = countries[0].alpha2Code;
        $("#countryFlagsImg").attr(
        "src",
        "https://www.countryflags.io/" + codeCountry + "/flat/32.png"
        );
        $("#countryFlagsImg").css("display", "block");
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

    /*Affichage des commentaires */
    let arrComment = [];

    let request = new XMLHttpRequest();
    request.open("GET", "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/" + index + "/comments", true);

    request.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
        let reply = JSON.parse(this.response);
        reply.forEach((comment) => {
            arrComment.push(comment);
        });
        let str = "";

        for (let i = 0; i < arrComment.length; i++) {
            str += "<div class='containerComment'><strong>User " +
            arrComment[i]["user_id"] +
            "</strong><br><p>Commentaire: " +
            arrComment[i].content +
            "</p><i id ='iconEdit' class='far fa-edit' onclick='modifyComment(" + arrComment[i]['id'] + "," + arrComment[i]['wine_id'] + ")'></i><i id='iconDlt' class='far fa-trash-alt' onclick='deleteComment(" + arrComment[i]['id'] + "," + arrComment[i]['wine_id'] + ")'></i><br></div>";
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
    showComments();
    fetchNbLikes(vin.id);
}

function fetchNbLikes(idVin) {
    fetch(url + '/' + idVin + '/likes-count')
    .then(res => res.json())
    .then(data => {
        if (data.total <= 1) {
            $('#nbLike').text(' ' + data.total + ' Like');
        } else {
            $('#nbLike').text(' ' + data.total + ' Likes');
        }
    });
}

function modifyComment(idComment, idWine) {
    let newComment = prompt('Entrez un nouveau commentaire');
    alert(newComment);
    let data = { "content" : newComment}
    $.ajax({
        url: url + idWine + "/comments/" + idComment,
        type: "PUT",
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: "json",
        async: true,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa('ced:123'));
        },
        success: function (msg) {
            console.log(msg);
        },
        error: (e) => console.log(e),
    });
}

function deleteComment(idComment, idWine) {	
    let deleteConfirm = confirm('Voulez-vous vraiment supprimer ce commentaire ?');
    if (deleteConfirm) {
        $.ajax({
            url: url + idWine + "/comments/" + idComment,
            type: "DELETE",
            contentType: 'application/json',
            async: true,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa('ced:123'));
            },
            success: function (msg) {
                console.log(msg);
            },
            error: (e) => console.log(e),
        });
    }
}
    
/*Affichage des vins préférés */
let arrFavourite =[];
let requestFav = new XMLHttpRequest();
requestFav.open("GET", "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/users/1/likes/wines", true);
requestFav.onload = function(){
    if(this.readyState == 4 && this.status == 200){
        let replyFav = JSON.parse(this.response);
        replyFav.forEach((vinFav)=> {
            arrFavourite.push(vinFav);
        });
        let strFav = "<table class='table'><thead><tr><th scope='col'>Nom</th><th scope='col'>Pays</th><th scope='col'>Région</th></tr></thead><tbody>";
        for (let i = 0; i < arrFavourite.length; i++) {
            strFav +="<tr>"+"<td>"+arrFavourite[i].name+"</td>"+"<td>"+arrFavourite[i].country+"<td>"+arrFavourite[i].region+"</td></tr>";
        }
        strFav+="</tbody></table>";
            document.getElementById("favourite").innerHTML = strFav;
    }
};
requestFav.onerror = function () {
    alert("Une erreur est survenue durant la communication avec l'API !");
};
requestFav.send();

$('#iconAdd').click(function() {
    let addComment = prompt('Entrez un commentaire !');
    let idWine = $('#idVin').val();
    let data = { 
        "content" : addComment, 
    };
    /* POST	/api/wines/10/comments
    { "content" : "some content" } */
    $.ajax({
        url: url + '/' + idWine + '/comments',
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        async: true,
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa('ced:123'));
        },
        success: function(msg) {
            console.log(msg);
        },
        error: (e) => console.log(e),
    });
});

//TODO: Bouton like
// TODO: Bug -> button turns back to red when coming back to the same wine
//L'user cliquera sur un bouton "Like" qui enverra une valeur booléenne à l'API
//PUT : url/api/wines/id/like
//JSON : { "like" : true|false }
/* function isWineLiked(bool) {
    if (bool) {
        $("#likeButton").attr("class", "btn btn-success");
        $("#iconLike").text(" Liked !");
    } else {
        $("#iconLike").text(" Like Wine");
        $("#likeButton").attr("class", "btn btn-danger");
    }
    }

$("#likeButton").click(function () {
    if (wineClicked) {
        isLiked = !isLiked;
        isWineLiked(isLiked);
        let data = { like: isLiked };
        let wineId = $("#hiddenWineId").val();

        $.ajax({
            url: url + "/" + wineId + "/like",
            type: "PUT",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true,
            success: function (msg) {
            console.log(msg);
            },
            error: (e) => console.log(e),
        });
    } else {
      alert("Choisissez un vin avant de l'aimer !");
    }
  }); */


/* Populating selectCountries */
let selectCountries = $("#selectCountries");
selectCountries.empty();
selectCountries.append('<option selected="true" disabled>Pays</option>');
selectCountries.prop("selectedIndex", 0);

let countryUrl =
  "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/countries";
$.getJSON(countryUrl, function (data) {
  $.each(data, function (key, info) {
    selectCountries.append(
      $("<option></option>").attr("value", key).text(info["country"])
    );
  });
});

// Clic sur le bouton filtrer => tri de la liste de vin suivant des options de tri
// GET : url + /api/wines?key=country&val=France&sort=year
$("#filtrer").click(function () {
  event.preventDefault();
  showReset = true;
  let arrReply = [];
  let pays = $("#selectCountries option:selected").text();
  let sortMethod = $("#selectMethods option:selected").text().toLowerCase();

  let xmlReq = new XMLHttpRequest();
  xmlReq.open(
    "GET", url + "?key=country&val=" + pays + "&sort=" + sortMethod, true
  );

  xmlReq.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let reply = JSON.parse(this.response);
      for (let prop in reply) {
        arrReply.push(reply[prop]);
      }
      console.log(arrReply);
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
  xmlReq.send();
});

$("#recherche").click(searchWine);

$(document).ready(function () {
  $("#strSearch").keyup(function () {
    let searchValue = $(this).val().toLowerCase();

    $("#liste li").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
    });

    if ($(this).val().length == 0) {
      $("#resetList").fadeOut(150, function () {
        $("#resetList").hide();
      });
    } else {
      $("#resetList").fadeIn(150, function () {
        $("#resetList").show();
      });
    }
  });
});

if ($("#strSearch").val().length === 0) {
  $("#resetList").fadeOut(150, function () {
    $("#resetList").hide();
  });
}

$("#resetList").click(function () {
  showReset = false;
  resetSearch();
  showListWine(vinData);
  $(this).fadeOut(150, function () {
    $(this).css("display", "none");
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
        let arrRegions = [];
        let arrGrapes = [];

        vinData.forEach((vin) => {
          if (!arrRegions.includes(vin["region"])) {
            arrRegions.push(vin["region"]);
          }
        });

        vinData.forEach((vin) => {
          if (!arrGrapes.includes(vin["grapes"])) {
            arrGrapes.push(vin["grapes"]);
          }
        });
        console.log(arrGrapes);
        no;
        if ($.inArray(ucFirst(strSearch), arrRegions) !== -1) {
          fetch(url + "/regions/" + strSearch)
            .then((resp) => resp.json())
            .then(function (data) {
              data.forEach((vin) => {
                queryArr.push(vin);
              });
              showListWine(queryArr);
            })
            .catch((error) => {
              console.error("Erreur: ", error);
            });
        } else if (arrGrapes.indexOf(strSearch) !== -1) {
          //TODO: Bug when searching for Pinot (single word instead of full grape name)
          fetch(url + "/grapes/" + strSearch)
            .then((resp) => resp.json())
            .then(function (data) {
              data.forEach((vin) => {
                queryArr.push(vin);
              });
              showListWine(queryArr);
            })
            .catch((error) => {
              console.log("Erreur: ", error);
            });
        }
      }
    }
  } else {
    alert("Veuillez écrire quelque chose dans la zone de recherche !");
  }
}

$("#btnLogIn").click(logIn);

function logIn() {
  let request = new XMLHttpRequest();
  request.open(
    "GET",
    "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/users/",
    true
  );

  //format des données envoyées
  request.setRequestHeader("Content-Type", "application/json");

  //definir les identifiants
  let data = btoa("ced:123");
  let user = "Basic " + data;

  request.setRequestHeader("Authorization", user);

  request.onload = function () {
    console.log(this.responseText);
  };
  request.send();
}

/* Chart JS*/
/* Hide les div des charts */
$("#mainPays").hide();
$("#mainRaisins").hide();

/* Afficher les deux chart (Pays et Raisins) aprés un click sur le btn "Statistiques" */
$("#clickMe").click(function () {
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
        text: "Nombre des vins par Pays",
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
            "rgb(244, 143, 177)", //
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
        text: "Nombre des vins par raisins",
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
let tabComment = $('#tabComments');
let tabDescription = $('#tabDescription');
let tabFavourite = $('#tabFavourite');

function showComments() {
    document.getElementById("tabComments").className = "nav-link active";
    document.getElementById("tabFavourite").className = "nav-link";
    $('#comments').css("display", "block");
    $('#favourite').css("display", "none");
    $('#iconAdd').css("display","block");
}


function showFavourite() {
    document.getElementById("tabFavourite").className = "nav-link active";
    document.getElementById("tabComments").className = "nav-link";
    $('#favourite').css("display", "block");
    $('#comments').css("display", "none");
    $('#iconAdd').css("display","none");
}

tabComment.click(function () {
  showComments();
});

tabFavourite.click(function() {
    showFavourite();
});
