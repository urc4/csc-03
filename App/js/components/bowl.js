const bowl_icons = {
  bowl_empty: "../../assets/images/bowl-empty-icon.png",
  bowl_full: "../../assets/images/bowl-full-icon.png",
};

// fazer comportamento dos botoes aqui?

const inputs = {
  halt: 0,
  feed: 1,
};

const states = {
  halted: 0,
  feeding: 1,
};

class Bowl {
  constructor() {
    this.feeding_rate = 20;
    //  inerente ao alimentador
    this.state = states.halted;
  }
  feed() {
    // create a div or change opacity of image
    // make a sound
    // add text saying who you feeding
    //  update according to state
  }
  halt() {
    // idem
  }

  MEF_bowl(input) {
    switch (this.state) {
      case states.halted:
        if (input === inputs.feed) {
          this.state = states.feeding;
          this.feed();
          // aqui ordem da funcao importa pois indica qual vai ser estado atualizado
          // talvez poderia dar um nome diferente como update criar uma funcao feed e outra updateState()
          // mas ai sugou
        }
        break;
      case states.calling:
        if (input === inputs.halt) {
          this.halt();
          this.state = states.halted;
        }
        break;
      default:
        this.state = states.halted;
    }
  }
}
