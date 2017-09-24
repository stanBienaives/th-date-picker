

# DATE PICKER

## USAGE

```html
  <head>
   <script src='https://stanbienaives.github.io/th-date-picker/date-picker.js'></script>
  </head>
  <body>
    ...
    <div id='cal-wrapper' syle='height:600px' class='cal-wrapper'>
    ...
    <button onclick="doSomething(datePickerView.getDates())">click</button>

    <script>
      var date = new Date()
      date.setDate(26);
      var datePickerView = new datePickerComponent({ multipleDates: true, firstSelectableDate: date });

    </script>
   </body>


```


