const meal_icons = {
  meal_breakfast: "../../assets/images/breakfast-icon.png",
  meal_lunch: "../../assets/images/lunch-icon.png",
  meal_dinner: "../../assets/images/dinner-icon.png",
};

// fazer comportamento dos botoes aqui?

// what should happen if i leave this screen, should i reset all states or leave it be
// maybe for this one i dont need to reset but for the other two i should

const inputs = {
  last: 0,
  next: 1,
};

const states = {
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

    this.state = states.breakfast;
  }
  forward() {
    // create a div or change opacity of image
    // make a sound
    // add text saying who you feeding
    //  update according to state
    //  talvez criar uma funcao update aqui dentro
  }
  backward() {
    // idem
  }

  // poderia fazer uma maquina de estados mais geral com um ciclo for que a partir de uma variavel
  // que armazena a quantidade de refeicoes setadas pode verificar o input e ir para a proxima
  // para isso precisaria de um metodo para criar um novo horario e nomear ele ou nao que seria inserido
  // na variavel states e seria instanciado como uma Meal que entraria na rotacao de refeicoes
  // precisaria tambem entao ter um destruidor para a refeicao sendo o limite minimo de apenas uma
  // mas ai se removesse ia ter que atualizar todas as posicoes do dicionario ou seria melhor que fosse um array
  // organizado por hora e minuto para poder pegar sua posicao no vetor direto, mas sugou

  //   o que acontece quando muda de estado aqui, deveria eu fazer igual a transicao de telas/screens
  //   do html usando uma classe second-active ou posso simplesmente mudar os conteudos usanod querySelcetor
  //   que eu acho ser mais apropriado dado que todos vao ser forma identica e por isso o ultimo procedimento

  MEF_schedule(input) {
    switch (this.state) {
      case states.breakfast:
        if (input === inputs.last) {
          this.state = states.dinner;
          this.backward();
        }

        if (input === inputs.next) {
          this.state = states.lunch;
          this.forward();
        }
        break;

      case states.lunch:
        if (input === inputs.last) {
          this.state = states.breakfast;
          this.backward();
        }

        if (input === inputs.next) {
          this.state = states.dinner;
          this.forward();
        }
        break;

      case states.dinner:
        if (input === inputs.last) {
          this.state = states.lunch;
          this.backward();
        }

        if (input === inputs.next) {
          this.state = states.breakfast;
          this.forward();
        }
        break;

      default:
        this.state = states.breakfast;
    }
  }
}
