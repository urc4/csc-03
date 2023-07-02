const MEAL = document.querySelector("#meal-card");
const LAST_BUTTON = document.querySelector("#backward");
const NEXT_BUTTON = document.querySelector("#forward");

function playSoundOnce(audio) {
  audio.play();
  audio.removeEventListener("ended", playSoundOnce);
}

function playSound(audio) {
  audio.addEventListener("ended", playSoundOnce);
  playSoundOnce(audio);
}

function playSoundIndefinitely(audio) {
  audio.play();
}

const meal_inputs = {
  last: 0,
  next: 1,
};

const meal_states = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
};

class Meal {
  constructor(time = { hours: 8, minutes: 30 }) {
    this.weight = 100;
    this.time = {
      hours: time.hours,
      minutes: time.minutes,
    };
  }

  updateTime(time_set) {
    this.time.hours = time_set.hours;
    this.time.minutes = time_set.minutes;
  }

  updateAmount(weight) {
    this.weight = weight;
  }
}

class Schedule {
  constructor() {
    this.breakfast = new Meal();
    this.lunch = new Meal({ hours: 12, minutes: 15 });
    this.dinner = new Meal({ hours: 18, minutes: 45 });

    this.state = meal_states.breakfast;
  }

  display(meal) {
    switch (meal) {
      case meal_states.breakfast:
        MEAL.querySelector(
          "#scheduled-time"
        ).textContent = `${this.breakfast.time.hours}:${this.breakfast.time.minutes}`;
        MEAL.querySelector(
          "#scheduled-quantity"
        ).textContent = `${this.breakfast.weight} g`;
        break;
      case meal_states.lunch:
        MEAL.querySelector(
          "#scheduled-time"
        ).textContent = `${this.lunch.time.hours}:${this.lunch.time.minutes}`;
        MEAL.querySelector(
          "#scheduled-quantity"
        ).textContent = `${this.lunch.weight} g`;
        break;
      case meal_states.dinner:
        MEAL.querySelector(
          "#scheduled-time"
        ).textContent = `${this.dinner.time.hours}:${this.dinner.time.minutes}`;
        MEAL.querySelector(
          "#scheduled-quantity"
        ).textContent = `${this.dinner.weight} g`;
        break;
      default:
        break;
    }
  }

  MEF_schedule(input) {
    switch (this.state) {
      case meal_states.breakfast:
        if (input === meal_inputs.last) {
          this.display(meal_states.dinner);
          this.state = meal_states.dinner;
        }

        if (input === meal_inputs.next) {
          this.display(meal_states.lunch);
          this.state = meal_states.lunch;
        }
        break;

      case meal_states.lunch:
        if (input === meal_inputs.last) {
          this.display(meal_states.breakfast);
          this.state = meal_states.breakfast;
        }

        if (input === meal_inputs.next) {
          this.display(meal_states.dinner);
          this.state = meal_states.dinner;
        }
        break;

      case meal_states.dinner:
        if (input === meal_inputs.last) {
          this.display(meal_states.lunch);
          this.state = meal_states.lunch;
        }

        if (input === meal_inputs.next) {
          this.display(meal_states.breakfast);
          this.state = meal_states.breakfast;
        }
        break;

      default:
        this.state = meal_states.breakfast;
        break;
    }
  }
}

const schedule_screen = new Schedule();

MEAL.querySelector(
  "#scheduled-time"
).textContent = `${schedule_screen.breakfast.time.hours}:${schedule_screen.breakfast.time.minutes}`;
MEAL.querySelector(
  "#scheduled-quantity"
).textContent = `${schedule_screen.breakfast.weight} g`;

LAST_BUTTON.addEventListener("click", () => {
  schedule_screen.MEF_schedule(meal_inputs.last);
  let btn_click = document.querySelector("#btn-click");
  playSound(btn_click);
});

NEXT_BUTTON.addEventListener("click", () => {
  schedule_screen.MEF_schedule(meal_inputs.next);
  let btn_click = document.querySelector("#btn-click");
  playSound(btn_click);
});
