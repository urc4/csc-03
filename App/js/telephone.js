const call_icons = {
  call_green: "../../assets/images/call-green-icon.png",
  hang_red: "../../assets/images/call-red-icon.png",
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
    // update according to state
    // create a div or change opacity of image
    // make a sound
    // add text saying who you callling
  }
  hang() {
    // idem
  }

  MEF_telephone(input) {
    switch (input) {
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
