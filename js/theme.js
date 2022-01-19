// Need to fix flickering on page load
const themeButton = document.getElementById("theme-button");
themeButton.addEventListener("click",toggleTheme);



let storage = window.localStorage;
let themes = {
    light: {
        img: "images/sun.png",
        sheet: "lightstyle.css"
    },
    dark: {
        img: "images/moon.png",
        sheet: "darkstyle.css"
    }
}
if (!storage.getItem("theme")) {
    storage.setItem("theme","light");
}
// Initial theme set
setTheme(storage.getItem("theme"))

function toggleTheme() {
    console.log(`change theme from ${storage.getItem("theme")}`);

    if (storage.getItem("theme") == "light") {
        setTheme("dark")
        storage.setItem("theme","dark");
    } else if (storage.getItem("theme") == "dark") {
        setTheme("light")
        storage.setItem("theme","light");
    }
}

function setTheme(theme) {
    let stylesheet = document.getElementById("stylesheet");
    if (theme == "light") {
        stylesheet.href = themes.light.sheet;
        themeButton.querySelector("img").src = themes.dark.img;
    } else if (theme == "dark") {
        stylesheet.href = themes.dark.sheet;
        themeButton.querySelector("img").src = themes.light.img;
    }
}
