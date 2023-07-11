const MEAL = document.querySelector("#meal-card");
const LAST_BUTTON = document.querySelector("#backward-schedule");
const NEXT_BUTTON = document.querySelector("#forward-schedule");
const TIME_INPUT = document.querySelector("#scheduled-time-input");
const UPDATE_BUTTON = document.querySelector("#update-button");
const QUANTITY_INPUT = document.querySelector("#scheduled-quantity-input");
const QUANTITY_UPDATE_BUTTON = document.querySelector(
  "#quantity-update-button"
);
const TIME_UPDATE_BUTTON = document.querySelector("#time-update-button");

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

  updateQuantity(quantity) {
    switch (this.state) {
      case meal_states.breakfast:
        this.breakfast.updateAmount(quantity);
        break;
      case meal_states.lunch:
        this.lunch.updateAmount(quantity);
        break;
      case meal_states.dinner:
        this.dinner.updateAmount(quantity);
        break;
      default:
        break;
    }
    this.display(this.state);
  }

  updateTime(time) {
    const [hours, minutes] = time.split(":");
    const time_set = { hours: parseInt(hours), minutes: parseInt(minutes) };

    switch (this.state) {
      case meal_states.breakfast:
        this.breakfast.updateTime(time_set);
        break;
      case meal_states.lunch:
        this.lunch.updateTime(time_set);
        break;
      case meal_states.dinner:
        this.dinner.updateTime(time_set);
        break;
      default:
        break;
    }
    this.display(this.state);
  }

  sendToThingSpeak(field) {
    const writeKey = "KJ40SS6RMVZLTNPU";
    const channelID = "2217645";
    const field1 = field.one;
    const field2 = field.two;
    const field3 = field.three;
    const field4 = field.four;
    const field5 = field.five;
    const url = `https://api.thingspeak.com/update?api_key=${writeKey}&field1=${field1}&field2=${field2}&field3=${field3}&field4=${field4}&field5=${field5}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data sent to ThingSpeak:", field);
        console.log("Response:", data);
      })
      .catch((error) => {
        console.error("Error sending data to ThingSpeak:", error);
      });
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

  sendBreakfastToThingSpeak() {
    let field = {};
    field.one = this.breakfast.time.hours;
    field.two = this.breakfast.time.minutes;
    field.three = 0;
    field.four = 0;
    field.five = this.breakfast.weight;
    this.sendToThingSpeak(field);
  }

  sendDinnerToThingSpeak() {
    let field = {};
    field.one = 0;
    field.two = 0;
    field.three = this.dinner.time.hours;
    field.four = this.dinner.time.minutes;
    field.five = this.dinner.weight;
    this.sendToThingSpeak(field);
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

QUANTITY_UPDATE_BUTTON.addEventListener("click", () => {
  const newQuantity = parseInt(QUANTITY_INPUT.value);

  let btn_click = document.querySelector("#btn-click");
  playSound(btn_click);

  if (schedule_screen.state === meal_states.breakfast) {
    schedule_screen.breakfast.updateAmount(newQuantity);
    schedule_screen.sendBreakfastToThingSpeak();
  }
  if (schedule_screen.state === meal_states.lunch) {
    schedule_screen.lunch.updateAmount(newQuantity);
  }

  if (schedule_screen.state === meal_states.dinner) {
    schedule_screen.dinner.updateAmount(newQuantity);
    schedule_screen.sendDinnerToThingSpeak();
  }

  schedule_screen.display(schedule_screen.state);
});

TIME_UPDATE_BUTTON.addEventListener("click", () => {
  const newTime = TIME_INPUT.value;
  const [hours, minutes] = newTime.split(":").map((part) => parseInt(part));

  let btn_click = document.querySelector("#btn-click");
  playSound(btn_click);

  if (schedule_screen.state === meal_states.breakfast) {
    schedule_screen.breakfast.updateTime({ hours, minutes });
    schedule_screen.sendBreakfastToThingSpeak();
  }
  if (schedule_screen.state === meal_states.lunch) {
    schedule_screen.lunch.updateTime({ hours, minutes });
  }

  if (schedule_screen.state === meal_states.dinner) {
    schedule_screen.dinner.updateTime({ hours, minutes });
    schedule_screen.sendDinnerToThingSpeak();
  }
  schedule_screen.display(schedule_screen.state);
});
