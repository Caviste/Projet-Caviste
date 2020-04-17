/* LISTE VIN */
/* let arrVins = [
  {
    id: "1",
    name: "CHATEAU DE SAINT COSME",
    year: "2009",
    grapes: "Grenache / Syrah",
    country: "France",
    region: "Southern Rhone / Gigondas",
    description:
      "The aromas of fruit and spice give one a hint of the light drinkability of this lovely wine, which makes an excellent complement to fish dishes.",
    picture: "saint_cosme.jpg",
  },
  {
    id: "2",
    name: "LAN RIOJA CRIANZA",
    year: "2006",
    grapes: "Tempranillo",
    country: "Spain",
    region: "Rioja",
    description:
      "A resurgence of interest in boutique vineyards has opened the door for this excellent foray into the dessert wine market. Light and bouncy, with a hint of black truffle, this wine will not fail to tickle the taste buds.",
    picture: "lan_rioja.jpg",
  },
  {
    id: "3",
    name: "MARGERUM SYBARITE",
    year: "2010",
    grapes: "Sauvignon Blanc",
    country: "USA",
    region: "California Central Cosat",
    description:
      "The cache of a fine Cabernet in ones wine cellar can now be replaced with a childishly playful wine bubbling over with tempting tastes of\nblack cherry and licorice. This is a taste sure to transport you back in time.",
    picture: "margerum.jpg",
  },
  {
    id: "4",
    name: 'OWEN ROE "EX UMBRIS"',
    year: "2009",
    grapes: "Syrah",
    country: "USA",
    region: "Washington",
    description:
      "A one-two punch of black pepper and jalapeno will send your senses reeling, as the orange essence snaps you back to reality. Don't miss\nthis award-winning taste sensation.",
    picture: "ex_umbris.jpg",
  },
  {
    id: "5",
    name: "REX HILL",
    year: "2009",
    grapes: "Pinot Noir",
    country: "USA",
    region: "Oregon",
    description:
      "One cannot doubt that this will be the wine served at the Hollywood award shows, because it has undeniable star power. Be the first to catch\nthe debut that everyone will be talking about tomorrow.",
    picture: "rex_hill.jpg",
  },
  {
    id: "6",
    name: "VITICCIO CLASSICO RISERVA",
    year: "2007",
    grapes: "Sangiovese Merlot",
    country: "Italy",
    region: "Tuscany",
    description:
      "Though soft and rounded in texture, the body of this wine is full and rich and oh-so-appealing. This delivery is even more impressive when one takes note of the tender tannins that leave the taste buds wholly satisfied.",
    picture: "viticcio.jpg",
  },
  {
    id: "7",
    name: "CHATEAU LE DOYENNE",
    year: "2005",
    grapes: "Merlot",
    country: "France",
    region: "Bordeaux",
    description:
      "Though dense and chewy, this wine does not overpower with its finely balanced depth and structure. It is a truly luxurious experience for the\nsenses.",
    picture: "le_doyenne.jpg",
  },
  {
    id: "8",
    name: "DOMAINE DU BOUSCAT",
    year: "2009",
    grapes: "Merlot",
    country: "France",
    region: "Bordeaux",
    description:
      "The light golden color of this wine belies the bright flavor it holds. A true summer wine, it begs for a picnic lunch in a sun-soaked vineyard.",
    picture: "bouscat.jpg",
  },
  {
    id: "9",
    name: "BLOCK NINE",
    year: "2009",
    grapes: "Pinot Noir",
    country: "USA",
    region: "California",
    description:
      "With hints of ginger and spice, this wine makes an excellent complement to light appetizer and dessert fare for a holiday gathering.",
    picture: "block_nine.jpg",
  },
  {
    id: "10",
    name: "DOMAINE SERENE",
    year: "2007",
    grapes: "Pinot Noir",
    country: "USA",
    region: "Oregon",
    description:
      "Though subtle in its complexities, this wine is sure to please a wide range of enthusiasts. Notes of pomegranate will delight as the nutty finish completes the picture of a fine sipping experience.",
    picture: "domaine_serene.jpg",
  },
  {
    id: "11",
    name: "BODEGA LURTON",
    year: "2011",
    grapes: "Pinot Gris",
    country: "Argentina",
    region: "Mendoza",
    description:
      "Solid notes of black currant blended with a light citrus make this wine an easy pour for varied palates.",
    picture: "bodega_lurton.jpg",
  },
  {
    id: "12",
    name: "LES MORIZOTTES",
    year: "2009",
    grapes: "Chardonnay",
    country: "France",
    region: "Burgundy",
    description:
      "Breaking the mold of the classics, this offering will surprise and undoubtedly get tongues wagging with the hints of coffee and tobacco in\nperfect alignment with more traditional notes. Breaking the mold of the classics, this offering will surprise and\nundoubtedly get tongues wagging with the hints of coffee and tobacco in\nperfect alignment with more traditional notes. Sure to please the late-night crowd with the slight jolt of adrenaline it brings.",
    picture: "morizottes.jpg",
  },
]; */

//R�cuperation des infos de l'API
let vinData = [];
let request = new XMLHttpRequest();
let url = "http://cruth.phpnet.org/epfc/caviste/api/wines";

request.open("GET", url, true);
request.onload = function () {
  let data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    data.forEach((vin) => {
      vinData.push(vin);
    });
    // Affichage dynamique de la liste de vin
    let str = "";
    for (let i = 0; i < vinData.length; i++) {
      str += '<li class="list-group-item" id=' + i + " onclick=showDetails(" + i + ")>" + vinData[i].name + "</li>"; //Index = i-1
    }
    document.getElementById("liste").innerHTML = str;
  } else {
    console.log("error");
  }
};
request.send();

function showDetails(index) {
  // Affiche les détails du vin cliqué
  document.getElementById('idVin').value = index + 1; // id 
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
