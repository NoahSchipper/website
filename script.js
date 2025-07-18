/* 
const fromText = document.querySelector('.from-text');
const toText = document.querySelector('.to-text');
selectTag = document.querySelectorAll('select');
exchangeIcon = document.querySelector('.exchange');
translateBtn = document.querySelector("button");
icons = document.querySelectorAll(".row i");

const blockedWords = [
  "<script", "javascript:", "onerror=", "onload=", "onmouseover=", "onfocus=", "onmouseenter=",
  "onclick=", "onblur=", "onchange=", "onsubmit=", "onreset=", "onkeydown=", "onkeyup=",
  "onkeypress=", "oncontextmenu=", "onmouseout=", "onmouseleave=", "iframe", "img", "<object",
  "<embed", "srcdoc=", "data:text/html", "src=", "<svg", "<math", "<link", "<style",
  "base64,", "<body", "<meta", "expression(", "document.cookie", "window.location", "eval(",
  "setTimeout(", "setInterval(", "Function(", "alert(", "prompt(", "confirm(", "<", ">", "$", "{","}"
];

function isSafe(input) {
    const lowerInput = input.toLowerCase();
    return !blockedWords.some(word => lowerInput.includes(word));
}

selectTag.forEach((tag, id) => {
    for (const country_code in countries) {
        let selected = "";
        if(id == 0 && country_code == "en-GB") {
            selected = "selected"; // default selected language
        }
        else if (id == 1 && country_code == "es-ES") {
            selected = "selected"; // default selected language
        }
        let option = `<option value="${country_code}" ${selected}>${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option); // adding options tag inside select tag
    }
});

exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value; // storing fromText value in tempText variable
    tempLang = selectTag[0].value; // storing fromSelect tag value in tempLang variable
    fromText.value = toText.value; // assigning toText value to fromText
    selectTag[0].value = selectTag[1].value; // assigning toSelect tag value to fromSelect
    toText.value = tempText; // assigning tempText value to toText
    selectTag[1].value = tempLang; // assigning tempText value to toText
    });


translateBtn.addEventListener("click", () => {
    const text = fromText.value.trim();

    if (!text) return;

    if (!isSafe(text)) {
        alert("Input contains potentially unsafe content and will not be translated.");
        return;
    }

    toText.setAttribute("placeholder", "Translating...");
    toText.value = ""
    let translateFrom = selectTag[0].value.split("-")[0].toLowerCase();
    let translateTo = selectTag[1].value.split("-")[0].toLowerCase();

    fetch("/translate", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            q: text,
            source: translateFrom,
            target: translateTo
        })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const translatedText = data?.data?.translations?.translatedText;
        if (translatedText) {
            toText.value = translatedText;
        } else {
            toText.value = "Translation failed.";
        }
    })
    .catch(err => {
        console.error("Error during translation:", err);
        toText.value = "Translating...";
    });
});

icons.forEach(icon => {
    icon.addEventListener("click", ({target}) => {
        if(target.classList.contains("fa-copy")) {
            if(target.id === "copy-from") {
                navigator.clipboard.writeText(fromText.value); // copying fromText value
            }
            else {
                navigator.clipboard.writeText(toText.value); // copying toText value
            }
            
        } else {
            let utterance;
            if(target.id === "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value); // creating a new speech synthesis utterance for fromText
                utterance.lang = selectTag[0].value; // setting language for fromText
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value); // creating a new speech synthesis utterance for toText
                utterance.lang = selectTag[1].value; // setting language for toText
            }
            speechSynthesis.speak(utterance);
        };
    });
});
*/
