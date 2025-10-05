import React, { useState, useRef, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "./index.css"

// Fix des icônes Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Charts
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js"
import { Line } from "react-chartjs-2"

// Icons
import { Loader2, MapPin, Calendar, Search, CloudRain, ThermometerSun, Droplets } from "lucide-react"

// Animations
import { motion } from "framer-motion"
import AOS from "aos"
import "aos/dist/aos.css"

// Register ChartJS
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)

// ------------ Export utils ------------
function downloadJSON(data, filename = "weather.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function downloadCSV(obj, filename = "weather.csv") {
  if (Array.isArray(obj) && obj.length > 0) {
    const headers = Object.keys(obj[0]).join(",")
    const rows = obj.map(o =>
      Object.values(o).map(v => (typeof v === "string" ? `"${v}"` : v)).join(",")
    )
    const csv = `${headers}\n${rows.join("\n")}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

// ------------ Helpers ------------
const riskLevel = (p) => (p >= 70 ? "danger" : p >= 40 ? "warn" : "ok")
const riskEmoji = (key) =>
  key === "Very Hot" ? "🔥" :
  key === "Very Cold" ? "❄️" :
  key === "Very Wet" ? "🌧️" : "💦"

// ------------ Leaflet click ------------
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
    },
  })
  return null
}

// ------------ App ------------
export default function App() {
  const [location, setLocation] = useState({ name: "", latitude: null, longitude: null })
  const [date, setDate] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [markerPosition, setMarkerPosition] = useState([48.8566, 2.3522])
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => { AOS.init({ duration: 900, once: true }) }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocationChange = async (locationName) => {
    setLocation((prev) => ({ ...prev, name: locationName }))
    if (locationName.trim().length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=5`
        )
        const data = await response.json()
        setSuggestions(data || [])
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionSelect = (s) => {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    setMarkerPosition([lat, lng])
    setLocation({ name: s.display_name, latitude: lat, longitude: lng })
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleMapClick = async (lat, lng) => {
    setMarkerPosition([lat, lng])
    setLocation({
      name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      latitude: lat,
      longitude: lng,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!location.latitude || !location.longitude) { setError("Please select a location."); return }
    if (!date) { setError("Please select a date."); return }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(
  `https://weather-pxny.onrender.com/weather?lat=${location.latitude}&lon=${location.longitude}&date=${date}`
)
      if (!response.ok) throw new Error("Server error")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError("Error fetching weather data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getMaxDate = () => {
    const today = new Date()
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    return nextYear.toISOString().split("T")[0]
  }
  const getMinDate = () => new Date().toISOString().split("T")[0]

  // Line data (15j autour de la date sélectionnée -1 an)
  const lineData = result?.daily ? {
    labels: result.daily.map(d => d.date),
    datasets: [{
      label: "Temperature (°C)",
      data: result.daily.map(d => d.temperature),
      borderColor: "#5da8ff",
      backgroundColor: "rgba(93,168,255,0.2)",
      fill: true,
      tension: 0.3,
      pointRadius: 3
    }]
  } : null

  const labels = ["Very Hot", "Very Cold", "Very Wet", "Very Uncomfortable"]
  const probData = result ? [
    result.veryHotProbability ?? 0,
    result.veryColdProbability ?? 0,
    result.veryWetProbability ?? 0,
    result.veryUncomfortableProbability ?? 0
  ] : [0,0,0,0]

  return (
    <div className="app-root">
     <header className="header">
  <motion.div 
    className="brand" 
    initial={{ scale: 0.9, opacity: 0 }} 
    animate={{ scale: 1, opacity: 1 }} 
    transition={{ duration: 0.8 }}
  >
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" 
      alt="NASA logo" 
      className="logo-img"
    />
    <div>
      <span className="logo-dot" />
      <h1>
        Will It Rain On My Parade?<br/>
      </h1>
    </div>
  </motion.div>
</header>


      <main className="container">
        {/* Form */}
        <motion.section className="card" data-aos="fade-up">
          <form onSubmit={handleSubmit} className="form">
            <div className="field-group" ref={searchRef}>
              <label className="label"><MapPin size={16} /> Location</label>
              <div className="input-wrap">
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter a city, place, address..."
                  value={location.name}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => setShowSuggestions(suggestions.length > 0)}
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions">
                  {suggestions.map((s, i) => (
                    <button
                      type="button"
                      key={`${s.place_id}-${i}`}
                      className="suggestion"
                      onClick={() => handleSuggestionSelect(s)}
                      title={s.display_name}
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="field">
              <label className="label"><Calendar size={16} /> Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={getMinDate()} max={getMaxDate()} />
            </div>

            <div className="actions">
              <motion.button className="btn-primary" disabled={loading}>
                {loading ? <><Loader2 className="spin" size={16} /> Loading...</> : "Check Weather Odds"}
              </motion.button>
            </div>
          </form>
        </motion.section>

        {/* Map */}
        <motion.section className="card" data-aos="zoom-in">
          <div className="map-wrap">
            <MapContainer center={markerPosition} zoom={location.latitude ? 10 : 5} style={{ height: "100%", width: "100%" }} key={JSON.stringify(markerPosition)}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              <Marker position={markerPosition}>
                <Popup>{location.name || "Click on map to select"}</Popup>
              </Marker>
              <MapClickHandler onLocationSelect={handleMapClick} />
            </MapContainer>
          </div>
        </motion.section>

        {/* Results */}
        {result && !result.error && (
          <motion.section className="card" data-aos="fade-up">
            <h2 className="card-title">Results</h2>

      

            {/* Infos */}
            <div className="grid">
              <div className="info">
                <p><strong>📍 Location:</strong> {result.location}</p>
                <p><strong>🗓 Period:</strong> {result.reference_period} ({result.reference_days_used} days)</p>
                <p><strong>🌐 Coords:</strong> {result.latitude}, {result.longitude}</p>
              </div>
              <div className="stats">
                <div className="stat"><ThermometerSun /> <span>Temp</span><strong>{result.mean_temperature_C}°C</strong></div>
                <div className="stat"><Droplets /> <span>Humidity</span><strong>{result.mean_humidity_percent}%</strong></div>
                <div className="stat"><CloudRain /> <span>Precip</span><strong>{result.mean_rain_mm} mm</strong></div>
              </div>
            </div>

            {/* Probabilités texte */}
            <div className="prob-text">
              {labels.map((label, i) => {
                const p = probData[i] ?? 0
                const lvl = riskLevel(p)
                return (
                  <div key={label} className={`prob-chip ${lvl}`}>
                    <span className="prob-emoji">{riskEmoji(label)}</span>
                    <span className="prob-label">{label}</span>
                    <span className="prob-value">{p}%</span>
                    <span className="prob-note">
                      {lvl === "danger" ? "High likelihood" : lvl === "warn" ? "Moderate" : "Low"}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Tips */}
            <div className="tips">
              {result.veryHotProbability >= 70 && (
                <div className="tip tip-hot">🔥 Warning: high heat expected.</div>
              )}
              {result.veryColdProbability >= 70 && (
                <div className="tip tip-cold">❄️ Risk of intense cold.</div>
              )}
              {result.veryWetProbability >= 70 && (
                <div className="tip tip-wet">🌧️ High chance of rain.</div>
              )}
              {result.veryUncomfortableProbability >= 70 && (
                <div className="tip tip-humid">💦 Uncomfortable humid conditions.</div>
              )}
              {result.veryHotProbability < 40 && result.veryColdProbability < 40 && result.veryWetProbability < 40 && (
                <div className="tip tip-nice">🌤️ Overall good conditions!</div>
              )}
            </div>


            {/* Line Chart */}
            {lineData && (
              <div className="chart-card">
                <h3>Temperature trend (±7 days around selected date, last year)</h3>
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: false } }
                  }}
                />
              </div>
            )}
             {/* Export */}
            <div className="export-actions">
              <button className="btn-primary" onClick={() => downloadJSON(result)}>⬇ JSON</button>
              <button className="btn-primary" onClick={() => downloadCSV(result.daily)}>⬇ CSV</button>
            </div>
          </motion.section>
        )}

        {error && <div className="card error">{error}</div>}
      </main>
      <p className="subtitle" style={{ textAlign: "center" }}>By AKKAL Abdelkrim & AIDEL Massinissa & CHERADI Wissam</p>
      <footer className="footer">NASA Space Apps Challenge 2025</footer>
    </div>
  )
}
