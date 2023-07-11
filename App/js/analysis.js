const GRAPH = document.querySelector(".analysis-card");
const LAST_BUTTON_ANALYSIS = document.querySelector("#backward-analysis");
const NEXT_BUTTON_ANALYSIS = document.querySelector("#forward-analysis");

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

const graph_inputs = {
  last: 0,
  next: 1,
};

const graph_states = {
  week: 0,
  month: 1,
  semester: 2,
};

class Graph {
  constructor(time = 7) {
    this.time = time;
  }

  updateTime(time_set) {
    this.time = time_set;
  }
}

class Analysis {
  constructor() {
    this.week = new Graph();
    this.month = new Graph(30);
    this.semester = new Graph(180);

    this.state = graph_states.week;
  }

  display(graph) {
    let total = document.querySelector("#total");
    let nutrient = document.querySelector("#nutrient");

    switch (graph) {
      case graph_states.week:
        GRAPH.querySelector(
          "#graph-text"
        ).textContent = `Last ${this.week.time} days`;
        total.src = "./assets/analysis/total7.png";
        nutrient.src = "./assets/analysis/bynutrient7.png";

        break;
      case graph_states.month:
        GRAPH.querySelector(
          "#graph-text"
        ).textContent = `Last ${this.month.time} days`;
        total.src = "./assets/analysis/total30.png";
        nutrient.src = "./assets/analysis/bynutrient30.png";

        break;
      case graph_states.semester:
        GRAPH.querySelector(
          "#graph-text"
        ).textContent = `Last ${this.semester.time} days`;
        total.src = "./assets/analysis/total180.png";
        nutrient.src = "./assets/analysis/bynutrient180.png";

        break;
      default:
        break;
    }
  }

  MEF_analysis(input) {
    switch (this.state) {
      case graph_states.week:
        if (input === graph_inputs.last) {
          this.display(graph_states.semester);
          this.state = graph_states.semester;
        }

        if (input === graph_inputs.next) {
          this.display(graph_states.month);
          this.state = graph_states.month;
        }
        break;

      case graph_states.month:
        if (input === graph_inputs.last) {
          this.display(graph_states.week);
          this.state = graph_states.week;
        }

        if (input === graph_inputs.next) {
          this.display(graph_states.semester);
          this.state = graph_states.semester;
        }
        break;

      case graph_states.semester:
        if (input === graph_inputs.last) {
          this.display(graph_states.month);
          this.state = graph_states.month;
        }

        if (input === graph_inputs.next) {
          this.display(graph_states.week);
          this.state = graph_states.week;
        }
        break;

      default:
        this.state = graph_states.week;
        break;
    }
  }
}

const analysis_screen = new Analysis();

GRAPH.querySelector(
  "#graph-text"
).textContent = `Last ${analysis_screen.week.time} days`;

LAST_BUTTON_ANALYSIS.addEventListener("click", () => {
  analysis_screen.MEF_analysis(graph_inputs.last);
  let btn_click = document.querySelector("#btn-click");
  playSound(btn_click);
});

NEXT_BUTTON_ANALYSIS.addEventListener("click", () => {
  analysis_screen.MEF_analysis(graph_inputs.next);
  let btn_click = document.querySelector("#btn-click");
  playSound(btn_click);
});
