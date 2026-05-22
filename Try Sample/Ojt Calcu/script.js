const API_KEY = 'wj7rgAbEk9Qj4znik60QIAVXH1R64PE8';
const THEMES = ['theme-dawn', 'theme-morning', 'theme-noon', 'theme-afternoon', 'theme-sunset', 'theme-dusk', 'theme-night'];
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FDOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WI = { 1000: 'bi-sun-fill', 1100: 'bi-cloud-sun-fill', 1101: 'bi-cloud-sun', 1102: 'bi-cloud-fill', 1001: 'bi-clouds-fill', 2000: 'bi-cloud-fog2-fill', 4000: 'bi-cloud-drizzle-fill', 4001: 'bi-cloud-rain-fill', 4200: 'bi-cloud-rain', 4201: 'bi-cloud-rain-heavy-fill', 8000: 'bi-cloud-lightning-rain-fill' };
const pad = n => String(n).padStart(2, '0');

function getTimeTheme(h) {
    if (h >= 5 && h < 7) return 'theme-dawn';
    if (h >= 7 && h < 11) return 'theme-morning';
    if (h >= 11 && h < 14) return 'theme-noon';
    if (h >= 14 && h < 17) return 'theme-afternoon';
    if (h >= 17 && h < 19) return 'theme-sunset';
    if (h >= 19 && h < 21) return 'theme-dusk';
    return 'theme-night';
}

function updateClock() {
    const now = new Date(), h = now.getHours(), ampm = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12;
    document.getElementById('clockDay').textContent = DAYS[now.getDay()];
    document.getElementById('clockTime').textContent = `${pad(hh)}:${pad(now.getMinutes())} ${ampm}`;
    document.getElementById('clockDate').textContent = `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`;
    document.getElementById('navDate').textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    THEMES.forEach(t => document.body.classList.remove(t));
    document.body.classList.add(getTimeTheme(h));
}
setInterval(updateClock, 1000);
updateClock();

function calculateOJT() {
    const startVal = document.getElementById('startDate').value;
    const totalHrs = parseFloat(document.getElementById('ojtHours').value);
    const hrsPerDay = parseFloat(document.getElementById('hrsPerDay').value) || 8;
    const absences = parseInt(document.getElementById('absences').value) || 0;
    const halfDays = parseInt(document.getElementById('halfdays').value) || 0;
    if (!startVal || !totalHrs || totalHrs <= 0) {
        document.getElementById('resultContent').innerHTML = '<span style="color:#c0392b">⚠️ Please fill in all fields.</span>';
        return;
    }
    const lostHrs = (absences * hrsPerDay) + (halfDays * hrsPerDay / 2);
    const adjHrs = totalHrs + lostHrs;
    const totalDays = Math.ceil(adjHrs / hrsPerDay);
    let counted = 0, current = new Date(startVal + 'T00:00:00');
    while (counted < totalDays) {
        if (current.getDay() !== 0 && current.getDay() !== 6) counted++;
        if (counted < totalDays) current.setDate(current.getDate() + 1);
    }
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    const endStr = current.toLocaleDateString('en-PH', opts);
    const calDays = Math.ceil((current - new Date(startVal + 'T00:00:00')) / (1000 * 60 * 60 * 24)) + 1;
    const weeks = Math.floor(totalDays / 5), remDays = totalDays % 5;
    document.getElementById('resultContent').innerHTML = `
    <div style="font-size:1.6rem;font-weight:800;color:#3D6B35;margin-bottom:4px">${endStr}</div>
    <div style="font-size:.78rem;font-weight:700;opacity:.7;margin-bottom:8px">Estimated End Date</div>
    <div class="d-flex flex-wrap justify-content-center gap-3" style="font-size:.78rem">
      <div><i class="bi bi-clock me-1"></i><strong>${totalHrs}</strong> required hrs</div>
      <div><i class="bi bi-calendar-check me-1"></i><strong>${totalDays}</strong> working days</div>
      <div><i class="bi bi-x-circle me-1" style="color:#e74c3c"></i><strong>${absences}</strong> absent</div>
      <div><i class="bi bi-slash-circle me-1" style="color:#e67e22"></i><strong>${halfDays}</strong> half-days</div>
    </div>
    <div style="font-size:.72rem;opacity:.5;margin-top:8px">${weeks > 0 ? weeks + ' week' + (weeks > 1 ? 's' : '') : ''} ${remDays > 0 ? '+ ' + remDays + ' day' + (remDays > 1 ? 's' : '') : ''} · ${calDays} calendar days total</div>
    ${lostHrs > 0 ? `<div style="font-size:.7rem;color:#e67e22;margin-top:4px"><i class="bi bi-info-circle me-1"></i>+${lostHrs}h added due to absences/half-days</div>` : ''}
  `;
}

function calcHeatIndex(tempC, rh) {
    const T = tempC * 9 / 5 + 32;
    if (T < 80) return tempC.toFixed(1);
    let HI = -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh - 0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
    return ((HI - 32) * 5 / 9).toFixed(1);
}

function hiCat(hi) {
    if (hi < 27) return { label: 'Normal', cls: 'hi-normal' };
    if (hi < 32) return { label: 'Caution', cls: 'hi-caution' };
    if (hi < 41) return { label: 'Extreme Caution', cls: 'hi-extreme' };
    if (hi < 54) return { label: '⚠ Danger', cls: 'hi-danger' };
    return { label: '☠ Extreme Danger', cls: 'hi-xdanger' };
}

function conditionStyle(code, tempC) {
    if ([4001, 4200, 4201, 4000].includes(code)) return { cls: 'wc-rainy', rain: true, sun: false, cloud: false };
    if (code === 8000) return { cls: 'wc-stormy', rain: true, sun: false, cloud: false };
    if ([2000, 2100].includes(code)) return { cls: 'wc-foggy', rain: false, sun: false, cloud: true };
    if ([1001, 1100, 1101, 1102].includes(code)) return { cls: 'wc-cloudy', rain: false, sun: false, cloud: true };
    if (code === 1000 && tempC >= 35) return { cls: 'wc-hot', rain: false, sun: true, cloud: false };
    if (code === 1000) return { cls: 'wc-sunny', rain: false, sun: true, cloud: false };
    return { cls: 'wc-default', rain: false, sun: false, cloud: false };
}

function makeRain(container) {
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const d = document.createElement('div');
        d.className = 'raindrop';
        d.style.cssText = `left:${Math.random() * 100}%;height:${10 + Math.random() * 15}px;background:rgba(180,220,255,.7);animation-duration:${.5 + Math.random() * .8}s;animation-delay:${Math.random()}s`;
        container.appendChild(d);
    }
}

function buildForecastNav(days) {
    const row = document.getElementById('navForecastRow');
    row.innerHTML = '';
    days.forEach((d, i) => {
        const date = new Date(d.time);
        const dv = d.values;
        const fi = WI[dv.weatherCodeMax] || 'bi-cloud';
        const hi = calcHeatIndex(dv.temperatureMax, dv.humidityAvg || 75);
        const cat = hiCat(parseFloat(hi));
        const el = document.createElement('div');
        el.className = `forecast-circle${i === 0 ? ' fc-today' : ''}`;
        el.title = `${i === 0 ? 'Today' : FDOW[date.getDay()]} — HI ${hi}°C (${cat.label})`;
        el.innerHTML = `
      <span style="font-size:.5rem;font-weight:800;letter-spacing:1px;opacity:.7;text-transform:uppercase">${i === 0 ? 'TODAY' : FDOW[date.getDay()]}</span>
      <span style="font-size:1rem;line-height:1.2"><i class="bi ${fi}"></i></span>
      <span style="font-size:.7rem;font-weight:800;line-height:1">${dv.temperatureMax.toFixed(0)}°</span>
      <span style="font-size:.5rem;opacity:.65">${(dv.precipitationProbabilityAvg || 0).toFixed(0)}%<i class="bi bi-droplet ms-1"></i></span>
    `;
        row.appendChild(el);
    });
}

async function fetchWeather() {
    const [lat, lon] = document.getElementById('citySelect').value.split(',');
    const cityName = document.getElementById('citySelect').selectedOptions[0].text;
    document.getElementById('navCity').textContent = cityName;
    document.getElementById('weatherBody').innerHTML = `<span class="spinner-border spinner-sm me-1"></span> Loading...`;
    const realtimeUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&apikey=${API_KEY}&units=metric&timesteps=1d`;
    try {
        const [rRes, fRes] = await Promise.all([fetch(realtimeUrl), fetch(forecastUrl)]);
        if (!rRes.ok) throw new Error(`API Error ${rRes.status}`);
        const rData = await rRes.json();
        const v = rData.data.values;
        const temp = v.temperature.toFixed(1);
        const feelsL = v.temperatureApparent.toFixed(1);
        const rh = v.humidity.toFixed(0);
        const wind = v.windSpeed.toFixed(1);
        const vis = v.visibility.toFixed(1);
        const hi = calcHeatIndex(v.temperature, v.humidity);
        const cat = hiCat(parseFloat(hi));
        const code = v.weatherCode;
        const cond = conditionStyle(code, v.temperature);
        const icon = WI[code] || 'bi-cloud';
        const card = document.getElementById('weatherCard');
        card.className = `weather-card ${cond.cls} mb-3`;
        const rain = document.getElementById('rainOverlay');
        const sun = document.getElementById('sunOverlay');
        const cloud = document.getElementById('cloudOverlay');
        if (cond.rain) { makeRain(rain); rain.style.display = 'block'; } else rain.style.display = 'none';
        sun.style.display = cond.sun ? 'block' : 'none';
        cloud.style.display = cond.cloud ? 'block' : 'none';
        document.getElementById('navWeatherSummary').innerHTML = `<i class="bi ${icon} me-1"></i>${temp}°C · HI ${hi}°C`;
        document.getElementById('weatherBody').innerHTML = `
      <div class="d-flex align-items-end gap-3 mb-2">
        <div style="font-size:3.2rem;font-weight:900;line-height:1">${temp}°C</div>
        <div style="font-size:.85rem;opacity:.85;padding-bottom:8px"><i class="bi ${icon} me-1"></i>Feels like ${feelsL}°C</div>
      </div>
      <div class="d-flex gap-2 flex-wrap mb-2">
        <span class="hi-badge ${cat.cls}"><i class="bi bi-thermometer-high me-1"></i>Heat Index ${hi}°C — ${cat.label}</span>
      </div>
      <div class="d-flex gap-3 flex-wrap" style="font-size:.76rem;opacity:.85">
        <span><i class="bi bi-droplet-fill me-1"></i>${rh}%</span>
        <span><i class="bi bi-wind me-1"></i>${wind} m/s</span>
        <span><i class="bi bi-eye-fill me-1"></i>${vis} km</span>
      </div>
      <div style="font-size:.65rem;opacity:.55;margin-top:6px"> ${cityName} · Updated ${new Date().toLocaleTimeString('en-PH')}</div>
    `;
        if (fRes.ok) {
            const fData = await fRes.json();
            const days = fData.timelines?.daily?.slice(0, 7) || [];
            if (days.length) buildForecastNav(days);
        }
    } catch (err) {
        document.getElementById('weatherBody').innerHTML = `
      <div style="font-size:.82rem"><i class="bi bi-exclamation-triangle-fill me-1" style="color:#ffc107"></i>
      <strong>${err.message}</strong></div>`;
    }
}

fetchWeather();
setInterval(fetchWeather, 30 * 60 * 1000);