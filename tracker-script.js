// ===== App State =====
let lastPeriodDate = null;
let cycleLength = 28;
let periodLength = 5;
let currentMonth = new Date();

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// ===== DOM References =====
const cycleInput = document.getElementById('cycleLength');
const periodInput = document.getElementById('periodLength');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const monthDisplay = document.getElementById('monthDisplay');
const calendarGrid = document.getElementById('calendarGrid');
const datepickerInfo = document.getElementById('datepickerInfo');
const infoSection = document.getElementById('infoSection');
const nextPeriodDateEl = document.getElementById('nextPeriodDate');

// ===== Date Utilities =====
function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDaysToDate(date, days) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

function goToPreviousMonth(date) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    return newDate;
}

function goToNextMonth(date) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    return newDate;
}

function daysAreEqual(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function monthsAreEqual(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth();
}

function isDateInRange(date, start, end) {
    return date >= start && date <= end;
}

function formatDate(date, template) {
    const d = new Date(date);
    const monthName = monthNames[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();

    if (template === 'MMMM dd, yyyy') {
        return `${monthName} ${day}, ${year}`;
    } else if (template === 'MMM dd') {
        return `${monthName.slice(0, 3)} ${day}`;
    } else if (template === 'd') {
        return String(day);
    } else if (template === 'MMMM') {
        return monthName;
    }
}

// ===== Calendar Logic =====
function getCalendarDays() {
    const monthStart = getFirstDayOfMonth(currentMonth);
    const monthEnd = getLastDayOfMonth(currentMonth);
    const firstWeekday = monthStart.getDay();

    // Add days from previous month to fill the first week
    const leadingDays = [];
    for (let i = 0; i < firstWeekday; i++) {
        leadingDays.unshift(addDaysToDate(monthStart, -i - 1));
    }

    // Add all days of current month
    const monthDays = [];
    for (let i = 1; i <= monthEnd.getDate(); i++) {
        monthDays.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return [...leadingDays, ...monthDays];
}

function getPeriodStatus(day) {
    if (!lastPeriodDate) return null;

    // Calculate key dates
    const periodStart = lastPeriodDate;
    const periodEnd = addDaysToDate(periodStart, periodLength - 1);
    const nextPeriodStart = addDaysToDate(periodStart, cycleLength);
    const nextPeriodEnd = addDaysToDate(nextPeriodStart, periodLength - 1);

    // Check what type of day this is
    if (daysAreEqual(day, periodStart)) return 'period-start';
    if (isDateInRange(day, periodStart, periodEnd)) return 'period';
    if (daysAreEqual(day, nextPeriodStart)) return 'next-period-start';
    if (isDateInRange(day, nextPeriodStart, nextPeriodEnd)) return 'next-period';

    return null;
}

function drawCalendar() {
    const calendarDays = getCalendarDays();
    const today = new Date();

    // Show current month name
    monthDisplay.textContent = formatDate(currentMonth, 'MMMM');
    calendarGrid.innerHTML = '';

    // Draw each day
    calendarDays.forEach(day => {
        const status = getPeriodStatus(day);
        const isThisMonth = monthsAreEqual(day, currentMonth);
        const isToday = daysAreEqual(day, today);

        const btn = document.createElement('button');
        btn.className = 'calendar-day';
        btn.textContent = formatDate(day, 'd');

        if (!isThisMonth) {
            btn.classList.add('other-month');
        } else {
            btn.classList.add('current-month');
            
            if (status === 'period-start' || status === 'next-period-start') {
                btn.classList.add('period-start');
            } else if (status === 'period') {
                btn.classList.add('period');
            } else if (status === 'next-period') {
                btn.classList.add('next-period');
            } else if (isToday) {
                btn.classList.add('today');
            }

            btn.addEventListener('click', () => selectDate(day));
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'flex justify-center';
        wrapper.appendChild(btn);
        calendarGrid.appendChild(wrapper);
    });
}

function selectDate(day) {
    if (monthsAreEqual(day, currentMonth)) {
        lastPeriodDate = day;
        datepickerInfo.style.display = 'none';
        infoSection.style.display = 'block';
        updateDisplay();
        drawCalendar();
    }
}

function updateDisplay() {
    if (!lastPeriodDate) return;

    const nextPeriod = addDaysToDate(lastPeriodDate, cycleLength);
    nextPeriodDateEl.textContent = formatDate(nextPeriod, 'MMMM dd, yyyy');
}

// ===== Event Handlers =====
cycleInput.addEventListener('change', (e) => {
    cycleLength = Number(e.target.value);
    if (lastPeriodDate) {
        updateDisplay();
        drawCalendar();
    }
});

periodInput.addEventListener('change', (e) => {
    periodLength = Number(e.target.value);
    if (lastPeriodDate) {
        updateDisplay();
        drawCalendar();
    }
});

prevBtn.addEventListener('click', () => {
    currentMonth = goToPreviousMonth(currentMonth);
    drawCalendar();
});

nextBtn.addEventListener('click', () => {
    currentMonth = goToNextMonth(currentMonth);
    drawCalendar();
});

// ===== Startup =====
drawCalendar();