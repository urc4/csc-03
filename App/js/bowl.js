const FEED_BUTTON = document.querySelector("#feed-button");
const BOWL = document.querySelector("#bowl");
const AUDIO_FEED = document.querySelector("#feed-audio");
const CAPACITY_DISPLAY = document.querySelector("#capacity-display");

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

const bowl_icons = {
  bowl_empty: "./assets/images/bowl-empty-icon.png",
  bowl_full: "./assets/images/bowl-full-icon.png",
};

const feed_icons = {
  feed: "play_arrow",
  halt: "pause",
};

const bowl_inputs = {
  halt: 0,
  feed: 1,
};

const bowl_states = {
  halted: 0,
  feeding: 1,
};

class Bowl {
  constructor() {
    this.feeding_rate = 5;
    this.capacity = 0;
    //  inerente ao alimentador
    this.state = bowl_states.halted;
    this.interval = null;
  }
  feed() {
    // aqui vem o api pra pegar valor do simulador
    let bowl_image = BOWL.querySelector("img");
    let bark = AUDIO_FEED.querySelector("#bark");
    let btn_click = document.querySelector("#btn-click");
    let pour_food = AUDIO_FEED.querySelector("#pour-food");

    this.updateCapacity();
    this.interval = setInterval(this.updateCapacity.bind(this), 1000);

    document.querySelector("#zeus").textContent = `Feeding Zeus`;
    bowl_image.src = bowl_icons.bowl_full;
    FEED_BUTTON.textContent = feed_icons.halt;

    playSound(bark);
    playSound(btn_click);
    playSoundIndefinitely(pour_food);

    // create a div or change opacity of image
    // make a sound
    // add text saying who you feeding
    //  update according to state
  }
  updateCapacity() {
    this.capacity += this.feeding_rate;
    CAPACITY_DISPLAY.textContent = `Quantity ${this.capacity} g`;
  }
  stopUpdateCapacity() {
    clearInterval(this.interval);
  }
  halt() {
    // aqui vem api pra atualizar capacidade do thingspeak
    // idem
    let bowl_image = BOWL.querySelector("img");
    let btn_click = document.querySelector("#btn-click");
    let meow = AUDIO_FEED.querySelector("#meow");
    let pour_food = AUDIO_FEED.querySelector("#pour-food");

    pour_food.pause();

    this.stopUpdateCapacity();

    this.sendQuantityToThingSpeak(this.capacity);

    this.capacity = 0;

    document.querySelector("#zeus").textContent = `Feed Zeus`;
    bowl_image.src = bowl_icons.bowl_empty;
    FEED_BUTTON.textContent = feed_icons.feed;
    playSound(meow);
    playSound(btn_click);
  }

  sendQuantityToThingSpeak(quantity) {
    const writeKey = "KJ40SS6RMVZLTNPU";
    const channelID = "2217645";
    const url = `https://api.thingspeak.com/update?api_key=${writeKey}&field1=0&field2=0&field3=0&field4=0&field5=${quantity}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("Quantity sent to ThingSpeak:", quantity);
        console.log("Response:", data);
      })
      .catch((error) => {
        console.error("Error sending quantity to ThingSpeak:", error);
      });
  }

  MEF_bowl(input) {
    switch (this.state) {
      case bowl_states.halted:
        if (input === bowl_inputs.feed) {
          this.state = bowl_states.feeding;
          this.feed();
        }
        break;
      case bowl_states.feeding:
        if (input === bowl_inputs.halt) {
          this.halt();
          this.state = bowl_states.halted;
        }
        break;
      default:
        this.state = bowl_states.halted;
    }
  }
}

const feeding_screen = new Bowl();
let feed_input = bowl_inputs.feed;

CAPACITY_DISPLAY.textContent = `Quantity ${feeding_screen.capacity}`;

FEED_BUTTON.addEventListener("click", () => {
  feeding_screen.MEF_bowl(feed_input);
  feed_input = (feed_input + 1) % 2;
});
