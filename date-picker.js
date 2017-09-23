var WEEKDAYS = ['D','L','M','M','J','V','S'];

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
  this.displayedLines = 1;
}

State.prototype.isDateSelected = function (date) {
  var selected =  this.selected.find(function (d) {
    return d.toDateString() == date.toDateString();
  })
  return !!selected;
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


State.prototype.isFirst = function (date) {
  if (this.selected.length == 0)
    return false;

  return this.selected[0].toString() == date.toString();
}

State.prototype.isSelectable = function (date) {
  return date >= this.firstSelectableDate;
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
  },
}


// DATE PICKER COMPONENT
var datePickerComponent = function () {
  this.weekdaysView = new weekdaysComponent();
  this.daysView = new daysComponent();
}


datePickerComponent.prototype.render = function (state, oldState) {
  this.weekdaysView.render(state, oldState);
  this.daysView.render(state, oldState);
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

  appendColumnsHelper(this.container, state.availableDates.slice(0,14), function(day, date, i) {
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

    if (state.isSelectable(date)) {
      day.addEventListener("click", Actions["SET_CURRENT_DATE"].bind(this, state, date));
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


