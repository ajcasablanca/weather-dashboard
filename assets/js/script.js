const myApiKey = "3b30ee696a9a6e2dfe171417086b6d0f";
const searchButtonEL = $("#searchBtn");
const inputCityEl = $("#inputCity");
const citySearchListEl = $("#cityList");
const clearHistoryBtnEl = $("#clearHistory");
const currentCityEl = $("#cityResult");
const currentTempEl = $("#tempResult");
const currentHumidityEl = $("#humidityResult");
const currentWindEl = $("#windResult");
const weatherContainerEl = $("#weatherContainer");
let cityArray = [];
const date = new Date();
const dateString = date.toLocaleDateString();

// Display search history and load data from local storage on page load
displayCitySearchList();
getCityInput();

// Search when Enter is pressed
inputCityEl.keypress(function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        searchButtonEL.click();
    }
});

// Store city data and update search history
function storeCityData(inputCity) {
    if (inputCity) {
        const index = cityArray.indexOf(inputCity);
        if (index !== -1) {
            cityArray.splice(index, 1);
        }
        cityArray.unshift(inputCity);
        localStorage.setItem("CITYLIST", JSON.stringify(cityArray));
        displayCitySearchList();
        clearHistoryBtnEl.removeClass("hide");
        weatherContainerEl.removeClass("hide");
    }
}

// Display search history
function displayCitySearchList() {
    citySearchListEl.empty();
    cityArray.forEach(city => {
        const newSearchCityBtn = $("<button>").attr("type", "button").addClass("savedCityBtn").attr("data-name", city).text(city);
        citySearchListEl.prepend(newSearchCityBtn);
    });
}

// Get city data from local storage
function getCityInput() {
    if (localStorage.getItem("CITYLIST")) {
        cityArray = JSON.parse(localStorage.getItem("CITYLIST"));
        if (cityArray.length > 0) {
            getCurrentWeather(cityArray[0]);
            weatherContainerEl.removeClass("hide");
        }
        displayCitySearchList();
    }
}

// Clear search history
clearHistoryBtnEl.on("click", function () {
    localStorage.removeItem("CITYLIST");
    cityArray = [];
    displayCitySearchList();
});

// Fetch current weather
function getCurrentWeather(inputCity) {
    const requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${myApiKey}`;
    $.ajax({
        url: requestUrl,
        method: 'GET',
    }).then(function (response) {
        const cityInfo = response.name;
        const temp = Math.floor((response.main.temp - 273.15) * 1.80 + 32);
        const humidity = response.main.humidity;
        const wind = response.wind.speed;
        const icon = response.weather[0].icon;

        currentCityEl.text(`${cityInfo} (${dateString})`);
        currentCityEl.append(`<img src="https://openweathermap.org/img/wn/${icon}.png" />`);
        currentTempEl.text(`Temperature: ${temp}°F`);
        currentWindEl.text(`Wind: ${wind}MPH`);
        currentHumidityEl.text(`Humidity: ${humidity}%`);

        storeCityData(inputCity);
    }).fail(function (response) {
        alert("Please enter a valid city name.");
    });
}

// Fetch forecast
function getForecast(inputCity) {
    const foreCastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${inputCity}&appid=${myApiKey}`;
    $.ajax({
        url: foreCastUrl,
        method: "GET",
    }).then(function (response) {
        $("#forecast").empty();
        for (let i = 0; i < 5; i++) {
            const foreCastDate = new Date();
            foreCastDate.setDate(foreCastDate.getDate() + i + 1);
            const tempF = Math.floor((response.list[i].main.temp - 273.15) * 1.80 + 32);

            const card = $("<div>").addClass("card col-12 col-md-2 ");
            const cardBody = $("<div>").addClass("card-body p-3 foreCastBody");
            const cityDate = $("<h4>").addClass("card-title").text(foreCastDate.toLocaleDateString());
            const cityTemp = $("<p>").addClass("card-text foreCastTemp").text(`Temperature : ${tempF}°F`);
            const cityWind = $("<p>").addClass("card-text foreCastWind").text(`Wind : ${response.list[i].wind.speed}MPH`);
            const cityHumidity = $("<p>").addClass("card-text foreCastHumid").text(`Humidity : ${response.list[i].main.humidity}%`);
            const image = $("<img>").attr("src", `https://openweathermap.org/img/wn/${response.list[i].weather[0].icon}.png`);

            cardBody.append(cityDate, image, cityTemp, cityWind, cityHumidity);
            card.append(cardBody);
            $("#forecast").append(card);
        }
    });
}

// Event listeners
searchButtonEL.on("click", function (event) {
    event.preventDefault();
    const inputCityVal = inputCityEl.val().trim().toUpperCase();
    if (inputCityVal !== "") {
        getCurrentWeather(inputCityVal);
        getForecast(inputCityVal);
        inputCityEl.val("");
    } else {
        alert("Please enter a city name to display current weather.");
    }
});

citySearchListEl.on("click", ".savedCityBtn", function (event) {
    event.preventDefault();
    const inputCityVal = $(this).attr("data-name");
    getCurrentWeather(inputCityVal);
    getForecast(inputCityVal);
});
