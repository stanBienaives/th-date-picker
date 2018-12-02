var WEEKDAYS = ['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];

var MONTHS = ['jan.', 'fev.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'aout', 'sept.', 'oct.', 'nov.', 'dec.'];

var NUMBER_DAY_DISPLAYED = 3;

var State = function State(config) {

  this.config = config || {};
  this.selected = [];
  this.availableDates = [];

  this.cursor = 0;
  this.displayedLines = 1;

  var today = new Date();

  this.firstDisplayDate = config.firstSelectableDate || today;
  // this.firstDisplayDate.setHours(0);
  // this.firstDisplayDate.setMinutes(0);
  // this.firstDisplayDate.setSeconds(0);

  this.firstSelectableDate = config.firstSelectableDate || today;

  this.firstSelectableDate.setMinutes(0);
  this.firstSelectableDate.setSeconds(0);

  this.lastSelectableDate = config.lastSelectableDate || this.firstSelectableDate.addDay(90);
  this.lastSelectableDate.setMinutes(0);
  this.lastSelectableDate.setSeconds(0);

  this.lastDisplayDate = this.lastSelectableDate.findNextSunday();

  //handle case where sunday is not last of the panel
  var nbdays = diffDateInDays(this.firstDisplayDate, this.lastDisplayDate);

  while((nbdays + 1) % (this.displayedLines * NUMBER_DAY_DISPLAYED) != 0) {
    this.lastDisplayDate = this.lastDisplayDate.addDay(1);
    nbdays = diffDateInDays(this.firstDisplayDate, this.lastDisplayDate);
  }

  this.currentDate = this.firstSelectableDate;

  var date = this.firstDisplayDate;
  var nbdays = diffDateInDays(this.firstDisplayDate, this.lastDisplayDate);
  for (i = 0; i < nbdays + 1 ; i++) {
    this.availableDates.push(this.firstDisplayDate.addDay(i));
  }


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
  // Offset is meant  to patch a very weird behaviour of addDay
  // See: https://stackoverflow.com/questions/4790828/comparing-two-dates-using-javascript-not-working-as-expected
  var offset = 50; //ms
  var selectable =  ((date.getTime() + offset) >= this.firstSelectableDate.getTime() && (date.getTime() - offset ) <= this.lastSelectableDate.getTime());
  return selectable;
}

State.prototype.isSelectableDay = function (date) {
  var firstSelectableDay = new Date(this.firstSelectableDate);
  firstSelectableDay.setHours(0);
  var offset = 50; //ms
  var selectable =  ((date.getTime() + offset) >= firstSelectableDay.getTime() && (date.getTime() - offset ) <= this.lastSelectableDate.getTime());
  return selectable;
};


State.prototype.displayMonth = function () {
  return MONTHS[this.firstPanelDate().getMonth()];

}

State.prototype.firstPanelDate = function () {
 return this.availableDates[this.cursor * NUMBER_DAY_DISPLAYED * this.displayedLines];

}

State.prototype.numberOfPanels = function () {
  return Math.ceil(this.availableDates.length / (this.displayedLines * NUMBER_DAY_DISPLAYED));
}


State.prototype.panelFromDate = function (date) {

  var diffDays = diffDateInDays(this.firstDisplayDate, date);

  var cursor =  Math.floor(diffDays / (NUMBER_DAY_DISPLAYED * this.displayedLines));
  return cursor;
}

//ACTION RECORD
var Actions = {
  "TOOGLE_DATE": function (state, date) {
    var position = state.selected.map(function (d) {
      return d.getDayAndHours();
    }).indexOf(date.getDayAndHours());

    if( position === -1 ) {
      if (state.config.multipleDates) {
        state.selected.push(date);
      } else {
        state.selected = [date];
      }
    } else {
      state.selected.splice(position, 1);
    }
    state.currentDate = date;
    this.render(state, {}, this);
  },
  "SET_CURRENT_DATE": function (state, date) {
    state.currentDate = date;
    state.cursor = state.panelFromDate(date);
    this.render(state);
  },
  "NEXT_PANEL": function (state) {
    if (state.cursor == state.numberOfPanels() - 1)
      return;

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
var datePickerComponent = function (config) {
  this.createCanvas();
  this.state = new State(config);
  this.navPrevView = new navComponent('prev');
  this.daysView = new daysComponent(this.state);
  // this.navRightView = new navRightComponent();
  this.navNextView = new navComponent('next');
  this.render(this.state);
}

datePickerComponent.prototype.createCanvas = function () {
  var wrapper = document.getElementById('cal-wrapper');

  createElem('cal-navigator-container', 'cal-navigator-prev', wrapper)
  createElem('cal-days', 'cal-days', wrapper);
  createElem('cal-navigator-container', 'cal-navigator-next', wrapper)

}

function createElem(className, id, parent, type) {
  type = type || 'div';
  var elem = document.createElement(type);
  elem.className = className;
  if (id)
    elem.id = id
  parent.appendChild(elem);
  return elem;
}


datePickerComponent.prototype.getDates = function() {
  var selected = this.state.selected;
  var firstchoice =  selected[0];
  selected.splice(0,1);
  var otherChoices =  selected;
  var result = {
    firstchoice: firstchoice,
    otherChoices: otherChoices,
  }
  return result;

}

datePickerComponent.prototype.render = function (state, oldState) {
  var wrapper = document.getElementById('cal-wrapper');

  this.navPrevView.render(state, oldState, this);
  // this.weekdaysView.render(state, oldState);
  this.daysView.render(state, oldState, this);
  this.navNextView.render(state, oldState, this);
}

var navComponent = function (direction) {
  this.direction = direction;
  if( direction === 'next') {
    this.container = document.getElementById('cal-navigator-next');
  } else {
    this.container = document.getElementById('cal-navigator-prev');
  }
}

navComponent.prototype.render = function (state, oldState, parent) {

  this.container.innerHTML = '';
  if (this.direction === 'next') {
    var nextButton = document.createElement('div');
    nextButton.className += ' cal-navigator-next';
    nextButton.className += ' cal-navigator-btn';
    nextButton.innerHTML = '>';
    // this.container.removeEventListener("click", Actions['NEXT_PANEL'].bind(parent, state));
    nextButton.addEventListener("click", Actions['NEXT_PANEL'].bind(parent, state));

    this.container.appendChild(nextButton);
  } else {
    var prevButton = document.createElement('div');
    prevButton.className += ' cal-navigator-prev';
    prevButton.className += ' cal-navigator-btn';
    prevButton.innerHTML = '<';
    // this.container.removeEventListener("click", Actions['PREVIOUS_PANEL'].bind(parent, state));
    prevButton.addEventListener("click", Actions['PREVIOUS_PANEL'].bind(parent, state));
    this.container.appendChild(prevButton);
  }

}


var daysComponent = function (state) {
  var wrapper = document.getElementById('cal-wrapper');
  this.container = document.getElementById('cal-days')

  // if( !this.rendered) {
  //   swipedetect(this.container, function (dir) {
  //     console.log('direction', dir);
  //     if( dir == 'right') {
  //       console.log('previous panel');
  //       Actions['PREVIOUS_PANEL'].bind(this)(state);
  //     }

  //     if (dir == 'left') {
  //       Actions['NEXT_PANEL'].bind(this)(state);
  //     }

  //   }.bind(this));
  // }

  // this.hoursView = new hoursComponent();

}

daysComponent.prototype.render = function (state, oldState, parent) {

  function currentState() {
    return state;
  }

  this.rendered = true;
  this.container.innerHTML = '';

  var start = state.cursor * NUMBER_DAY_DISPLAYED * state.displayedLines;
  var stop  = start + NUMBER_DAY_DISPLAYED * state.displayedLines;
  state.availableDates.slice(start, stop).forEach(function createDayView(date) {
    var dayView = new dayComponent(date);
    dayView.render(state, oldState, this);
  }.bind(this));
}


var dayComponent = function (date) {
  this.date = date;
}


dayComponent.prototype.render = function(state, oldState, parent) {

  if (!this.container)
    this.container = createElem('cal-day', '', parent.container);

  this.container.innerHTML = '';

  // elem.innerHTML = displayDayHeader(this.date);

  var dayHeaderView = new dayHeaderComponent(this.date);


  var hoursView = new hoursComponent(this.date);
  dayHeaderView.render(state, oldState, this);
  hoursView.render(state, oldState, this);

}

var dayHeaderComponent = function (date) {
  this.date = date;
}

dayHeaderComponent.prototype.render = function(state, oldState, parent) {
  var header = createElem('cal-day-header', '' , parent.container);
  header.innerHTML = displayDayHeader(this.date);
}



var hoursComponent = function(date, container) {
  this.date = date;
}

hoursComponent.prototype.render = function(state, oldState, parent) {
  this.rendered = true;
  this.innerHTML = '';

  for(var i=6;i < 22;i++) {
    var d = new Date(this.date);
    d.setHours(i);

    var hour = document.createElement('div');
    hour.className = 'cal-hour';

    if (!state.isSelectable(d)) {
      hour.className += ' disabled';
    }
    if(state.isHourSelected(d)) {
      hour.className += ' selected';
    }

    var hourString = d.getHours();
    if (hourString < 10) {
      hourString = '0' + hourString;
    }
    hour.innerHTML = '<span>' + hourString + ':00</span>';

    if (state.isSelectable(d)) {
      hour.addEventListener("click", Actions["TOOGLE_DATE"].bind(parent, state, d));
    }
    parent.container.appendChild(hour);
  }
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
  dat.setDate(this.getDate() + days);
  return dat;
}


Date.prototype.removeDay = function (days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() - days);
  return dat;
}

var diffDateInDays = function (first, second) {
  var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
  var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

  // Do the math.
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;

    // Round down.
  return Math.round(days);
}

var displayDayHeader = function (date) {
  var day = date.getDate();
  var month = date.getMonth();
  var weekdays = date.getDay();

  return  WEEKDAYS[weekdays] +  '<br/>' + day + ' ' + MONTHS[month];
}

Date.prototype.findLastMonday = function (date) {
  var date = new Date(this);
  while( date.getDay() != 1) {
    date = date.removeDay(1);
  }
  return date;
}

Date.prototype.findNextSunday = function () {
  var date = new Date(this);
  while( date.getDay() != 0) {
    date = date.addDay(1);
  }
  return date;
}

Date.prototype.getDayAndHours = function () {
  var dat = new Date(this.valueOf());
  return dat.getYear() + '-' + dat.getMonth() + '-' + dat.getDate() + ' ' + dat.getHours();
}


//var datePickerView = new datePickerComponent();



// Shameless copy/paste
function swipedetect(el, callback){

    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 15, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 3000, // maximum time allowed to travel that distance
    elapsedTime,
    startTime,
    handleswipe = callback || function(swipedir){}

    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        //e.preventDefault()
    }, false)

    touchsurface.addEventListener('touchmove', function(e){
        // e.preventDefault() // prevent scrolling when inside DIV
    }, false)

    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipedir = (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            }
        }
        handleswipe(swipedir)
        //e.preventDefault()
    }, false)
}
