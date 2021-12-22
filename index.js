const express = require('express');
const Datastore = require('nedb');
// import fetch from 'node-fetch';
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000

app.listen(port, () => {console.log(`listening at ${port}`)});
app.use(express.static('public'));
app.use(express.json());

const weather = new Datastore('Weather.db');
weather.loadDatabase();
const tube = new Datastore('Tube.db');
tube.loadDatabase();

async function getWeatherData() {
    const weather_url = "https://api.openweathermap.org/data/2.5/weather?q=London&appid=d5221bb02cd4728d8ca454bf6cb805c8";
    const weather_response = await fetch(weather_url);
    const weather_data = await weather_response.json();
    var weather_data_clean = {
        temp: weather_data.main.temp,
        pressure: weather_data.main.pressure,
        humidity: weather_data.main.humidity,
        wind_speed: weather_data.wind.speed,
        weather_status: weather_data.weather[0].description,
        timestamp: weather_data.dt
    };

    weather.insert(weather_data_clean);
}

// setInterval(getWeatherData, 3600000);

async function getTubeData() {
    const crowding_url = "https://api.tfl.gov.uk/crowding/940GZZLUECT/Live";
    let h = new fetch.Headers();
    h.append("Cache-Control", "no-cache");
    h.append("app_key", "75cf0cb9314e47948c68445e3c27f5a5");
    let req = new fetch.Request(crowding_url, {
        method: "GET",
        headers: h
    });
    const crowd_data = await fetch(req)
        .then( (response) =>{
            if (response.ok){
                return response.json();
            } else{
                throw new Error('BAT HTTP');
            }
        })
    console.log(crowd_data);
    var crowd_data_clean = {
        percentage: crowd_data.percentageOfBaseline,
    }
    const timestamp = Date.now();
    crowd_data_clean.timestamp = timestamp;
    tube.insert(crowd_data_clean);
};

// setInterval(getTubeData, 900000);

app.get('/weather', (request, response) => {
    weather.find({}).sort({ timestamp: 1}).exec(function (err, data) {
        if(err) {
            response.end();
            return;
        }
        response.json(data);
    });
});

app.get('/crowd', (request, response) => {
    tube.find({}).sort({ timestamp: 1}).exec(function (err, data) {
        if(err) {
            response.end();
            return;
        }
        response.json(data);
    });
});