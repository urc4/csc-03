const FEED_BUTTON = document.querySelector("#feed");
const BOWL = document.querySelector("#bowl");
const AUDIO = document.querySelector("#feed-audio");

function playSoundOnce(audio) {
  audio.play();
  audio.removeEventListener("ended", playSoundOnce);
}

function playSound(audio) {
  audio.addEventListener("ended", playSoundOnce);
  playSoundOnce(audio);
}

const bowl_icons = {
  bowl_empty: "./assets/images/bowl-empty-icon.png",
  bowl_full: "./assets/images/bowl-full-icon.png",
};

const feed_icons = {
  feed: "./assets/images/feed-play-icon.png",
  halt: "./assets/images/feed-pause-icon.png",
};

// fazer comportamento dos botoes aqui?
// maybe should look at the capcaity left in the bowl so i can stop feeding automatically

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
    //  inerente ao alimentador
    this.state = bowl_states.halted;
  }
  feed() {
    let bowl_image = BOWL.querySelector("img");
    let feed_button_image = FEED_BUTTON.querySelector("img");
    let bark = AUDIO.querySelector("#bark");

    bowl_image.src = bowl_icons.bowl_full;
    feed_button_image.src = feed_icons.halt;
    playSound(bark);

    // create a div or change opacity of image
    // make a sound
    // add text saying who you feeding
    //  update according to state
  }
  halt() {
    // idem
    let bowl_image = BOWL.querySelector("img");
    let feed_button_image = FEED_BUTTON.querySelector("img");
    let meow = AUDIO.querySelector("#meow");

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

FEED_BUTTON.addEventListener("click", () => {
  feeding_screen.MEF_bowl(feed_input);
  feed_input = (feed_input + 1) % 2;
});
