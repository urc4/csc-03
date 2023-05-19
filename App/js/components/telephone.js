const call_icons = {
  call_green: "../../assets/images/call-green-icon.png",
  hang_red: "../../assets/images/call-red-icon.png",
};

const inputs = {
  hang: 0,
  call: 1,
};

const states = {
  hung: 0,
  calling: 1,
};

class Telephone {
  constructor() {
    this.own_number = "(61) 99389-7783";
    this.vet_number = "(61) 99389-7785";
    this.state = states.hung;
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
      case states.hung:
        if (input === inputs.call) {
          this.call();
          this.state = states.calling;
        }
        break;
      case states.calling:
        if (input === inputs.hang) {
          this.hang();
          this.state = states.hung;
        }
        break;
      default:
        this.state = states.hung;
    }
  }
}
