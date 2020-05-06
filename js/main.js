// trier par couleur, bio & prix ascendant/descendant
// Wiki
// mit // cc // open-source license
const url = "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines"; // URL de l'API
let showReset = false;
let vinData = [];

// Récuperation des données de l'API
fetch('https://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines')
.then(response => response.json())
.then(function(data) {
  for (let prop in data) {
    vinData.push(data[prop]); // vinData === object!
  }
  showListWine(vinData);
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

//Bouton ajouter -affichage des btn sauvegarder et supprimer
/*
document.getElementById("ajouter").addEventListener("click", function () {
  document.getElementById("supprimer").style.display = "inline-block";
  document.getElementById("sauvegarder").style.display = "inline-block";
});
*/

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
  document.getElementById("description").innerText = vin.description;
  document.getElementById("couleur").value = vin.color;
  document.getElementById("capacite").value = vin.capacity + " CL";
  
  if (vin.extra !== null) {
    let extra = JSON.parse(vin.extra);
    document.getElementById("extras").className = "show";
    if (extra["bio"] == true) {
      document.getElementById("bioTrue").checked = true;
    } else {
      document.getElementById("bioFalse").checked = true;
    }
    
    if (extra["promo"] !== undefined) {
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
    document.getElementById("extras").className = "hide";
  }
  document.getElementById("prix").value = vin.price + " €";
  if (vin.color === "") {
    document.getElementById("couleur").value = "Info indisponible";
  } else if (vin.capacity === "0") {
    document.getElementById("capacite").value = "Info indisponible";
  } else if (vin.price === "0") {
    document.getElementById("prix").value = "Info indisponible";
  }
  /*Affichage des commentaires */
  let arrComment =[];
  let request = new XMLHttpRequest();
  request.open("GET", "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/"+index+"/comments", true);
  request.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let reply = JSON.parse(this.response);
      reply.forEach((comment) => {
        arrComment.push(comment);
      });
      let str = '';
      for (let i = 0; i < arrComment.length; i++) {
        str += "<i><strong>User " + arrComment[i]['user_id'] + "</strong></i><br><p>Commentaire: " + arrComment[i].content + "</p><br>";
      }
      if(str == []){
        $('#comments').css('height','100px');
        document.getElementById('comments').innerText = "Pas de commentaires sur ce vin";
      }else{
       $('#comments').css('height','200px');
       document.getElementById('comments').innerHTML = str;
      }
    }
  };
  request.send();
  showComments();
}

/* Populating selectCountries */
let selectCountries = $('#selectCountries');
selectCountries.empty();
selectCountries.append('<option selected="true" disabled>Pays</option>');
selectCountries.prop('selectedIndex', 0);
let countryUrl = "http://cruth.phpnet.org/epfc/caviste/public/index.php/api/wines/countries";
$.getJSON(countryUrl, function (data) {
  $.each(data, function (key, info) {
    selectCountries.append($('<option></option>').attr('value', key).text(info['country']));
  })
});

function addBtnReset() {
  $('#liste').prepend('<button type="button" id="btnReset" class="btn btn-danger">RESET LISTE</button>');
}

$('#filtrer').click(function() {
  event.preventDefault();

  let arrReply = [];
  let pays = $('#selectCountries option:selected').text();
  let sortMethod = $('#selectMethods option:selected').text().toLowerCase();

  let xmlReq = new XMLHttpRequest();
  xmlReq.open("GET", url + "?key=country&val=" + pays + "&sort=" + sortMethod, true);

  xmlReq.onload = function () {
    if (this.readyState == 4 && this.status == 200) {
      let reply = JSON.parse(this.response);
      for (let prop in reply) {
        arrReply.push(reply[prop]);
      }
      if (sortMethod === "year") {
        arrReply.sort((a,b) => a.year - b.year);
      } else if (sortMethod === "name") {
        arrReply.sort(function(a,b) {
          return a['name'] > b['name'] ? 1 : a['name'] < b['name'] ? -1 : 0;
        });
      } else if (sortMethod === "grapes") {
        console.log("IN");
        console.log(arrReply);
        arrReply.sort(function(a,b) {
        return a['grapes'] > b['grapes'] ? 1 : a['grapes'] < b['grapes'] ? -1 : 0;
        });
      }
      showListWine(arrReply);
      addBtnReset();
    }
  };
  xmlReq.send();
})

document.getElementById("recherche").addEventListener("click", searchWine);

$(document).ready(function () {
  $('#strSearch').keyup(function () {
    let searchValue = $(this).val().toLowerCase();
    $("#liste li").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
    });
    if ($(this).val().length == 0) {
      $('#resetList').hide();
    } else {
      $('#resetList').show();
    }
  })  
});

$('#resetList').click(function () {
  resetSearch();
  showListWine(vinData);
  $(this).css("display", "none");
})

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

/* Afficher les deux chart (Pays et Raisins) aprés un click sur le btn "Statistiques" */
$('#clickMe').click(function () {

  /* Chart pays */
  $('#mainPays').animate({
  }, 5000, function () {
    $('#mainPays').show();
    $('#closePays').show();
  });

  const cadre = document.querySelector("#cadrePays");
  const ctx = cadre.getContext('2d');
  Chart.defaults.global.defaultFontColor = 'black';

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
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: true,
        text: 'Nombre des vins par Pays',
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        padding: 10,
        fontSize: 20,
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
  $('#closePays').click(function () {
    $("#mainPays").css("display", "none");
  });

  /* Chart Raisins */
  $('#mainRaisins').animate({
  }, 5000, function () {
    $('#mainRaisins').show();
  });

  const cadreRaisins = document.querySelector("#cadreRaisins");
  const ctxRaisins = cadreRaisins.getContext('2d');
  Chart.defaults.global.defaultFontColor = 'black';

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
      maintainAspectRatio: false,
      responsive: true,
      title: {
        display: true,
        text: 'Nombre des vins par raisins',
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        padding: 10,
        fontSize: 20,
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
  $('#closeRaisins').click(function () {
    $("#mainRaisins").css("display", "none");
  });
});

// Bouton scrollToTop
var mybutton = document.getElementById("btnScroll");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction()
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

if ($(window).width() === 768) {
  $('#message').css('display', 'block');
  $('#closeMessage').click(function () {
    $('#message').css('display', 'none');
  });
}

//fonction popper

const search = document.querySelector('#strSearch');
const searchMessage = document.querySelector('#tooltip');

const graph = document.querySelector('#ChartGraph');
const graphMessage = document.querySelector('#tooltipChart');


$("#strSearch").mouseenter(showPopper(search, searchMessage, "top"));
$("#ChartGraph").mouseenter(showPopper(graph, graphMessage, "right"));

let popperInstance = null;

function showPopper(selector, message, position) {

  function create() {
    popperInstance = Popper.createPopper(selector, message, {
      modifiers: [
        {
          name: 'offset',
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
    message.setAttribute('data-show', '');
    create();
  }

  function hide() {
    message.removeAttribute('data-show');
    destroy();
  }

  const showEvents = ['mouseenter', 'focus'];
  const hideEvents = ['mouseleave', 'blur'];

  showEvents.forEach(event => {
    selector.addEventListener(event, show);
  });

  hideEvents.forEach(event => {
    selector.addEventListener(event, hide);
  });
}

//bouton like 
//L'user cliquera sur un bouton "Like" qui enverra une valeur booléenne à l'API
//PUT : url/api/wines/id/like
//JSON : { "like" : true|false }

/*
let numberLike = 0;


function number() {
  numberLike ++;
  document.getElementById("likeButton").innerHTML = numberLike;
 
};

function numberOfLikes() {
  let request = new XMLHttpRequest();
  request.open("PUT", url + "/id/like", false);

  request.onload = function () {
    let dataResp = JSON.parse(this.response);
    if (request.status == 200 && request.readyState == 4) {

    } else {
      if (request.status >= 400) {

      }
    }
  }
}
*/
 //Style du nav 
 let tabComment = $('#tabComments');
 let tabNotes = $('#tabNotes');

 function showComments(){
  document.getElementById("tabComments").className = "nav-link active";
  document.getElementById("tabNotes").className = "nav-link";
  $('#notes').css("display","none");
  $('#comments').css("display","block");
 }
 function showNotes(){
  document.getElementById("tabComments").className = "nav-link";
  document.getElementById("tabNotes").className = "nav-link active";
  $('#comments').css("display","none");
  $('#notes').css("display","block");
 }

 tabComment.click(function(){
  showComments();
 });

 tabNotes.click(function(){
  showNotes();
 });
