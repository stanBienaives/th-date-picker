

# DATE PICKER

## USAGE

```html
  <head>
   <script src='http://date-picker.s3-website-eu-west-1.amazonaws.com/date-picker.js'></script>
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


