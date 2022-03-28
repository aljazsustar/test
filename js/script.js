// global mapping, returned from readHolidayData function
let holidays = {}

let selectedDate = null;

// lookup table for finding the day's position in the week
let dayLookUp = {
    "Monday": 0,
    "Tuesday": 1,
    "Wednesday": 2,
    "Thursday": 3,
    "Friday": 4,
    "Saturday": 5,
    "Sunday": 6
}

window.onload = () => {
    holidays = JSON.parse(readHolidayData());
    let month = getDaysInMonth(3, 2022);
    render(month);
}



/* returns a map of dates, representing days in the month 
example:
{
    Date(2022, 5 ,1): {
        "holiday": true,
        "dayName": "Sunday" 
    }
}
Note: Date(2022, 5, 1) is transformed to string on insertion
*/
let getDaysInMonth = (month, year) => {
    let date = new Date(year, month-1, 1);
    selectedDate = date;
    let days = {}

    while (date.getMonth() === month-1) {
        days[date.toDateString()] = { "holiday": checkHoliday(date),
                        "dayName": date.toLocaleDateString('en-US', {weekday: 'long'})};
        date.setDate(date.getDate() + 1);
    }

    return Object.keys(days)
    .sort((e1, e2) => new Date(e1).getDate() - new Date(e2).getDate())
    .reduce(
        (obj, key) => {
            obj[key] = days[key];
            return obj;
        }, 
        {}
    );
}


/* creates HTML for the month, passed as a parameter 'month' -> result
of getDaysInMonth function
*/
let render = (monthDict) => {
    let calendarContainer = document.getElementsByClassName('calendar-container')[0];

    // create as many empty divs as there are days before the first day of the month
    for (let i = 0; i < dayLookUp[monthDict[Object.keys(monthDict)[0]].dayName]; i++) {
        let hiddenDiv = document.createElement('div');
        calendarContainer.appendChild(hiddenDiv);
    }

    for (day of Object.keys(monthDict)) {
        calendarContainer.appendChild(createDayElement(day, monthDict));
    }
}


// creates an HTML element respresenting the day, including appending proper classes and setting text
let createDayElement = (day, monthDict) => {
    let dayElement = document.createElement('div');
    let dayNumberElement = document.createElement('p');
    dayNumberElement.textContent = `${new Date(day).getDate()}`;

    if (monthDict[day].dayName === "Sunday") {
        dayElement.classList.add("sunday");
    }

    if (monthDict[day].holiday){
        dayElement.classList.remove("sunday");
        dayElement.classList.add("holiday");
    }

    dayElement.appendChild(dayNumberElement);
    return dayElement;
}

/* 
    fetches and returns holiday data from server
    return data format is descibed in index.js
 */
let readHolidayData = (path) => {
    let request = new XMLHttpRequest();
    request.open("GET", "http://localhost:3000", false);
    request.send(null);
    return request.responseText;
}

// activates when user selects a new date from the dropdown menu and renders it
let monthSelected = (selectObject) => {
    let year = document.getElementById("year").value;
    let monthDict = getDaysInMonth(selectObject.value, year || 2022);
    selectedDate.setMonth(selectObject.value);
    removeDays();
    render(monthDict);
}

// activates when user types in a year and renders the current month for that year
let yearChanged = (inputElement) => {
    let year = inputElement.value;
    let month = document.getElementById("month").value
    let monthDict = getDaysInMonth(month, year);
    selectedDate.setYear(inputElement.year);
    removeDays();
    render(monthDict);
}

// called when user selects a date and renders the month of the day user selected
let dateSelected = (dateInputElement) => {
    let selected = new Date(dateInputElement.value);
    selectedDate = selected;
    let monthDict = getDaysInMonth(selected.getMonth() + 1, selected.getFullYear());
    removeDays();
    render(monthDict);
}

// checks whether or not the date is a holiday
// returns true if date is a holiday, false if it's not
let checkHoliday = (date) => {
    let res = Object.keys(holidays)
        .map(d => {

            // transform keys from holidays object to dates for easier comparison
            let dateItems = d.split('/');
            let selectedYear = selectedDate.getFullYear()
            let date = new Date(selectedYear, dateItems[0] - 1, dateItems[1]);
            return date;
        })
        .filter(d => checkHolidayUtil(date, d))
    
    return res.length !== 0;
}

// utility function for checking if date is a holiday
let checkHolidayUtil = (date1, date2) => {

    // form a string in the same format as key in holiday object
    let dateString = `${date1.getMonth() + 1}/${date1.getDate()}`;
    if (compareDates(date1, date2)) {

        // if dates are equal, check if holiday is recurring (doesn't have a year assigned)
        if (!holidays[dateString].length) return true;

        // if it's not recurring, check if the holiday is valid this year
        else {
            if (holidays[dateString] == date1.getFullYear()) {
                return true;
            }
        }
    }

    return false;
}

// utility function: compares two dates and returns true if they are equal and false otherwise
let compareDates = (date1, date2) => {
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()
}   

// removes days from the calendar before rendering the new days
let removeDays = () => {
    let calendarContainer = document.getElementsByClassName('calendar-container')[0];

    // do not remove the first 7 children, they are spans with day names
    while (calendarContainer.children.length > 7) {
        calendarContainer.removeChild(calendarContainer.lastChild);
    }
}