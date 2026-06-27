document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const expenseScreen = document.getElementById('expense-screen');
    const setupForm = document.getElementById('setup-form');
    const expenseForm = document.getElementById('expense-form');
    const resetBtn = document.getElementById('reset-btn');
    
    // Inputs
    const salaryInput = document.getElementById('salary');
    const hoursInput = document.getElementById('hours');
    const currencySelect = document.getElementById('currency');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    const displayCurrency = document.querySelector('.display-currency');
    const expenseInput = document.getElementById('expense');
    
    // Display elements
    const hourlyRateDisplay = document.getElementById('hourly-rate-display');
    const resultContainer = document.getElementById('result-container');
    const timeBreakdown = document.getElementById('time-breakdown');
    const earningsBreakdown = document.getElementById('earnings-breakdown');
    const earnMonth = document.getElementById('earn-month');
    const earnDay = document.getElementById('earn-day');
    const earnHour = document.getElementById('earn-hour');
    const earnMinute = document.getElementById('earn-minute');

    // Update currency symbols when select changes
    currencySelect.addEventListener('change', (e) => {
        const symbol = e.target.value;
        currencySymbols.forEach(el => el.textContent = symbol);
    });

    // Initialize App
    function init() {
        const savedData = localStorage.getItem('budgetThinkerData');
        
        if (savedData) {
            const data = JSON.parse(savedData);
            showExpenseScreen(data);
        } else {
            showSetupScreen();
        }
    }

    // Show setup screen
    function showSetupScreen() {
        expenseScreen.classList.remove('active');
        // small delay to allow transition
        setTimeout(() => {
            setupScreen.classList.add('active');
        }, 50);
        expenseInput.value = '';
        resultContainer.classList.add('hidden');
    }

    // Show expense calculator screen
    function showExpenseScreen(data) {
        setupScreen.classList.remove('active');
        
        displayCurrency.textContent = data.currency;
        
        // Calculate hourly rate
        const weeklyHours = data.hours || 40;
        const yearlyHours = weeklyHours * 52;
        const yearlySalary = data.salary * 12;
        const hourlyRate = yearlySalary / yearlyHours;
        
        // Format to 2 decimal places
        if (hourlyRateDisplay) {
            hourlyRateDisplay.textContent = `${data.currency}${hourlyRate.toFixed(2)}`;
        }
        
        // Store user data in global object for calculations
        window.userData = {
            ...data,
            hourlyRate,
            weeklyHours,
            yearlyHours
        };

        setTimeout(() => {
            expenseScreen.classList.add('active');
        }, 50);
    }

    // Handle Setup Submit
    setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const salary = parseFloat(salaryInput.value);
        let hours = parseFloat(hoursInput.value);
        const currency = currencySelect.value;
        
        if (isNaN(hours) || hours <= 0) {
            hours = 40; // Default to 40 hours
        }
        
        if (salary > 0) {
            const data = { salary, hours, currency };
            localStorage.setItem('budgetThinkerData', JSON.stringify(data));
            showExpenseScreen(data);
        }
    });

    // Handle Reset
    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('budgetThinkerData');
        showSetupScreen();
    });

    // Handle Expense Calculate
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const expense = parseFloat(expenseInput.value);
        
        if (expense > 0 && window.userData) {
            calculateTimeCost(expense);
        }
    });

    function calculateTimeCost(expense) {
        const hourlyRate = window.userData.hourlyRate;
        const weeklyHours = window.userData.weeklyHours;
        
        // Total working hours needed to pay for the expense
        const totalHoursNeeded = expense / hourlyRate;
        
        // Let's break this down into actual working time
        let totalMinutes = totalHoursNeeded * 60;
        
        // Define working time conversions
        const minutesPerHour = 60;
        // Assume 5 days a week of work.
        const workDaysPerWeek = 5; 
        const dailyWorkHours = weeklyHours / workDaysPerWeek;
        const minutesPerDay = dailyWorkHours * 60;
        const minutesPerMonth = (window.userData.yearlyHours / 12) * 60;
        const minutesPerYear = window.userData.yearlyHours * 60;

        // Calculate breakdown
        const years = Math.floor(totalMinutes / minutesPerYear);
        totalMinutes %= minutesPerYear;
        
        const months = Math.floor(totalMinutes / minutesPerMonth);
        totalMinutes %= minutesPerMonth;
        
        const days = Math.floor(totalMinutes / minutesPerDay);
        totalMinutes %= minutesPerDay;
        
        const hours = Math.floor(totalMinutes / minutesPerHour);
        totalMinutes %= minutesPerHour;
        
        const minutes = Math.floor(totalMinutes);

        renderResult(years, months, days, hours, minutes);
    }

    function renderResult(years, months, days, hours, minutes) {
        resultContainer.classList.remove('hidden');
        timeBreakdown.innerHTML = '';
        
        const timeData = [
            { value: years, label: 'Years' },
            { value: months, label: 'Months' },
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Mins' }
        ];

        // Only show items > 0 or at least minutes if everything is 0
        const activeTimeData = timeData.filter(item => item.value > 0);
        
        if (activeTimeData.length === 0) {
            // Very small expense, took less than a minute
            activeTimeData.push({ value: '<1', label: 'Min' });
        }

        activeTimeData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'time-item';
            div.innerHTML = `
                <div class="time-value">${item.value}</div>
                <div class="time-label">${item.label}</div>
            `;
            timeBreakdown.appendChild(div);
        });

        // Small animation
        timeBreakdown.style.opacity = '0';
        timeBreakdown.style.transform = 'translateY(10px)';
        
        // Show earnings
        const hourlyRate = window.userData.hourlyRate;
        const dailyRate = hourlyRate * (window.userData.weeklyHours / 5);
        const minuteRate = hourlyRate / 60;
        const monthlyRate = window.userData.salary;
        const c = window.userData.currency;

        earnMonth.textContent = `${c}${monthlyRate.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}`;
        earnDay.textContent = `${c}${dailyRate.toFixed(2)}`;
        earnHour.textContent = `${c}${hourlyRate.toFixed(2)}`;
        earnMinute.textContent = `${c}${minuteRate.toFixed(2)}`;
        
        earningsBreakdown.classList.remove('hidden');

        setTimeout(() => {
            timeBreakdown.style.transition = 'all 0.4s ease';
            timeBreakdown.style.opacity = '1';
            timeBreakdown.style.transform = 'translateY(0)';
        }, 50);
    }

    // Run initialization
    init();
});
