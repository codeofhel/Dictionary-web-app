const formInput = document.querySelector("#searchInput");

document.querySelector(".switch input").addEventListener("click", (evt) => {
    document.querySelectorAll("[data-theme]").forEach((elem) => {

        if (elem.getAttribute("data-theme") == "light")
            elem.setAttribute("data-theme", "dark")
        else
            elem.setAttribute("data-theme", "light")
    })

})

document.querySelector("#selectFont").addEventListener("change", (evt) => {
    document.body.className = "";
    document.body.className = evt.target.value;
})

document.onload = handleSearch("dictionary");

function checkvalue() {
    if (formInput.value != "")
        formInput.classList.add("filled")
}

function RemoveError() {
    const formInput = document.querySelector("#searchInput");
    formInput.classList.remove("error");
}

function handleSearch(w) {
    const form = document.querySelector("#myForm");
    const formData = new FormData(form);
    const word = formData.get("word") || w;

    if (word == "" || word == undefined) {
        form.firstElementChild.classList.add("error")
        return false;
    }

    function validateDefinitions(data, defType) {
        let definitions = null;
        data[0].meanings.filter((elem) => {

            if (elem.partOfSpeech == defType) {
                definitions = elem.definitions.map((def) => `<li>${def.definition}</li>${defType == "verb" && def.example != undefined ? `<p>“${def.example}”</p>` : ``}`)
            }

        })
        return definitions?.join("")
    }

    function checkPhonetic(data, key) {
        if (Array.isArray(data)){
            const result = data.find((elem) => {
                return elem[key] != ""
            })
            return result[key];
        }
        return "no_phonetic";
    }

    function empty(arr) {
        if (!arr.length)
            return false;
        return true;
    }

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, { method: "GET", })
        .then(result => result.json())
        .then(data => {
            
            const objData = {
                "word": data[0].word,
                "phoneticText": checkPhonetic(data[0].phonetics,"text"),
                "list_definition": validateDefinitions(data, "noun"),
                "list_definition_verb": validateDefinitions(data, "verb"),
                "sourceUrls": data[0].sourceUrls[0] || null,
                "phoneticSound": checkPhonetic(data[0].phonetics,"audio"),
                "synonyms": empty(data[0].meanings[0].synonyms) ? data[0].meanings[0].synonyms : null
            }

            document.querySelectorAll("[data-info]").forEach((elem) => {
                
                
                if (objData[elem.dataset.info] == null) {
                    elem.closest("section").classList.add("hide");
                    return false;
                } else if (objData[elem.dataset.info] =="no_phonetic") {
                    elem.classList.add("hide");
                    return false;
                }
                
                if (objData[elem.dataset.info] != null && objData[elem.dataset.info] != "no_phonetic") {
                    elem.closest("section").classList.remove("hide");
                    elem.classList.remove("hide");
                }
                
                if (elem.dataset.info == "word" || elem.dataset.info == "sourceUrls") {
                    elem.textContent = objData[elem.dataset.info];
                } else if (elem.dataset.info == "synonyms") {
                    elem.textContent = objData[elem.dataset.info].join(" , ");
                } else if (elem.dataset.info == "list_definition" || elem.dataset.info == "list_definition_verb") {
                    elem.innerHTML = "";
                    elem.innerHTML = objData[elem.dataset.info];
                } else if (elem.dataset.info == "phoneticSound")
                    elem.setAttribute("href", objData["phoneticSound"]);
            })

        }).catch(err => new Error(err));
}
