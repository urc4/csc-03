function showScreen(screenId) {
  let screens = document.getElementsByClassName("screen");
  for (let i = 0; i < screens.length; i++) {
    screens[i].classList.remove("active");
  }
  let targetScreen = document.getElementById(screenId);
  targetScreen.classList.add("active");
}
