const CALL_BUTTON = document.querySelector("#call-button");
const AUDIO_CALL = document.querySelector("#call-audio");

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

const call_icons = {
  call_green: "call",
  hang_red: "call_end",
};

const call_inputs = {
  hang: 0,
  call: 1,
};

const call_states = {
  hung: 0,
  calling: 1,
};

class Telephone {
  constructor() {
    this.own_number = "(61) 99389-7783";
    this.vet_number = "(61) 99389-7785";
    this.state = call_states.hung;
  }
  call() {
    let dial = AUDIO_CALL.querySelector("#dial");
    let hang = AUDIO_CALL.querySelector("#hangup");

    let btn_click = document.querySelector("#btn-click");

    document.querySelector("#doc").textContent = `Calling Doc`;
    CALL_BUTTON.textContent = call_icons.hang_red;

    CALL_BUTTON.style.backgroundColor = "red";

    hang.pause();

    playSound(btn_click);
    playSoundIndefinitely(dial);
  }
  hang() {
    let dial = AUDIO_CALL.querySelector("#dial");

    let hang = AUDIO_CALL.querySelector("#hangup");
    let btn_click = document.querySelector("#btn-click");

    document.querySelector("#doc").textContent = `Call Doc`;
    CALL_BUTTON.textContent = call_icons.call_green;

    CALL_BUTTON.style.backgroundColor = "green";

    dial.pause();

    playSound(btn_click);
    playSound(hang);
  }

  MEF_telephone(input) {
    switch (this.state) {
      case call_states.hung:
        if (input === call_inputs.call) {
          this.call();

          this.state = call_states.calling;
        }
        break;
      case call_states.calling:
        if (input === call_inputs.hang) {
          this.hang();

          this.state = call_states.hung;
        }
        break;
      default:
        this.state = call_states.hung;
    }
  }
}

const calling_screen = new Telephone();
let call_input = call_inputs.call;

CALL_BUTTON.addEventListener("click", () => {
  calling_screen.MEF_telephone(call_input);
  call_input = (call_input + 1) % 2;
});
