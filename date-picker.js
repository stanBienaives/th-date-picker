var WEEKDAYS = ['D','L','M','M','J','V','S'];

var State = function State() {
  this.selected = [];
  this.availableDates = [];

  var today = new Date();

  this.currentDate = today;

  for (var i=0; i<90;i++) {
    this.availableDates.push(today.addDay(i));
  }
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

  for(var i=6;i < 22;i++) {
    var d = new Date(state.currentDate);
    d.setHours(i);
    var hour = document.createElement('div');
    hour.className = 'cal-hour';
    if(state.isHourSelected(d)) {
      hour.className += ' selected';
    }
    hour.innerHTML = '<span>' + d.getHours() + '</span>';
    hour.addEventListener("click", Actions["TOOGLE_DATE"].bind(this, state, d));
    this.container.appendChild(hour);
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

  appendColumnsHelper(this.container, state.availableDates.slice(0,7), function(day, date, i) {
    day.className = 'cal-day';
    day.innerHTML =  '<span>' + date.getDate(); + '</span>';

    if (state.isDateSelected(date)) {
      day.className += ' selected';
    }

    if (state.isCurrentDate(date)) {
      day.className += ' current';
    }
    day.addEventListener("click", Actions["SET_CURRENT_DATE"].bind(this, state, date));

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

Date.prototype.getDayAndHours = function () {
  var dat = new Date(this.valueOf());
  return dat.getYear() + '-' + dat.getMonth() + '-' + dat.getDate() + ' ' + dat.getHours();
}

var initialState = new State();
var datePickerView = new datePickerComponent();
datePickerView.render(initialState);


