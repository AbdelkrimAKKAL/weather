# 🌦️ Will It Rain On My Parade?

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA Logo" width="120"/>
</p>

**Project submitted for the 2025 NASA Space Apps Challenge – Paris**  
📅 October 4–5, 2025  
🏫 Team from **ESGI (École Supérieure de Génie Informatique)**  

---

link: https://weatherchallengeparis.netlify.app/

## 📖 Summary

Planning an outdoor activity like a vacation, hiking trip, or a parade?  
**Will It Rain On My Parade?** is a web application that helps you know the **likelihood of extreme or inconvenient weather conditions** for any location and date.  

The application leverages **NASA Earth observation data** to estimate probabilities of:  
- 🔥 Very Hot  
- ❄️ Very Cold  
- 🌧️ Very Wet  
- 💦 Very Uncomfortable (heat + humidity)  

Unlike traditional forecasts, our solution provides **historical data analysis** for ±7 days around the selected date **from the previous year**, helping users anticipate conditions far in advance.

---

## 🌍 Background

Everyone wants good weather for outdoor activities.  
However, weather is unpredictable and many apps only provide forecasts for 1–2 weeks ahead.  

NASA has collected decades of global Earth observation data, including:  
☁️ cloud cover – 🌡️ temperature – ❄️ snow depth – 💨 wind speed – 🌧️ rainfall – 🌫️ dust concentration  

By analyzing this data, we can estimate:  
- The probability of extreme events (heatwaves, storms, humidity discomfort)  
- Seasonal trends and averages for a chosen date and location  
- User-friendly visualizations and downloadable insights  

---

## 🎯 Objectives

Our main goal was to create a **personalized dashboard** where users can:  

✅ Select a **location** on an interactive map  
✅ Pick a **date** in the future  
✅ Get probabilities for extreme weather conditions  
✅ View a **15-day temperature trend** (±7 days around the same date in the previous year)  
✅ Export results in **CSV** and **JSON** format  

---

## ⚙️ Features

- 🗺️ **Interactive Map (Leaflet)**  
  Click or search to choose your location.  

- 📅 **Date Selection**  
  Choose a date up to one year ahead.  

- 📊 **Visualization**  
  - Line chart showing 15-day temperature variations from NASA POWER API.  
  - Textual probability indicators with icons (🔥 ❄️ 🌧️ 💦).  
  - "Tips" section with warnings or encouragements depending on conditions.  

- 📥 **Export Options**  
  Download results in JSON or CSV.  

- 🎨 **Modern UI/UX**  
  Built with **React, Chart.js, Framer Motion, and AOS** for animations.  

---

## 🛠️ Tech Stack

**Frontend (React + Vite)**  
- React 18  
- Leaflet (interactive maps)  
- Chart.js (data visualization)  
- Framer Motion & AOS (animations)  
- Deployed on **Netlify**  

**Backend (Node.js + Express)**  
- Express.js API  
- node-fetch for NASA POWER API requests  
- Custom weather probability calculation logic  
- Deployed on **Render**  

**Data Source**  
- 🌐 [NASA POWER API](https://power.larc.nasa.gov/)  

---

## 🚀 Deployment

- **Frontend (React)** → [Netlify Hosting](https://www.netlify.com/)  
- **Backend (Express API)** → [Render Hosting](https://render.com/)  


---

## 👨‍💻 Authors

Developed by team **ESGI Paris** for NASA Space Apps Challenge 2025:  

- **Aidel Massinissa**  
- **Akkal Abdelkrim**  
- **Cheradi Wissam**  

---

## 📅 Event Information

- 🛰️ **NASA Space Apps Challenge 2025**  
- 📍 Paris, France  
- 📆 October 4–5, 2025  
- 🎓 Representing **ESGI (École Supérieure de Génie Informatique)**  

---

## 📜 License

This project was developed as part of the NASA Space Apps Challenge.  
Educational and research use only.  

---

