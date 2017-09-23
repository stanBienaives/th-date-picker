var WEEKDAYS = ['D','L','M','M','J','V','S'];

var MONTHS = ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'];

var State = function State() {
  this.selected = [];
  this.availableDates = [];

  var today = new Date();
  var firstDisplayDate = today.findLastMonday(today);

  // first date is the last monday


  this.currentDate = today;


  for (var i=0; i<90;i++) {
    this.availableDates.push(firstDisplayDate.addDay(i));
  }
  this.firstSelectableDate = today;

  this.cursor = 0;
  this.displayedLines = 2;
}

State.prototype.isDateSelected = function (date) {
  var selected =  this.selected.find(function (d) {
    return d.toDateString() == date.toDateString();
  })
  return !!selected;
}

State.prototype.isDateFirstSelected = function (date) {
  if (!this.firstSelected())
    return false;

  return date.toDateString() === this.firstSelected().toDateString();
}

State.prototype.isHourSelected = function (date) {
  var selected =  this.selected.find(function (d) {
    return d.toDateString() + d.getHours() == date.toDateString() + date.getHours();
  })
  return !!selected;
}

State.prototype.isCurrentDate = function (date) {
  return this.currentDate.toDateString() == date.toDateString();
}

State.prototype.firstSelected = function () {
  return this.selected[0];
}


State.prototype.isFirst = function (date) {
  if (this.selected.length == 0)
    return false;

  return this.firstSelected().toString() == date.toString();
}

State.prototype.isSelectable = function (date) {
  return date >= this.firstSelectableDate;
}

State.prototype.displayMonth = function () {
  return MONTHS[this.firstPanelDate().getMonth()];

}

State.prototype.firstPanelDate = function () {
 return this.availableDates[this.cursor * 7 * this.displayedLines];

}

//ACTION RECORD
var Actions = {
  "TOOGLE_DATE": function (state, date) {
    var position = state.selected.map(function (d) {
      return d.getDayAndHours();
    }).indexOf(date.getDayAndHours());

    if( position === -1 ) {
      state.selected.push(date);
    } else {
      state.selected.splice(position, 1);
    }
    console.log(state.selected);
    state.currentDate = date;
    this.render(state);
  },
  "SET_CURRENT_DATE": function (state, date) {
    state.currentDate = date;
    this.render(state);
  },
  "NEXT_PANEL": function (state) {
    state.cursor += 1;
    state.currentDate = state.firstPanelDate();
    this.render(state);
  },
  "PREVIOUS_PANEL": function (state) {
    if( state.cursor == 0)
      return;

    state.cursor -= 1;
    state.currentDate = state.firstPanelDate();
    if( state.firstPanelDate() < state.firstSelectableDate)
      state.currentDate = state.firstSelectableDate;
    this.render(state);
  }
}


// DATE PICKER COMPONENT
var datePickerComponent = function () {
  this.navigatorView = new navigatorComponent();
  this.weekdaysView = new weekdaysComponent();
  this.daysView = new daysComponent();
}


datePickerComponent.prototype.render = function (state, oldState) {
  this.navigatorView.render(state, oldState, this);
  this.weekdaysView.render(state, oldState);
  this.daysView.render(state, oldState);
}


// NAVIGATOR COMPONENT
var navigatorComponent = function () {
  var wrapper = document.getElementById('cal-wrapper');
  this.container = document.createElement('div')
  this.container.className = 'cal-navigator'
  this.container.id = 'cal-navigator'
  wrapper.appendChild(this.container);
}

navigatorComponent.prototype.render = function (state, oldState, parent) {
  this.container.innerHTML = '';
  var prevButton = document.createElement('div');
  prevButton.className += ' cal-navigator-prev';
  prevButton.innerHTML = '<';
  prevButton.addEventListener("click", Actions['PREVIOUS_PANEL'].bind(parent, state));


  var nextButton = document.createElement('div');
  nextButton.className += ' cal-navigator-next';
  nextButton.innerHTML = '>';
  nextButton.addEventListener("click", Actions['NEXT_PANEL'].bind(parent, state));

  var month = document.createElement('div');
  month.className += ' cal-navigator-month';
  month.innerHTML = '<span>' +  state.displayMonth() + '<span>';

  this.container.appendChild(prevButton);
  this.container.appendChild(month);
  this.container.appendChild(nextButton);

}


//WEEKDAY COMPONENT
var weekdaysComponent = function () {
  var wrapper = document.getElementById('cal-wrapper');
  this.container = document.createElement('div')
  this.container.className = 'cal-weekdays'
  this.container.id = 'cal-weekdays'
  wrapper.appendChild(this.container);

}

weekdaysComponent.prototype.render =function(state, oldState) {

  this.container.innerHTML = '';
  appendColumnsHelper(this.container, state.availableDates.slice(0,7),  function build(weekDay , date) {
    weekDay.className = 'cal-weekday';
    weekDay.innerText = WEEKDAYS[date.getDay()];
  });


}

// HOURS COMPONENT
var hoursComponent = function (state) {
  var wrapper = document.getElementById('cal-wrapper');
  this.container =  document.createElement('div');
  this.container.id = 'cal-hours';
  this.container.className = 'cal-hours';
  wrapper.appendChild(this.container);
};

hoursComponent.prototype.render = function(state, oldState) {

  this.container.innerHTML = '';

  this.silos = [];
  for(var i=0; i < 3; i++) {
    var silo = document.createElement('div');
    silo.className = 'cal-hour-silo';
    this.container.appendChild(silo);
    this.silos.push(silo);
  }

  console.log(this.silos);

  for(var i=6;i < 22;i++) {
    var d = new Date(state.currentDate);
    var silo;
    if( i <=11)
      silo = this.silos[0];
    if ( i > 11 && i <= 17)
      silo = this.silos[1];
    if (i > 17)
      silo = this.silos[2];

    d.setHours(i);
    var hour = document.createElement('div');
    hour.className = 'cal-hour';


    if (!state.isSelectable(d)) {
      hour.className += ' disabled';
    }
    if(state.isHourSelected(d)) {
      hour.className += ' selected';
    }

    if (state.isFirst(d)) {
      hour.className += ' firstchoice';
    }
    hour.innerHTML = '<span>' + d.getHours() + ' h</span>';
    if (state.isSelectable(d)) {
      hour.addEventListener("click", Actions["TOOGLE_DATE"].bind(this, state, d));
    }
    silo.appendChild(hour);
  }


}

//DAY COMPONENTS
var daysComponent = function () {
  var wrapper = document.getElementById('cal-wrapper');
  this.container = document.createElement('div')
  this.container.id = 'cal-days';
  this.container.className = 'cal-days'
  wrapper.appendChild(this.container);
  this.hoursView = new hoursComponent();
}

daysComponent.prototype.render = function (state, oldState) {
  this.container.innerHTML = '';

  var start = state.cursor * 7 * state.displayedLines;
  var stop  = start + 7*state.displayedLines;
  appendColumnsHelper(this.container, state.availableDates.slice(start, stop), function(day, date, i) {
    day.className = 'cal-day';
    day.innerHTML =  '<span>' + date.getDate(); + '</span>';

    if (!state.isSelectable(date)) {
      day.className += ' disabled'
    }

    if (state.isDateSelected(date)) {
      day.className += ' selected';
    }

    if (state.isCurrentDate(date)) {
      day.className += ' current';
    }

    if (state.isDateFirstSelected(date)) {
      day.className += ' firstchoice';
    }

    if (state.isSelectable(date)) {
      day.addEventListener("click", Actions["SET_CURRENT_DATE"].bind(this, state, date));
    } else {
      day.addEventListener("click", Actions['NEXT_PANEL'].bind(this, state));
    }

  }.bind(this));

  this.hoursView.render(state, oldState);

}

// HELPER
var appendColumnsHelper = function(parent, array, buildFunction) {
  for(var i=0;i < array.length;i++) {
    var elem = document.createElement('div');
    buildFunction(elem, array[i], i);
    parent.appendChild(elem);
  }
}

Date.prototype.addDay = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}


Date.prototype.removeDay = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() - days);
  return dat;
}

Date.prototype.findLastMonday = function (date) {
  while( date.getDay() != 1) {
    date = date.removeDay(1);
  }
  return date;
}

Date.prototype.getDayAndHours = function () {
  var dat = new Date(this.valueOf());
  return dat.getYear() + '-' + dat.getMonth() + '-' + dat.getDate() + ' ' + dat.getHours();
}

var initialState = new State();
var datePickerView = new datePickerComponent();
datePickerView.render(initialState);


