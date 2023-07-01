// Update classes to display the correct page
function showScreen(screenId) {
  let screens = document.getElementsByClassName("screen");
  for (let i = 0; i < screens.length; i++) {
    screens[i].classList.remove("active");
  }
  let targetScreen = document.getElementById(screenId);
  targetScreen.classList.add("active");
}

// Display current hours
let currentDate = new Date();
let currentHour = currentDate.getHours();
let currentMinutes = currentDate.getMinutes();
let formattedTime =
  currentHour.toString().padStart(2, "0") +
  ":" +
  currentMinutes.toString().padStart(2, "0");

document.getElementById("current-hours").textContent = formattedTime;

function updateTime() {
  let timeDisplay = document.getElementById("current-hours");

  let timeInterval = setInterval(function () {
    currentDate = new Date();
    currentHour = currentDate.getHours();
    currentMinutes = currentDate.getMinutes();
    formattedTime =
      currentHour.toString().padStart(2, "0") +
      ":" +
      currentMinutes.toString().padStart(2, "0");
    timeDisplay.textContent = formattedTime;
  }, 60 * 1000);
}

updateTime();

// Display battery life
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateBatteryLevel(batteryLevel) {
  let icon = document.getElementById("battery-icon");

  // Update the battery level every 5 minutes
  let batteryInterval = setInterval(function () {
    // Decrease the battery level
    batteryLevel -= 1;
    if (batteryLevel < 0) {
      batteryLevel = 1;
    }
    document.getElementById("battery-life").textContent = `${batteryLevel} %`;

    // Update the icon based on the battery level
    if (batteryLevel >= 80) {
      icon.textContent = "battery_full";
    } else if (batteryLevel >= 20) {
      icon.textContent = "battery_std";
    } else if (batteryLevel < 20) {
      icon.textContent = "battery_alert";
    } else if (batteryLevel > 0) {
      icon.textContent = "battery_alert";
    } else {
      clearInterval(batteryInterval);
      icon.textContent = "battery_alert";
    }
  }, 5 * 60 * 1000);
}

let batteryLevel = getRandomInt(0, 100);
document.getElementById("battery-life").textContent = `${batteryLevel} %`;
let icon = document.getElementById("battery-icon");

if (batteryLevel >= 80) {
  icon.textContent = "battery_full";
} else if (batteryLevel >= 60) {
  icon.textContent = "battery_std";
} else if (batteryLevel >= 20) {
  icon.textContent = "battery_std";
} else if (batteryLevel > 0) {
  icon.textContent = "battery_alert";
} else {
  clearInterval(batteryInterval);
  icon.textContent = "battery_alert";
}

updateBatteryLevel(batteryLevel);
