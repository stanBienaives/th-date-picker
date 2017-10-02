var WEEKDAYS = ['D','L','M','M','J','V','S'];

var MONTHS = ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'];

var State = function State(config) {

  this.config = config || {};
  this.selected = [];
  this.availableDates = [];

  this.cursor = 0;
  this.displayedLines = 2;

  var today = new Date();

  this.firstDisplayDate = today.findLastMonday(today);

  this.firstSelectableDate = config.firstSelectableDate || today;
  this.lastSelectableDate = config.lastSelectableDate || this.firstSelectableDate.addDay(90);

  this.lastDisplayDate = (new Date()).findNextSunday(this.lastSelectableDate);
  //this.lastDisplayDate = this.lastSelectableDate;

  //handle case where sunday is not last of the panel
  var nbdays = this.lastDisplayDate.diffDateInDays(this.firstDisplayDate, this.lastDisplayDate);
  console.log(nbdays, this.lastDisplayDate, this.firstDisplayDate);

  while((nbdays + 1) % (this.displayedLines * 7) != 0) {
    this.lastDisplayDate = this.lastDisplayDate.addDay(7);
    console.log(this.lastDisplayDate);
    nbdays = this.lastDisplayDate.diffDateInDays(this.firstDisplayDate, this.lastDisplayDate);
    console.log('nbdays', nbdays);
  }

  this.currentDate = this.firstSelectableDate;

  var date = this.firstDisplayDate;
  var nbdays = (new Date()).diffDateInDays(this.firstDisplayDate, this.lastDisplayDate);
  for (i = 0; i < nbdays + 1 ; i++) {
    this.availableDates.push(this.firstDisplayDate.addDay(i));
  }

  console.log(this.lastSelectableDate);
  console.log(this.lastDisplayDate);

  console.log(this.availableDates.length)


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


State.prototype.displayMonth = function () {
  return MONTHS[this.firstPanelDate().getMonth()];

}

State.prototype.firstPanelDate = function () {
 return this.availableDates[this.cursor * 7 * this.displayedLines];

}

State.prototype.panelFromDate = function (date) {
  //var timeDiff = Math.abs(date.getTime() - this.firstDisplayDate.getTime());
  //var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  var diffDays = date.diffDateInDays(this.firstDisplayDate, date);

  var cursor =  Math.floor(diffDays / (7 * this.displayedLines));
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
    console.log(state.selected);
    state.currentDate = date;
    this.render(state);
  },
  "SET_CURRENT_DATE": function (state, date) {
    state.currentDate = date;
    state.cursor = state.panelFromDate(date);
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
var datePickerComponent = function (config) {
  this.navigatorView = new navigatorComponent();
  this.weekdaysView = new weekdaysComponent();
  this.daysView = new daysComponent();
  this.state = new State(config);
  this.render(this.state);

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
  console.log(result);
  return result;

}



datePickerComponent.prototype.render = function (state, oldState) {
  this.navigatorView.render(state, oldState, this);
  this.weekdaysView.render(state, oldState);
  this.daysView.render(state, oldState, this);
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

hoursComponent.prototype.render = function(state, oldState, parent) {

  if( !this.rendered) {
    swipedetect(this.container, function (dir) {
      console.log('direction', dir);
      if( dir == 'right') {
        console.log('previous panel');
        Actions['SET_CURRENT_DATE'].bind(parent)(currentState(), currentDate().removeDay(1));
      }

      if (dir == 'left') {
        Actions['SET_CURRENT_DATE'].bind(parent)(currentState(), currentDate().addDay(1));
      }

    }.bind(this));
  }
    //
  function currentDate() {
    return state.currentDate;
  }

  function currentState() {
    return state;
  }

  this.rendered = true;
  this.container.innerHTML = '';

  var directive = document.createElement('div');
  directive.className += ' cal-directive';
  if (state.config.multipleDates && state.selected.length > 0) {
    directive.innerHTML = '<span> Pr&eacute;cisez toutes vos autres disponibilit&eacute;s </span>';
  } else {
    directive.innerHTML = '<span> Choisissez votre date et heure id&eacute;ale </span>';
  }


  this.container.appendChild(directive);


  this.silos = [];
  for(var i=0; i < 3; i++) {
    var silo = document.createElement('div');
    silo.className = 'cal-hour-silo';
    if(i==0)
      silo.innerHTML = '<span> MATINEE </span>';
    if(i==1)
      silo.innerHTML = '<span> JOURNEE </span>';
    if(i==2)
      silo.innerHTML = '<span> SOIREE </span>';
    this.container.appendChild(silo);
    this.silos.push(silo);
  }


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
      hour.addEventListener("click", Actions["TOOGLE_DATE"].bind(parent, state, d));
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

daysComponent.prototype.render = function (state, oldState, parent) {

  if( !this.rendered) {
    swipedetect(this.container, function (dir) {
      console.log('direction', dir);
      if( dir == 'right') {
        console.log('previous panel');
        Actions['PREVIOUS_PANEL'].bind(parent)(currentState());
      }

      if (dir == 'left') {
        Actions['NEXT_PANEL'].bind(parent)(currentState());
      }

    }.bind(this));
  }
    //
  function currentState() {
    return state;
  }

  this.rendered = true;
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
      //day.addEventListener("click", Actions['NEXT_PANEL'].bind(this, state));
    }

  }.bind(this));

  this.hoursView.render(state, oldState, this);

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

Date.prototype.diffDateInDays = function (first, second) {
  //var timeDiff = Math.abs(date1.getTime() - date2.getTime());
  //var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  //return diffDays;
  var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
  var millisecondsPerDay = 1000 * 60 * 60 * 24;
  var millisBetween = two.getTime() - one.getTime();
  var days = millisBetween / millisecondsPerDay;

    // Round down.
  return Math.round(days);
}

Date.prototype.findLastMonday = function (date) {
  while( date.getDay() != 1) {
    date = date.removeDay(1);
  }
  return date;
}

Date.prototype.findNextSunday = function (date) {
  while( date.getDay() != 0) {
    console.log("next", date.getDay());
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
        e.preventDefault() // prevent scrolling when inside DIV
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
