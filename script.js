// Real-time clock
function updateClock() {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    document.getElementById('clock').textContent = `${date} ${time}`;
}
setInterval(updateClock, 1000);
updateClock();

// Parking system
const totalSlots = 50;
let bookedSlots = 0;
let bookings = []; // Array to store bookings
let userDetails = {}; // Object to store user details

// Generate parking slots
function generateSlots() {
    const slotsContainer = document.getElementById('slots-container');
    slotsContainer.innerHTML = '';

    for (let i = 1; i <= totalSlots; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.textContent = i;

        const isBooked = bookings.some(booking => booking.slotNumber === i);
        if (isBooked) {
            slot.classList.add('booked');
        } else {
            slot.classList.add('available');
        }

        slot.addEventListener('click', () => handleSlotClick(i));
        slotsContainer.appendChild(slot);
    }
}

// Handle slot click
function handleSlotClick(slotNumber) {
    const isBooked = bookings.some(booking => booking.slotNumber === slotNumber);
    if (isBooked) {
        alert('This slot is already booked!');
        return;
    }

    document.getElementById('slot-number').value = slotNumber;
    highlightSelectedSlot(slotNumber);
}

// Highlight selected slot
function highlightSelectedSlot(slotNumber) {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.classList.remove('selected');
        if (slot.textContent == slotNumber) {
            slot.classList.add('selected');
        }
    });
}

// Save user details
document.getElementById('user-details-form').addEventListener('submit', function(event) {
    event.preventDefault();

    userDetails = {
        name: document.getElementById('user-name').value,
        phone: document.getElementById('user-phone').value,
        vehicleType: document.getElementById('vehicle-type').value,
        vehicleNumber: document.getElementById('vehicle-number').value,
        address: document.getElementById('user-address').value,
    };

    if (!userDetails.name || !userDetails.phone || !userDetails.vehicleType || !userDetails.vehicleNumber || !userDetails.address) {
        alert('Please fill in all fields!');
        return;
    }

    alert('User details saved successfully!');
    document.getElementById('booking-section').style.display = 'block';
});

// Function to validate date and time
function validateDateTime(selectedDate, selectedTime) {
    const now = new Date(); // Get current date and time
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`); // Combine date and time

    // Check if the selected date/time is in the past
    if (selectedDateTime < now) {
        // Show error message
        document.getElementById('date-time-error').style.display = 'block';
        return false; // Validation failed
    } else {
        // Hide error message if validation passes
        document.getElementById('date-time-error').style.display = 'none';
        return true; // Validation passed
    }
}

// Handle booking form submission
// Handle booking form submission
document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const bookingDate = document.getElementById('booking-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const slotNumber = parseInt(document.getElementById('slot-number').value);

    // Validate date and time
    if (!validateDateTime(bookingDate, startTime) || !validateDateTime(bookingDate, endTime)) {
        return; // Stop form submission if validation fails
    }

    if (!bookingDate || !startTime || !endTime || !slotNumber || slotNumber < 1 || slotNumber > 50) {
        alert('Please fill in all fields and choose a valid slot number!');
        return;
    }

    const isBooked = bookings.some(booking => booking.slotNumber === slotNumber);
    if (isBooked) {
        alert('This slot is already booked!');
        return;
    }

    // Generate a token
    const token = Math.floor(1000 + Math.random() * 9000); // 4-digit token
    console.log("Generated Token:", token); // Debugging: Log the token

    // Update booked slots count
    bookedSlots++;
    updateSlotDisplay();

    // Create a booking object
    const booking = {
        slotNumber,
        token,
        bookingDate,
        startTime,
        endTime,
        userDetails
    };
    bookings.push(booking);

    // Display booking details
    document.getElementById('booked-token').textContent = token; // Display the token
    document.getElementById('booked-user-name').textContent = userDetails.name;
    document.getElementById('booked-vehicle-number').textContent = userDetails.vehicleNumber;
    document.getElementById('booked-slot-number').textContent = slotNumber;
    document.getElementById('booked-date').textContent = bookingDate;
    document.getElementById('booked-start-time').textContent = startTime;
    document.getElementById('booked-end-time').textContent = endTime;

    // Show the booking details section
    document.getElementById('booking-details').style.display = 'block';

    // Start countdown timer
    startCountdown(startTime, endTime, token);

    // Show the payment section
    showPaymentSection();
});

// Real-time validation for date and time inputs
document.getElementById('booking-date').addEventListener('change', function() {
    const selectedDate = this.value;
    const selectedTime = document.getElementById('start-time').value;

    if (selectedDate && selectedTime) {
        validateDateTime(selectedDate, selectedTime);
    }
});

document.getElementById('start-time').addEventListener('change', function() {
    const selectedDate = document.getElementById('booking-date').value;
    const selectedTime = this.value;

    if (selectedDate && selectedTime) {
        validateDateTime(selectedDate, selectedTime);
    }
});

document.getElementById('end-time').addEventListener('change', function() {
    const selectedDate = document.getElementById('booking-date').value;
    const selectedTime = this.value;

    if (selectedDate && selectedTime) {
        validateDateTime(selectedDate, selectedTime);
    }
});

// Update slot display
function updateSlotDisplay() {
    const availableSlots = document.getElementById('available-slots');
    const bookedSlotsEl = document.getElementById('booked-slots');
    const progressFill = document.getElementById('progress-fill');

    availableSlots.textContent = totalSlots - bookedSlots;
    bookedSlotsEl.textContent = bookedSlots;
    progressFill.style.width = `${(bookedSlots / totalSlots) * 100}%`;

    availableSlots.style.color = totalSlots - bookedSlots <= 10 ? '#d81b60' : '#00c853';
    availableSlots.classList.add('animate');
    setTimeout(() => availableSlots.classList.remove('animate'), 500);
}

// Countdown timer
function startCountdown(startTime, endTime, token) {
    const countdown = document.getElementById('countdown-time');
    const now = new Date();
    const deadline = new Date(now.getTime() + 3 * 60000); // 3 minutes from now

    function updateCountdown() {
        const now = new Date();
        const timeLeft = deadline - now;
        if (timeLeft <= 0) {
            countdown.textContent = 'QR Code Expired';
            return;
        }
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        countdown.textContent = `${minutes}m ${seconds}s`;
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    setTimeout(() => clearInterval(interval), 3 * 60000); // Clear after 3 minutes
}

// Free slot by token, name, vehicle number, and slot number
document.getElementById('free-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const tokenInput = parseInt(document.getElementById('free-token').value);
    const userNameInput = document.getElementById('free-user-name').value.trim();
    const vehicleNumberInput = document.getElementById('free-vehicle-number').value.trim();
    const slotNumberInput = parseInt(document.getElementById('free-slot-number').value);

    if (!tokenInput || !userNameInput || !vehicleNumberInput || !slotNumberInput) {
        alert('Please fill in all fields!');
        return;
    }

    // Find the booking that matches all the provided details
    const bookingIndex = bookings.findIndex(booking => 
        booking.token === tokenInput &&
        booking.userDetails.name.toLowerCase() === userNameInput.toLowerCase() &&
        booking.userDetails.vehicleNumber.toLowerCase() === vehicleNumberInput.toLowerCase() &&
        booking.slotNumber === slotNumberInput
    );

    if (bookingIndex !== -1) {
        // Show confirmation modal
        showConfirmModal(bookingIndex);
    } else {
        alert('No matching booking found. Please check the details and try again.');
    }
});

// Show confirmation modal
function showConfirmModal(bookingIndex) {
    const modal = document.getElementById('confirm-modal');
    modal.style.display = 'block';

    document.getElementById('confirm-yes').onclick = function() {
        bookedSlots--;
        updateSlotDisplay();
        bookings.splice(bookingIndex, 1); // Remove the booking
        document.getElementById('booking-details').style.display = 'none';
        document.getElementById('free-token').value = '';
        document.getElementById('free-user-name').value = '';
        document.getElementById('free-vehicle-number').value = '';
        document.getElementById('free-slot-number').value = '';
        modal.style.display = 'none';
        alert('Slot freed successfully!');
        generateSlots();
    };

    document.getElementById('confirm-no').onclick = function() {
        modal.style.display = 'none';
    };
}

// Show confirmation modal
function showConfirmModal(bookingIndex) {
    const modal = document.getElementById('confirm-modal');
    modal.style.display = 'block';

    document.getElementById('confirm-yes').onclick = function() {
        bookedSlots--;
        updateSlotDisplay();
        bookings.splice(bookingIndex, 1); // Remove the booking
        document.getElementById('booking-details').style.display = 'none';
        document.getElementById('free-token').value = '';
        modal.style.display = 'none';
        alert('Slot freed successfully!');
        generateSlots();
    };

    document.getElementById('confirm-no').onclick = function() {
        modal.style.display = 'none';
    };
}

// Admin Password (Change this to a secure password)
const ADMIN_PASSWORD = "admin123"; // Replace with a strong password

// Show Password Prompt
document.getElementById('admin-toggle-btn').addEventListener('click', function() {
    document.getElementById('password-prompt').style.display = 'block';
});

// Validate Password
document.getElementById('submit-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('admin-password').value;
    const passwordError = document.getElementById('password-error');

    if (passwordInput === ADMIN_PASSWORD) {
        // Correct password: Show admin panel
        document.getElementById('password-prompt').style.display = 'none';
        document.getElementById('admin-panel').classList.remove('hidden');
    } else {
        // Incorrect password: Show error message
        passwordError.style.display = 'block';
    }
});

// Free Slot by Token (Admin)
document.getElementById('admin-free-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const tokenInput = parseInt(document.getElementById('admin-free-token').value);
    if (!tokenInput || isNaN(tokenInput)) {
        alert('Please enter a valid token!');
        return;
    }

    const bookingIndex = bookings.findIndex(booking => booking.token === tokenInput);
    if (bookingIndex !== -1) {
        bookedSlots--;
        updateSlotDisplay();
        bookings.splice(bookingIndex, 1); // Remove the booking
        alert('Slot freed successfully!');
        generateSlots();
    } else {
        alert('Invalid token! Please check and try again.');
    }
});

// Book Slot for User (Admin)
document.getElementById('admin-book-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const userName = document.getElementById('admin-user-name').value;
    const userPhone = document.getElementById('admin-user-phone').value;
    const vehicleNumber = document.getElementById('admin-vehicle-number').value;
    const slotNumber = parseInt(document.getElementById('admin-slot-number').value);

    if (!userName || !userPhone || !vehicleNumber || !slotNumber || slotNumber < 1 || slotNumber > 50) {
        alert('Please fill in all fields and choose a valid slot number!');
        return;
    }

    const isBooked = bookings.some(booking => booking.slotNumber === slotNumber);
    if (isBooked) {
        alert('This slot is already booked!');
        return;
    }

    bookedSlots++;
    updateSlotDisplay();

    const token = Math.floor(1000 + Math.random() * 9000);
    const booking = {
        slotNumber,
        token,
        bookingDate: new Date().toLocaleDateString(),
        startTime: new Date().toLocaleTimeString(),
        endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString(), // 2 hours from now
        userDetails: {
            name: userName,
            phone: userPhone,
            vehicleNumber: vehicleNumber
        }
    };
    bookings.push(booking);

    alert(`Slot ${slotNumber} booked successfully! Token: ${token}`);
    generateSlots();
});

// View Statistics
document.getElementById('view-stats-btn').addEventListener('click', function() {
    const statsList = document.getElementById('stats-list');
    statsList.innerHTML = '';

    const totalBookings = bookings.length;
    const revenue = totalBookings * 120; // ₹120 per booking

    statsList.innerHTML = `
        <p><strong>Total Bookings:</strong> ${totalBookings}</p>
        <p><strong>Total Revenue:</strong> ₹${revenue}</p>
    `;
});

// View Booking History in Admin Panel
document.getElementById('view-history-btn').addEventListener('click', function() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = ''; // Clear previous content

    if (bookings.length === 0) {
        historyList.innerHTML = '<p>No bookings found.</p>';
        return;
    }

    // Loop through bookings and display them
    bookings.forEach(booking => {
        const bookingItem = document.createElement('div');
        bookingItem.innerHTML = `
            <p><strong>Slot:</strong> ${booking.slotNumber}</p>
            <p><strong>Token:</strong> ${booking.token}</p>
            <p><strong>Date:</strong> ${booking.bookingDate}</p>
            <p><strong>Time:</strong> ${booking.startTime} to ${booking.endTime}</p>
            <p><strong>User:</strong> ${booking.userDetails.name}</p>
            <p><strong>Vehicle Number:</strong> ${booking.userDetails.vehicleNumber}</p>
            <hr>
        `;
        historyList.appendChild(bookingItem);
    });
});

// Function to show the payment section
function showPaymentSection() {
    const paymentSection = document.getElementById('payment-section');
    paymentSection.classList.remove('hidden'); // Show the payment section
}

// Function to close the payment section
function closePaymentSection() {
    const paymentSection = document.getElementById('payment-section');
    paymentSection.classList.add('hidden'); // Hide the payment section
}

// Function to download the static QR code
document.getElementById('download-payment-qr').addEventListener('click', function() {
    // Get the static QR code image
    const qrImage = document.getElementById('static-qr-code');

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrImage.src; // Use the source of the static QR code
    link.download = 'payment-qr-code.png'; // Set the download filename
    link.click(); // Trigger the download
});




// Initialize
generateSlots();
updateSlotDisplay();



