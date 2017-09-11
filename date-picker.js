var WEEKDAYS = ['D','L','M','M','J','V','S'];

//var datePicker = function(params) {
  //// min booking frame
  //// max booking frame
  //// opening time
  ////
  //this.selected = [];
  //this.currentDate;
  //this.displayWeekdays();
  //this.displayDays();
//}

var State = function State() {
  this.selected = [];
  this.availableDates = [];


  var today = new Date();

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


//ACTION RECORD
var Actions = {
  "TOOGLE_DATE": function (state, date) {
    var position = state.selected.indexOf(date);
    if( position === -1 ) {
      state.selected.push(date);
    } else {
      state.selected.splice(position, 1);
    }
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
var weekdaysComponent = function () {}

weekdaysComponent.prototype.render =function(state, oldState) {
  var wrapper = document.getElementById('cal-wrapper');
  var weekdaysContainer = document.createElement('div')
  weekdaysContainer.className = 'cal-weekdays'

  appendColumnsHelper(weekdaysContainer, state.availableDates.slice(0,7),  function build(weekDay , date) {
    weekDay.className = 'cal-weekday';
    weekDay.innerText = WEEKDAYS[date.getDay()];
  });


  wrapper.appendChild(weekdaysContainer);

}



//DAY COMPONENTS

var daysComponent = function () {}

daysComponent.prototype.render = function (state, oldState) {
  var wrapper = document.getElementById('cal-wrapper');
  var daysContainer = document.getElementById('cal-days');
  if (!daysContainer) {
    var daysContainer = document.createElement('div')
    daysContainer.id = 'cal-days';
    daysContainer.className = 'cal-days'
  } else {
    daysContainer.innerHTML = '';
  }

  appendColumnsHelper(daysContainer, state.availableDates.slice(0,7), function(day, date, i) {
    day.className = 'cal-day';
    day.innerHTML =  '<span>' + date.getDate(); + '</span>';

    if (state.isDateSelected(date)) {
      day.className += ' selected';
    }
    day.addEventListener("click", Actions["TOOGLE_DATE"].bind(this, state, date));
    //if(date == 4)
      //day.className += ' selected';
    //day.addEventListener("click", function() {
      //if (this.className.indexOf('selected') === -1)
        //this.className += ' selected';
      //else
        //this.className = this.className.replace('selected','');
    //});

  }.bind(this));

  wrapper.appendChild(daysContainer);

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

var initialState = new State();
var datePickerView = new datePickerComponent();
datePickerView.render(initialState);


