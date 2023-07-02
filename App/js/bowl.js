const FEED_BUTTON = document.querySelector("#feed");
const BOWL = document.querySelector("#bowl");
const AUDIO = document.querySelector("#feed-audio");
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
  feed: "./assets/images/feed-play-icon.png",
  halt: "./assets/images/feed-pause-icon.png",
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
    this.feeding_rate = 20;
    this.capacity = 20;
    //  inerente ao alimentador
    this.state = bowl_states.halted;
    this.interval = null;
  }
  feed() {
    // aqui vem o api pra pegar valor do simulador
    let bowl_image = BOWL.querySelector("img");
    let feed_button_image = FEED_BUTTON.querySelector("img");
    let bark = AUDIO.querySelector("#bark");
    let pour_food = AUDIO.querySelector("#pour-food");

    this.updateCapacity();
    this.interval = setInterval(this.updateCapacity.bind(this), 1000);

    bowl_image.src = bowl_icons.bowl_full;
    feed_button_image.src = feed_icons.halt;
    playSound(bark);
    playSoundIndefinitely(pour_food);

    // create a div or change opacity of image
    // make a sound
    // add text saying who you feeding
    //  update according to state
  }
  updateCapacity() {
    this.capacity += this.feeding_rate;
    CAPACITY_DISPLAY.textContent = `Capacity ${this.capacity}`;
  }
  stopUpdateCapacity() {
    clearInterval(this.interval);
  }
  halt() {
    // aqui vem api pra atualizar capacidade do thingspeak
    // idem
    let bowl_image = BOWL.querySelector("img");
    let feed_button_image = FEED_BUTTON.querySelector("img");
    let meow = AUDIO.querySelector("#meow");
    let pour_food = AUDIO.querySelector("#pour-food");

    pour_food.pause();

    this.stopUpdateCapacity();

    bowl_image.src = bowl_icons.bowl_empty;
    feed_button_image.src = feed_icons.feed;
    playSound(meow);
  }

  MEF_bowl(input) {
    switch (this.state) {
      case bowl_states.halted:
        if (input === bowl_inputs.feed) {
          this.state = bowl_states.feeding;
          this.feed();
          // aqui ordem da funcao importa pois indica qual vai ser estado atualizado
          // talvez poderia dar um nome diferente como update criar uma funcao feed e outra updateState()
          // mas ai sugou
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

CAPACITY_DISPLAY.textContent = `Capacity ${feeding_screen.capacity}`;

FEED_BUTTON.addEventListener("click", () => {
  feeding_screen.MEF_bowl(feed_input);
  feed_input = (feed_input + 1) % 2;
});
