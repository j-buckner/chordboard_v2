import React, { Component } from 'react';
import autoBind from 'react-autobind';
import './App.css';


var Tone = require("tone");
var synth = new Tone.PolySynth(12, Tone.Synth).toMaster();
synth.set({
  "oscillator" : {
    "type" : "sine",
  },
  "envelope" : {
    "attack" : 0.5,
    "decay" : 1,
    "sustain" : 0.5,
    "release" : 0.4,
  }
});

Tone.Transport.bpm.value = 120;
Tone.Transport.loopEnd = "4m";

var noteLookup = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5"];
var noteLookupDisplay = ["C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B", "C"];

const progressions = [
  {
    "display": ["I", "IV", "V", "I"],
    "notes":   [
      ["C4", "E4", "G4"], ["F4", "A4", "C4"], ["G4", "B4", "D4"], ["C4", "E4", "G4"]
    ]
  },
  {
    "display": ["I", "V", "IV", "I"],
    "notes":   [
      ["C4", "E4", "G4"], ["G4", "B4", "D4"], ["F4", "A4", "C4"], ["C4", "E4", "G4"]
    ]
  },
  {
    "display": ["I", "V", "vi", "IV"],
    "notes":   [
      ["C4", "E4", "G4"], ["G4", "B4", "D4"], ["A4", "C4", "E4"], ["F4", "A4", "C4"]
    ]
  },
  {
    "display": ["iii", "VI", "ii", "V"],
    "notes":   [
      ["E4", "G4", "B4"], ["A4", "C4", "E4"], ["D4", "F4", "A4"], ["G4", "B4", "D4"]
    ]
  },
  {
    "display": ["I", "vi", "IV", "V"],
    "notes":   [
      ["C4", "E4", "G4"], ["A4", "C4", "E4"], ["F4", "A4", "C4"], ["G4", "B4", "D4"]
    ]
  },
  {
    "display": ["I", "vi", "ii", "V"],
    "notes":   [
      ["C4", "E4", "G4"], ["A4", "C4", "E4"], ["D4", "F4", "A4"], ["G4", "B4", "D4"]
    ]
  },
  {
    "display": ["I", "IV", "ii", "V"],
    "notes":   [
      ["C4", "E4", "G4"], ["F4", "A4", "C4"], ["D4", "F4", "A4"], ["G4", "B4", "D4"]
    ]
  }
];


var colors = {
  disabled: "#363c4f",
  enabled: "#891b1b",
  playing: "yellow"
}

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      'notes': [[], [], [], []],
      'progression': [[], [], [], []]
    }

    this.reqFrame = null;

    autoBind(this);
  }

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="pure-g button-menu"> 
            <div className="pure-u-1-3">
              <button className="pure-button button-start" onClick={this.start}>Start</button>
              <button className="pure-button button-stop" onClick={this.stop}>Stop</button>
              {this.renderProgressions()}
            </div>
          </div>
          <hr/>
          <div className="tone-box-container">
            {this.renderChords()}
            <div id="Bar"></div>
            {this.renderToneBoxes()}
          </div>
        </div>
      </div>
    );
  }

  progressLoop() {
    this.reqFrame = requestAnimationFrame(this.progressLoop);

    let progress = ((Tone.Transport.seconds / (Tone.Transport.loopEnd + 2.5))) + 0.15;
    document.getElementById('Bar').style.left = (progress * 100).toFixed(2) + "%";
  }

  renderProgressions() {
    const rows = [];
    rows.push(<option value="0" key="0">Select Progression</option>);
    for (const [i, progression] of progressions.entries()) {
      rows.push(
        <option value={i + 1} key={i + 1}>{progression["display"].join('-')}</option>
      );
    }

    return (
      <select onChange={this.loadProgression}>
        {rows}
      </select>
    )
  }

  renderChords() {

    const chordProgressionRows = this.state.progression.map((numeral, i) => {
      return (<div key={i} className="pure-u-1-5 tone-box box-top" data-measure={i}>{numeral}</div>);
    });

    return (
      <div className="pure-g">
        <div className="pure-u-1-8"></div>
        {chordProgressionRows}
      </div>
      )
  }

  renderToneBoxes() {
    return [...Array(13)].map((_, i) => {

      let styleRight = (i === 12) ? {'borderRadius': '0px 0px 15px 0px'} : {};
      let styleLeft = (i === 0) ? {'borderRadius': '15px 0px 0px 0px'} : {};
      styleLeft = (i === 12) ? {'borderRadius': '0px 0px 0px 15px'} : styleLeft;
      
      return (
        <div key={i} data-index={12-i} className="pure-g">
          <div className="pure-u-1-8 tone-box left" style={styleLeft}>{noteLookupDisplay[12-i]}</div>
          <div id={1+'-'+noteLookup[12-i]} className="pure-u-1-5 tone-box" data-measure={1} onClick={this.hitTone}></div>
          <div id={2+'-'+noteLookup[12-i]} className="pure-u-1-5 tone-box" data-measure={2} onClick={this.hitTone}></div>
          <div id={3+'-'+noteLookup[12-i]} className="pure-u-1-5 tone-box" data-measure={3} onClick={this.hitTone}></div>
          <div id={4+'-'+noteLookup[12-i]} className="pure-u-1-5 tone-box" style={styleRight} data-measure={4} onClick={this.hitTone}></div>
        </div>
      )
    });
  }

  loadProgression(e) {
    const progressionIndex = parseInt(e.target.value, 10) - 1;
    if (progressionIndex === -1 ) return;

    const notes = progressions[progressionIndex]['notes'];
 
    this.setNotes(notes);
    this.colorNotes(notes);


    this.setState({
      'notes': notes, 
      'progression': progressions[progressionIndex]['display']
    });
  }

  hitTone(e) {
    let index = e.target.parentElement.dataset.index;
    let measure = e.target.dataset.measure - 1;

    var pitch = noteLookup[index];
    if (this.state.notes[measure].includes(pitch)) {
      let newNotes = this.state.notes;
      newNotes[measure] = this.state.notes[measure].filter(e => e !== pitch);
      this.setState({notes: newNotes});
      e.target.style.backgroundColor = colors['disabled'];
    } else {
      e.target.style.backgroundColor = colors['enabled'];
      this.state.notes[measure].push(pitch);
    }

    this.setNotes(this.state.notes);
  }

  setNotes(notes) {
    Tone.Transport.cancel();
    for (let i = 0; i < 5; i++) {
      if (notes.length === 0) continue;      
      Tone.Transport.schedule(function(time){
        if (i === 4) { 
          Tone.Transport.stop();
        } else {
          synth.triggerAttackRelease(notes[i], "1m");
        }
        console.log(i);
        this.initDraw(time, i, notes);
      }.bind(this), i + "m");
    }
  }

  colorNotes(newNotes) {
    const { notes } = this.state;
    
    // Clear out notes and color in new ones
    [1, 2, 3, 4].forEach((i) => {
      for (const note of notes[i - 1]) {
        document.getElementById(i + '-' + note).style.backgroundColor = colors['disabled'];
      }

      for (const note of newNotes[i - 1]) {
        document.getElementById(i + '-' + note).style.backgroundColor = colors['enabled'];
      }

    });
  }

  initDraw(time, i, notes) {
    Tone.Draw.schedule(function(time){
      if (i === 4) {
        notes[i - 1].forEach((note) => {
          document.getElementById(i + '-' + note).style.backgroundColor = colors['enabled'];
        });

        return;
      }

      notes[i].forEach((note) => {
        if (i === notes.length) {
          document.getElementById(i+1 + '-' + note).style.backgroundColor = colors['disabled'];
        } else {
          document.getElementById(i+1 + '-' + note).style.backgroundColor = colors['playing'];
        }
      });

      if (i > 0) {
        notes[i - 1].forEach((note) => {
          document.getElementById(i + '-' + note).style.backgroundColor = colors['enabled'];
        });
      }

    }, time);
  }

  notesAreEmpty() {
    const { notes } = this.state;
    return notes.filter(n => n.length !== 0).length === 0;
  }

  start() {
    if (this.notesAreEmpty()) return; 

    Tone.Transport.start();
    this.reqFrame = requestAnimationFrame(this.progressLoop);
  }

  stop() {
    Tone.Transport.stop();
    cancelAnimationFrame(this.reqFrame);
    this.colorNotes(this.state.notes);
    document.getElementById('Bar').style.left = "0%";
  }
}

export default App;
