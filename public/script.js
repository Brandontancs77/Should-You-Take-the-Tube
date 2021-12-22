temp = [];
pressure = [];
humidity = [];
ws = [];
dateW = [];
crowd = [];
dateT = [];
let init1 = true;
let init2 = true;

getWeatherDB();
getTubeDB();

tempGraph();
pressGraph();
humiGraph();
wsGraph();
crowdGraph();

verdict();

async function getWeatherDB() {
    const weather_response = await fetch('/weather');
    const weather_data = await weather_response.json();
    if (init1 == true) {
        for (item of weather_data) {
            const tempDegC = item.temp - 273.15;
            temp.push(tempDegC);
            const presshPA = item.pressure;
            pressure.push(presshPA);
            const humiPerc = item.humidity;
            humidity.push(humiPerc);
            const wsMperS = item.wind_speed;
            ws.push(wsMperS);
            const dateUTCW = new Date(item.timestamp * 1000).toLocaleString();
            dateW.push(dateUTCW);
        }
        init1 = false;
    }
}

async function getTubeDB() {
    const crowd_response = await fetch('/crowd');
    const crowd_data = await crowd_response.json();
    if (init2 == true) {
        for (item of crowd_data) {
            const crowdPerc = item.percentage;
            crowd.push(crowdPerc);
            const dateUTCT = new Date(item.timestamp).toLocaleString();
            dateT.push(dateUTCT);
        }
        init2 = false;
    }
}

async function tempGraph() {
    await getWeatherDB();
    console.log(temp);
    const ctx = document.getElementById('tempCanvas').getContext('2d');
    const tempGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateW,
            datasets: [{
                label: 'Temperature/°C',
                data: temp,
                backgroundColor: ['rgba(255, 99, 132, 0.2)',],
                borderColor: ['rgba(255, 99, 132, 1)',],
                borderWidth: 1
            }]
        }
    });
}

async function pressGraph() {
    await getWeatherDB();
    console.log(pressure);
    const ctx = document.getElementById('pressCanvas').getContext('2d');
    const pressGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateW,
            datasets: [{
                label: 'Pressure/hPa',
                data: pressure,
                backgroundColor: ['rgba(255, 206, 86, 0.2)',],
                borderColor: ['rgba(255, 206, 86, 1)',],
                borderWidth: 1
            }]
        }
    });
}

async function humiGraph() {
    await getWeatherDB();
    console.log(humidity);
    const ctx = document.getElementById('humiCanvas').getContext('2d');
    const humiGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateW,
            datasets: [{
                label: 'humidity/%',
                data: humidity,
                backgroundColor: ['rgba(54, 162, 235, 0.2)',],
                borderColor: ['rgba(54, 162, 235, 1)',],
                borderWidth: 1
            }]
        }
    });
}

async function wsGraph() {
    await getWeatherDB();
    console.log(ws);
    const ctx = document.getElementById('wsCanvas').getContext('2d');
    const wsGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateW,
            datasets: [{
                label: 'wind speed/m/s',
                data: ws,
                backgroundColor: ['rgba(153, 102, 255, 0.2)',],
                borderColor: ['rgba(153, 102, 255, 1)',],
                borderWidth: 1
            }]
        }
    });
}

async function crowdGraph() {
    await getTubeDB();
    console.log(crowd);
    const ctx = document.getElementById('crowdCanvas').getContext('2d');
    const crowdGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateT,
            datasets: [{
                label: 'Crowd Percentage/%',
                data: crowd,
                backgroundColor: ['rgba(255, 159, 64, 0.2)',],
                borderColor: ['rgba(255, 159, 64, 1)',],
                borderWidth: 1
            }]
        }
    });
}

function normalise(array, value) {
    const total = array.reduce((acc, c) => acc + c, 0);
    const average = total/array.length;
    const normalised = (value-average)/average;
    return normalised;
}

async function verdict() {
    await getWeatherDB();
    await getTubeDB();
    const curTemp = temp.slice(-1);
    let curTemp2 = Number(curTemp).toFixed(2);
    const curPress = pressure.slice(-1);
    const curHumi = humidity.slice(-1);
    const curWs = ws.slice(-1);
    const curCrowd = crowd.slice(-1);
    let verdict = "";

    var weighted = await -0.3*normalise(temp, curTemp) + 0.05*normalise(pressure, curPress) + 0.3*normalise(humidity, curHumi) + 0.05*normalise(ws, curWs) - 0.3*normalise(crowd, curCrowd);
    console.log(weighted);
    if (weighted>0) {
        verdict = "You should take the tube"
    }
    else {
        verdict = "You should not take the tube"
    }
    console.log(verdict);
    document.getElementById("currWeather").textContent = curTemp2+" °C, " + curPress+" hPa Pressure, " + curHumi+" % Humidity, with " + curWs+" m/s wind speeds.";
    document.getElementById("currTube").textContent = curCrowd+"% of its peak crowd."
    document.getElementById("verdict").textContent = verdict;
}