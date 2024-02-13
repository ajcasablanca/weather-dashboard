const myApiKey = "3b30ee696a9a6e2dfe171417086b6d0f";
const searchButtonEl = document.getElementById("searchBtn");
const inputCityEl = document.getElementById("inputCity");
const historyListEl = document.getElementById("cityList");
const clearHistoryEl = document.getElementById("clearHistory");
const currentCityEl = document.getElementById("cityResult");
const currentTempEl = document.getElementById("tempResult");
const humidityEl = document.getElementById("humidityResult");
const windEl = document.getElementById("windResult");
const weatherContainerEl = document.getElementById("weatherContainer");
let cityArray = [];
const date = new Date();
const dateString = date.toLocaleDateString();

displayCitySearchList();
getCityInput();

inputCityEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchButtonElL.click();
    }
});

function storeCityData(inputCity) {
    if (inputCity) {
        const index = cityArray.indexOf(inputCity);
        if (index !== -1) {
            cityArray.splice(index, 1);
        }
        cityArray.unshift(inputCity);
        localStorage.setItem("CITYLIST", JSON.stringify(cityArray));
        displayCitySearchList();
        clearHistoryEl.classList.remove("hide");
        weatherContainerEl.classList.remove("hide");
    }
}

function displayCitySearchList() {
    historyListEl.innerHTML = "";
    cityArray.forEach(city => {
        const newSearchCityBtn = document.createElement("button");
        newSearchCityBtn.setAttribute("type", "button");
        newSearchCityBtn.classList.add("savedCityBtn");
        newSearchCityBtn.setAttribute("data-name", city);
        newSearchCityBtn.textContent = city;
        historyListEl.prepend(newSearchCityBtn);
    });
}

function getCityInput() {
    if (localStorage.getItem("CITYLIST")) {
        cityArray = JSON.parse(localStorage.getItem("CITYLIST"));
        if (cityArray.length > 0) {
            getCurrentWeather(cityArray[0]);
            weatherContainerEl.classList.remove("hide");
        }
        displayCitySearchList();
    }
}

clearHistoryEl.addEventListener("click", function () {
    localStorage.removeItem("CITYLIST");
    cityArray = [];
    displayCitySearchList();
});

function getCurrentWeather(inputCity) {
    const requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${myApiKey}`;
    fetch(requestUrl)
        .then(response => response.json())
        .then(data => {
            const cityInfo = data.name;
            const temp = Math.floor((data.main.temp - 273.15) * 1.80 + 32);
            const humidity = data.main.humidity;
            const wind = data.wind.speed;
            const icon = data.weather[0].icon;

            currentCityEl.textContent = `${cityInfo} (${dateString})`;
            currentCityEl.innerHTML += `<img src="https://openweathermap.org/img/wn/${icon}.png" />`;
            currentTempEl.textContent = `Temperature: ${temp}°F`;
            windEl.textContent = `Wind: ${wind}MPH`;
            humidityEl.textContent = `Humidity: ${humidity}%`;

            storeCityData(inputCity);
        })
        .catch(error => {
            alert("Please enter a valid city name.");
        });
}

function getForecast(inputCity) {
    const foreCastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${myApiKey}`;
    fetch(foreCastUrl)
        .then(response => response.json())
        .then(data => {
            const forecastContainer = document.getElementById("forecast");
            forecastContainer.innerHTML = "";
            for (let i = 0; i < 5; i++) {
                const foreCastDate = new Date();
                foreCastDate.setDate(foreCastDate.getDate() + i + 1);
                const tempF = Math.floor((data.list[i].main.temp - 273.15) * 1.80 + 32);

                const card = document.createElement("div");
                card.classList.add("card", "col-12", "col-md-2");
                const cardBody = document.createElement("div");
                cardBody.classList.add("card-body", "p-3", "foreCastBody");
                const cityDate = document.createElement("h4");
                cityDate.classList.add("card-title");
                cityDate.textContent = foreCastDate.toLocaleDateString();
                const cityTemp = document.createElement("p");
                cityTemp.classList.add("card-text", "foreCastTemp");
                cityTemp.textContent = `Temperature : ${tempF}°F`;
                const cityWind = document.createElement("p");
                cityWind.classList.add("card-text", "foreCastWind");
                cityWind.textContent = `Wind : ${data.list[i].wind.speed}MPH`;
                const cityHumidity = document.createElement("p");
                cityHumidity.classList.add("card-text", "foreCastHumid");
                cityHumidity.textContent = `Humidity : ${data.list[i].main.humidity}%`;
                const image = document.createElement("img");
                image.setAttribute("src", `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png`);

                cardBody.append(cityDate, image, cityTemp, cityWind, cityHumidity);
                card.append(cardBody);
                forecastContainer.append(card);
            }
        })
        .catch(error => {
            console.error("Error fetching forecast data:", error);
        });
}

searchButtonEl.addEventListener("click", function (event) {
    event.preventDefault();
    const inputCityVal = inputCityEl.value.trim().toUpperCase();
    if (inputCityVal !== "") {
        getCurrentWeather(inputCityVal);
        getForecast(inputCityVal);
        inputCityEl.value = "";
    } else {
        alert("Please enter a city name to display current weather.");
    }
});

historyListEl.addEventListener("click", function (event) {
    if (event.target.classList.contains("savedCityBtn")) {
        const inputCityVal = event.target.getAttribute("data-name");
        getCurrentWeather(inputCityVal);
        getForecast(inputCityVal);
    }
});
