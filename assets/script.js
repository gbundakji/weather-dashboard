// Declare Variables
var openWeatherApiKey = '4ea10124c88fca503d3a1712192729fd';
var openWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather?q=';
var oneCallUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='
var userForm = $('#city-search');
var searchResults = $('.search-results');
var cityInputEl = $('#city');
var fiveDayEl = $('#five-day');
var searchHistoryEl = $('#search-history');
var currentDay = moment().format('M/DD/YYYY');
const weatherIconUrl = 'http://openweathermap.org/img/wn/';
var searchHistoryArray = loadSearchHistory();


// Function to make input in uppercase
function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
}

// Get search history from local storage
function loadSearchHistory() {
    var searchHistoryArray = JSON.parse(localStorage.getItem('search history'));
    if (!searchHistoryArray) {
        searchHistoryArray = {
            searchedCity: [],
        };
    } else {
        for (var i = 0; i < searchHistoryArray.searchedCity.length; i++) {
            searchHistory(searchHistoryArray.searchedCity[i]);
        }
    }
    return searchHistoryArray;
}

// Save search history in local storage
function saveSearchHistory() {
    localStorage.setItem('search history', JSON.stringify(searchHistoryArray));
};

// Create search history button
function searchHistory(city) {
    var searchHistoryBtn = $('<button>')
        .addClass('btn')
        .text(city)
        .on('click', function () {
            $('#current-weather').remove();
            $('#five-day').empty();
            $('#five-day-header').remove();
            getWeather(city);
        })
        .attr({
            type: 'button'
        });
    searchHistoryEl.append(searchHistoryBtn);
}

// Function to get all info from the api for user city input
function getWeather(city) {
    var apiUrl = openWeatherUrl + city + '&appid=' + openWeatherApiKey;
    fetch(apiUrl)
        .then(function (apiResponse) {
            if (apiResponse.ok) {
                apiResponse.json().then(function (data) {
                    var cityLatitude = data.coord.lat;
                    var cityLongitude = data.coord.lon;
                    var apiOneCallUrl = oneCallUrl + cityLatitude + '&lon=' + cityLongitude + '&appid=' + openWeatherApiKey + '&units=imperial';
                    // Current weather data icon
                    fetch(apiOneCallUrl)
                        .then(function (weatherResponse) {
                            if (weatherResponse.ok) {
                                weatherResponse.json().then(function (weatherData) {
                                    var currentWeatherEl = $('<div>')
                                        .attr({
                                            id: 'current-weather'
                                        })
                                    var weatherIcon = weatherData.current.weather[0].icon;
                                    var cityCurrentWeatherIcon = weatherIconUrl + weatherIcon + '.png';
                                    var currentWeatherHeadingEl = $('<h2>')
                                        .text(city + ' (' + currentDay + ')');
                                    var iconImgEl = $('<img>')
                                        .attr({
                                            id: 'current-weather-icon',
                                            src: cityCurrentWeatherIcon,
                                            alt: 'Weather Icon'
                                        })
                                    var currWeatherListEl = $('<ul>')
                                    var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                                    // Current weather uvi index
                                    for (var i = 0; i < currWeatherDetails.length; i++) {
                                        if (currWeatherDetails[i] === 'UV Index: ' + weatherData.current.uvi) {
                                            var currWeatherListItem = $('<li>')
                                                .text('UV Index: ')
                                            currWeatherListEl.append(currWeatherListItem);
                                            var uviItem = $('<span>')
                                                .text(weatherData.current.uvi);
                                            if (uviItem.text() <= 2) {
                                                uviItem.addClass('low');
                                            } else if (uviItem.text() > 2 && uviItem.text() <= 7) {
                                                uviItem.addClass('moderate');
                                            } else {
                                                uviItem.addClass('high');
                                            }
                                            currWeatherListItem.append(uviItem);
                                        } else {
                                            var currWeatherListItem = $('<li>')
                                                .text(currWeatherDetails[i])
                                            currWeatherListEl.append(currWeatherListItem);
                                        }
                                    }
                                    // Append to current weather
                                    $('#five-day').before(currentWeatherEl);                                
                                    currentWeatherEl.append(currentWeatherHeadingEl);                                
                                    currentWeatherHeadingEl.append(iconImgEl);                                 
                                    currentWeatherEl.append(currWeatherListEl);
                                    // Header for 5-day forecast
                                    var fiveDayHeaderEl = $('<h2>')
                                        .text('5-Day Forecast:')
                                        .attr({
                                            id: 'five-day-header'
                                        })
                                        // Append to current weather
                                    $('#current-weather').after(fiveDayHeaderEl)

                                    var fiveDayArray = [];
                                    // Forloop for 5-day forecast
                                    for (var i = 0; i < 5; i++) {
                                        let forecastDate = moment().add(i + 1, 'days').format('M/DD/YYYY');
                                        fiveDayArray.push(forecastDate);
                                    }
                                    // Forloop for weather data to apear
                                    for (var i = 0; i < fiveDayArray.length; i++) {

                                        var cardDivEl = $('<div>')
                                            .addClass('day-card');

                                        var cardBodyDivEl = $('<div>')
                                            .addClass('card-body');

                                        var cardTitleEl = $('<h3>')
                                            .addClass('card-title')
                                            .text(fiveDayArray[i]);

                                        var forecastIcon = weatherData.daily[i].weather[0].icon;

                                        var forecastIconEl = $('<img>')
                                            .attr({
                                                src: weatherIconUrl + forecastIcon + '.png',
                                                alt: 'Weather Icon'
                                            });

                                        // cards containing weather details
                                        var currWeatherDetails = ['Temp: ' + weatherData.current.temp + ' °F', 'Wind: ' + weatherData.current.wind_speed + ' MPH', 'Humidity: ' + weatherData.current.humidity + '%', 'UV Index: ' + weatherData.current.uvi]
                                        var tempEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Temp: ' + weatherData.daily[i].temp.max)
                                        var windEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Wind: ' + weatherData.daily[i].wind_speed + ' MPH')
                                        var humidityEL = $('<p>')
                                            .addClass('card-text')
                                            .text('Humidity: ' + weatherData.daily[i].humidity + '%')


                                        //append cards to card body
                                        fiveDayEl.append(cardDivEl);
                                        cardDivEl.append(cardBodyDivEl);
                                        cardBodyDivEl.append(cardTitleEl);
                                        cardBodyDivEl.append(forecastIconEl);
                                        cardBodyDivEl.append(tempEL);
                                        cardBodyDivEl.append(windEL);
                                        cardBodyDivEl.append(humidityEL);
                                    }
                                })
                            }
                        })
                });

                // If fetch does not work and couldnt find the data
            } else {
                alert('Error: Open Weather could not find city')
            }

        })
        // If fetch isnt working
        .catch(function (error) {
            alert('Unable to connect to Open Weather');
        });
}

// Function to submit input and aert if chosen city is already in search history or not inputed
function submitCitySearch(event) {
    event.preventDefault();
    var city = titleCase(cityInputEl.val().trim());

    if (searchHistoryArray.searchedCity.includes(city)) {
        alert(city + ' is included in history below. Click the ' + city + ' button to get weather.');
        cityInputEl.val('');

    } else if (city) {
        getWeather(city);
        searchHistory(city);
        searchHistoryArray.searchedCity.push(city);
        saveSearchHistory();
        cityInputEl.val('');

    } else {
        alert('Please enter a city');
    }
}

// Get api data on submission input in form
userForm.on('submit', submitCitySearch);

// On click, empty previous data
$('#search-btn').on('click', function () {
    $('#current-weather').remove();
    $('#five-day').empty();
    $('#five-day-header').remove();
});