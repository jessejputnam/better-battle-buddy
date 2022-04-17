"use strict";

// ###################################################
//* ### DOM Variables
// ###################################################
const btnCalcData = document.querySelector("#calc-dmg");
const btnSearch = document.querySelector(".search__btn");

const form = document.querySelector(".search__form");
const inputSearch = document.querySelector(".search__input");

const errContainer = document.querySelector(".err__container");
const errMsg = document.querySelector(".err__msg");
const btnErr = document.querySelector("#err-ok");

// Result Pokemon
const pokemonImg = document.querySelector("#poke-img");
const pokemonName = document.querySelector("#poke-name");
const pokemonType = document.querySelector("#poke-type");
const pokemonWeakness = document.querySelector("#poke-weak");
const pokemonResistance = document.querySelector("#poke-resist");

// Suggested Pokemon
const btnSuggest = document.querySelector("#btn-suggest");

const suggestedPokemonImg1 = document.querySelector("#sugg-img-1");
const suggestedPokemonName1 = document.querySelector("#sugg-name-1");
const suggestedPokemonImg2 = document.querySelector("#sugg-img-2");
const suggestedPokemonName2 = document.querySelector("#sugg-name-2");
const suggestedPokemonImg3 = document.querySelector("#sugg-img-3");
const suggestedPokemonName3 = document.querySelector("#sugg-name-3");
const suggestedPokemonImg4 = document.querySelector("#sugg-img-4");
const suggestedPokemonName4 = document.querySelector("#sugg-name-4");

// ###################################################
//* ### Data Logic
// ###################################################
const getNewSearch = function () {
  getPokemonData(inputSearch.value);
  setTimeout(() => {
    displayPokemon();
  }, 1000);
};

const resetData = () => (curSelection = {});

const resetDisplay = function () {
  pokemonImg.src = "./images/question.png";
  pokemonName.textContent = "Name";
  pokemonType.textContent = "Type";
  pokemonWeakness.textContent = "";
  pokemonResistance.textContent = "";

  suggestedPokemonImg1.src = "./images/question.png";
  suggestedPokemonImg2.src = "./images/question.png";
  suggestedPokemonImg3.src = "./images/question.png";
  suggestedPokemonImg4.src = "./images/question.png";

  suggestedPokemonName1.textContent = "";
  suggestedPokemonName2.textContent = "";
  suggestedPokemonName3.textContent = "";
  suggestedPokemonName4.textContent = "";
};

const calcTypeDmg = function (pokeObj, type, dmg) {
  if (Object.keys(pokeObj.typeDmg).includes(type.name))
    pokeObj.typeDmg[type.name] *= typeRules[dmg];
  if (!Object.keys(pokeObj.typeDmg).includes(type.name))
    pokeObj.typeDmg[type.name] = typeRules[dmg];
  return pokeObj;
};

const sortTypeDmg = function () {
  try {
    if (!curSelection.typeDmg) throw new Error("No pokemon has been selected");
    const dmgArr = Object.entries(curSelection.typeDmg);
    const weak = dmgArr
      .filter((dmgType) => dmgType[1] > 1)
      .sort((a, b) => b[1] - a[1]);
    const resist = dmgArr
      .filter((dmgType) => dmgType[1] < 1)
      .sort((a, b) => a[1] - b[1]);
    dmgArr.forEach;

    curSelection.weak = weak;
    curSelection.resist = resist;
  } catch (err) {
    // console.error(err);
  }
};

const getTypeDamage = function (pokeObj) {
  pokeObj.types.forEach((type) => {
    fetch(`https://pokeapi.co/api/v2/type/${type}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error retrieving type");
        return res.json();
      })
      .then((data) => {
        // Super effective
        data.damage_relations.double_damage_from.forEach((type) =>
          calcTypeDmg(pokeObj, type, "effective")
        );

        // Not that effective
        data.damage_relations.half_damage_from.forEach((type) =>
          calcTypeDmg(pokeObj, type, "ineffective")
        );

        // Immune to
        data.damage_relations.no_damage_from.forEach((type) =>
          calcTypeDmg(pokeObj, type, "immune")
        );
      });
  });
  return pokeObj;
};

const getPokemonData = function (search) {
  let searched = Object.keys(nameCorrections).includes(search)
    ? nameCorrections[search]
    : search;

  const formattedSearch = searched
    .toLowerCase()
    .split(" ")
    .join("-")
    .replace("'", "")
    .replace(".", "");
  fetch(`https://pokeapi.co/api/v2/pokemon/${formattedSearch}/`)
    .then((res) => {
      if (!res.ok) throw new Error("Error finding a pokemon of that name");
      return res.json();
    })
    .then((data) => {
      return {
        spriteURL: data.sprites.front_default,
        pokemon: data.name,
        types: data.types.map((type) => type.type.name),
        typeDmg: {}
      };
    })
    .then((pokeObj) => {
      getTypeDamage(pokeObj);
      setTimeout(() => (curSelection = pokeObj), 100);
      return pokeObj;
    })
    .catch((err) => {});
};

const getSuggestedPokemon = function () {
  try {
    const weaknessTypes = curSelection.weak;

    const typeSuggestions = [
      curSelection.weak[Math.floor(Math.random() * weaknessTypes.length)][0],
      curSelection.weak[Math.floor(Math.random() * weaknessTypes.length)][0],
      curSelection.weak[Math.floor(Math.random() * weaknessTypes.length)][0],
      curSelection.weak[Math.floor(Math.random() * weaknessTypes.length)][0]
    ];

    const chooseRandomSuggested = typeSuggestions.map((type) => {
      const length = bestOfTypes[type].length;
      return bestOfTypes[type][Math.floor(Math.random() * length)];
    });

    curSelection.suggested = [];
    let counter = 1;

    chooseRandomSuggested.forEach((poke) => {
      fetch(`https://pokeapi.co/api/v2/pokemon/${poke}`)
        .then((res) => {
          if (!res.ok)
            throw new Error(`Error finding suggested pokemon (${poke})`);
          if (!curSelection.weak)
            throw new Error("No calculated data yet to use");
          return res.json();
        })
        .then((data) => {
          curSelection.suggested.push(data);
          return data;
        })
        .then((data) => {
          displaySuggested(data, counter);
          counter++;
        })
        .catch((err) => {
          console.error(err);
        });
    });
  } catch (err) {}
};

// ###################################################
//* ### Visual Logic
// ###################################################
const displayPokemon = function () {
  try {
    if (!curSelection.pokemon) throw new Error("404");
    pokemonImg.src = curSelection.spriteURL;

    const formattedName = curSelection.pokemon
      .split("-")
      .map((name) => name[0].toUpperCase() + name.slice(1))
      .join(" ");

    pokemonName.textContent = formattedName;
    pokemonType.textContent = curSelection.types
      .map((t) => t[0].toUpperCase() + t.slice(1))
      .join(" / ");
  } catch (err) {
    pokemonImg.src = "./images/question.png";
    pokemonName.textContent = "Name";
    pokemonType.textContent = "Type";
    errMsg.textContent =
      "There was an error finding that pokemon, please check your spelling.";
    errContainer.classList.add("err--display");
  }
};

const displayData = function () {
  try {
    if (!curSelection.weak) throw new Error("No data to calculate");

    // Weaknesses
    pokemonWeakness.textContent = curSelection.weak
      .map(
        (type) =>
          type[0][0].toUpperCase() +
          type[0].slice(1) +
          `(${Number(type[1].toFixed(2))}x)`
      )
      .join(" ");

    // Resistances
    pokemonResistance.textContent = curSelection.resist
      .map(
        (type) =>
          type[0][0].toUpperCase() +
          type[0].slice(1) +
          `(${Number(type[1].toFixed(2))}x)`
      )
      .join(" ");
  } catch (err) {
    console.error("There was a problem calcuating data");
  }
};

const displaySuggested = function (poke, id) {
  const img = document.querySelector(`#sugg-img-${id}`);
  const name = document.querySelector(`#sugg-name-${id}`);

  img.src = poke.sprites.front_default;
  name.textContent = poke.name
    .split("-")
    .map((name) => name[0].toUpperCase() + name.slice(1))
    .join(" ");
};

// ###################################################
//* ### App Flow
// ###################################################
btnErr.addEventListener("click", function () {
  errContainer.classList.remove("err--display");
});

btnCalcData.addEventListener("click", () => {
  sortTypeDmg();
  displayData();
});

btnSuggest.addEventListener("click", function () {
  getSuggestedPokemon();
});

// Delay for data
btnSearch.addEventListener("click", function () {
  resetData();
  resetDisplay();
  errContainer.classList.remove("err--display");

  getNewSearch();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  resetData();
  resetDisplay();
  errContainer.classList.remove("err--display");

  getNewSearch();

  inputSearch.blur();
});

inputSearch.addEventListener("focus", () => {
  inputSearch.value = "";
});

// ###################################################
//* ### Data Variables
// ###################################################
const bestOfTypes = {
  //prettier-ignore
  bug: ["pinsir", "scizor", "genesect", "yanmega", "escavalier", "scolipede", "armaldo", "heracross", "scyther", "beedrill-mega", "durant"],
  //prettier-ignore
  dark: ["houndoom", "absol", "weavile", "darkrai", "hydreigon", "yveltal", "crawdaunt", "bisharp", "tyranitar", "pangoro", "honchkrow", "gyarados-mega", "houndoom-mega", "zarude", "absol-mega", "muk-alola", "greninja", "obstagoon", "zoroark"],
  //prettier-ignore
  dragon: ["salamence", "dragonite", "rayquaza", "dialga", "garchomp", "reshiram", "zekrom", "palkia", "latios", "latias", "haxorus", "goodra", "ampharos-mega", "giratina-altered", "dragapult", "kommo-o", "altaria-mega", "exeggutor-alola", "noivern", "druddigon"],
  //prettier-ignore
  electric: ["raikou", "electivire", "zapdos", "manectric", "ampharos", "zekrom", "magnezone", "thundurus-therian", "luxray", "jolteon", "golem-alola", "ampharos-mega", "manectric-mega", "zeraora", "tapu-koko", "vikavolt", "eelektross", "dracozolt", "heliolisk"],
  //prettier-ignore
  fairy: ["gardevoir", "togekiss", "granbull", "clefable", "wigglytuff", "rapidash-galar", "xerneas", "altaria", "zacian", "magearna", "tapu-lele", "tapu-bulu", "florges", "primarina", "tapu-koko", "altaria-mega", "sylveon", "tapu-fini", "diancie", "granbull", "rapidash-galar"],
  //prettier-ignore
  fighting: ["machamp", "lucario", "conkeldurr", "breloom", "hariyama", "blaziken", "gallade", "toxicroak", "emboar", "zamazenta", "lopunny-mega", "marshadow", "keldeo-ordinary", "terrakion", "kommo-o", "bewear", "heracross", "passimian", "virizion", "cobalion", "sirfetchd", "sawk", "mienshao"],
  //prettier-ignore
  fire: ["charizard", "entei", "reshiram", "moltres", "houndoom", "blaziken", "emboar", "darmanitan-standard", "magmortar", "chandelure", "arcanine", "ho-oh", "charizard-mega-y", "charizard-mega-x", "houndoom-mega", "heatran", "victini", "delphox", "flareon", "cinderace", "incineroar", "typhlosion"],
  //prettier-ignore
  flying: ["moltres", "pidgeot", "yveltal", "staraptor", "rayquaza", "lugia", "dragonite", "zapdos", "braviary", "ho-oh", "charizard-mega-y", "aerodactyl-mega", "landorus-therian", "salamence", "pidgeot-mega", "thundurus-therian", "togekiss", "noivern"],
  //prettier-ignore
  ghost: ["gengar", "giratina-altered", "chandelure", "banette", "mismagius", "drifblim", "golurk", "spiritomb", "froslass", "jellicent", "gengar-mega", "marshadow", "hoopa", "cursola", "decidueye", "trevenant"],
  //prettier-ignore
  grass: ["venusaur", "torterra", "zarude", "roserade", "victreebel", "tangrowth", "sceptile", "celebi", "leafeon", "venusaur-mega", "tapu-bulu", "abomasnow-mega", "rillaboom", "virizion", "exeggutor", "exeggutor-alola", "chesnaught", "decidueye"],
  //prettier-ignore
  ground: ["garchomp", "mamoswine", "landorus-therian", "groudon", "excadrill", "rhyperior", "swampert", "hippowdon", "donphan", "torterra", "golem", "flygon", "steelix-mega", "landorus-incarnate", "zygarde-50", "rhydon", "krookodile"],
  //prettier-ignore
  ice: ["mamoswine", "abomasnow", "darmanitan-galar-standard", "weavile", "glaceon", "articuno", "vanilluxe", "jynx", "kyurem", "beartic", "abomasnow-mega", "glaceon", "regice", "cryogonal", "walrein", "lapras"],
  //prettier-ignore
  normal: ["porygon-z", "regigigas", "lopunny", "snorlax", "ursaring", "staraptor", "blissey", "girafarig", "slaking", "unfezant", "pidgeot-mega", "lopunny-mega", "bewear", "braviary", "staraptor", "stoutland", "bouffalant"],
  //prettier-ignore
  poison: ["victreebel", "roserade", "vileplume", "muk", "toxicroak", "venusaur", "scolipede", "nidoqueen", "skuntank", "gengar", "crobat", "gengar-mega", "venusaur-mega", "beedrill-mega", "muk-alola", "slowking-galar", "nidoking", "nidoqueen"],
  //prettier-ignore
  psychic: ["mewtwo", "hoopa-unbound", "metagross", "alakazam", "exeggutor", "latios", "espeon", "azelf", "mew", "celebi", "jirachi", "victini", "delphox", "meloetta-aria", "slowbro-mega", "lugia", "latias", "tapu-lele", "hoopa", "deoxys-normal", "deoxys-attack", "gardevoir", "gallade", "alakazam-mega", "deoxys-speed"],
  //prettier-ignore
  rock: ["aerodactyl", "tyranitar", "rampardos", "rhyperior", "terrakion", "gigalith", "golem", "kabutops", "solrock", "lunatone", "aerodactyl-mega", "terrakion", "archeops", "stonjourner", "regirock", "aggron"],
  //prettier-ignore
  steel: ["metagross", "dialga", "aggron", "excadrill", "scizor", "genesect", "jirachi", "empoleon", "heatran", "bisharp", "zacian", "zamazenta", "steelix-mega", "melmetal", "magnezone", "cobalion", "escavalier", "lucario"],
  //prettier-ignore
  water: ["blastoise", "gyarados", "kyogre", "swampert", "kingler", "feraligatr", "empoleon", "clawitzer", "vaporeon", "greninja", "palkia", "suicune", "gyarados-mega", "blastoise-mega", "slowbro-mega", "manaphy", "wishiwashi-school", "primarina", "milotic", "swampert", "inteleon", "empoleon", "tapu-fini", "drednaw"]
};

// prettier-ignore
const nameCorrections = {wormadam: "wormadam-plant", morpeko: "morpeko-full-belly", giratina: "giratina-altered", zygarde: "zygarde-50", toxtricity: "toxtricity-amped", urshifu: "urshifu-single-strike", keldeo: "keldeo-ordinary", darmanitan: "darmanitan-standard", oricorio: "oricorio-baile", thundurus: "thundurus-incarnate", tornadus: "tornadus-incarnate", landorus: "landorus-incarnate", minior: "minior-red-meteor", aegislash: "aegislash-shield", pumpkaboo: "pumpkaboo-average", gourgeist: "gourgeist-average", shaymin: "shaymin-land", eiscue: "eiscue-ice", indeedee: "indeedee-male", nidoran: "nidoran-m", meloetta: "meloetta-aria", mimikyu: "mimikyu-disguised", deoxys: "deoxys-normal", meowstic: "meowstic-male", lycanroc: "lycanroc-dusk", basculin: "basculin-red-striped", wishiwashi: "wishiwashi-school"}

const typeRules = {
  effective: 1.6,
  ineffective: 0.625,
  immune: 0.390625
};

let curSelection = {};
