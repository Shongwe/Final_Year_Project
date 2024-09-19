document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager' && userRole !== 'Admin' && userRole !== 'User') {
        window.location.href = '../pages/index.html';
    } else {
        validateToken(token);
        setupAccountIcons();
    }

    document.getElementById('search-icon').addEventListener('click', function(event) {
        event.preventDefault();
        var searchForm = document.getElementById('search-form');
        searchForm.classList.toggle('active');

        if (searchForm.classList.contains('active')) {
            document.getElementById('search-input').focus();
        }
    });
});

function validateToken(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expTime = payload.exp * 1000;
    const currentTime = Date.now();

    if (currentTime > expTime) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.location.href = '../pages/login.html';
    }
}
function setupAccountIcons() {
    const isLoggedIn = !!localStorage.getItem('token');
    const iconContainer = document.getElementById('account-icon-container');

    if (isLoggedIn) {
        iconContainer.innerHTML = `
            <a href="../pages/profile.html" class="ml-3">
                <svg class="icon">
                    <use xlink:href="#user"></use>
                </svg>
            </a>
            <a href="/cart.html" class="ml-3">
                <svg class="icon">
                    <use xlink:href="#cart"></use>
                </svg>
            </a>
            <a href="#" onclick="logout()">
                <svg class="icon">
                    <use href="#logout"></use>
                </svg>
            </a>`;
    } else {
        iconContainer.innerHTML = `
            <a href="../pages/login.html">
                <svg class="icon">
                    <use href="#user"></use>
                </svg>
            </a>`;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}



document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const registration = urlParams.get('registration');
    console.log(registration);

    if (!registration) {
        alert('No vehicle registration provided.');
        return;
    }
    const token = localStorage.getItem('token'); 

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${token}`);

    try {
        const response = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/registrations?registration=${encodeURIComponent(registration)}`, { headers });

        if (!response.ok) {
            throw new Error('Failed to fetch vehicle details');
        }

        const vehicle = await response.json();

        const imageResponse = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${registration}/image`, { headers });
        let imageUrl = '';

        if (imageResponse.ok) {
            imageUrl = URL.createObjectURL(await imageResponse.blob());
        } else {
            imageUrl = '../images/car13.jpg'; 
        }

        document.getElementById('vehicle-name').textContent = vehicle.name;
        document.getElementById('vehicle-registration').textContent = vehicle.registration;
        document.getElementById('vehicle-make').textContent = vehicle.make;
        document.getElementById('vehicle-model').textContent = vehicle.model;
        document.getElementById('vehicle-category').textContent = vehicle.category;
        document.getElementById('vehicle-colors').textContent = vehicle.colors;
        document.getElementById('vehicle-seats').textContent = vehicle.numberOfSeats;
        document.getElementById('vehicle-mileage').textContent = vehicle.mileage;
        document.getElementById('vehicle-year').textContent = vehicle.year;
        document.getElementById('vehicle-additional-features').textContent = vehicle.additionalFeatures;
        document.getElementById('vehicle-daily-rate').textContent = vehicle.dailyRate;
        document.getElementById('vehicle-description').textContent = vehicle.description;
        document.getElementById('vehicle-image').src = imageUrl;

        document.getElementById('rent-now-button').addEventListener('click', () => {
            addToCart(vehicle); 
        });

        document.getElementById('back-button').addEventListener('click', () => {
            window.location.href = '../pages/dashboard.html';
        });

    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        alert('Failed to load vehicle details.');
    }
});

async function addToCart(vehicle) {

    const token = localStorage.getItem('token'); 
    const userId=getUserIdFromToken(token);
    const encodedUserId=encodeURIComponent(userId);
    const cartPageUrl = `../pages/cart.html?id=${encodeURIComponent(vehicle.vehicleId)}&name=${encodeURIComponent(vehicle.name)}&dailyRate=${encodeURIComponent(vehicle.dailyRate)}&registration=${encodeURIComponent(vehicle.registration)}&userId=${userId}`;

    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        displayErrorMessage("Both start and end dates must be selected.");
        return;
    }

    if (new Date(startDate) > new Date(endDate)) {
        displayErrorMessage("The start date cannot be later than the end date.");
        return;
    }

    const startDates = new Date(startDate).toISOString().split('T')[0];
    const endDates = new Date(endDate).toISOString().split('T')[0];
    console.log(vehicle);
    console.log(encodedUserId);
    console.log(vehicle.vehicleId);
    console.log(vehicle.dailyRate);
    console.log(startDates);
    console.log(endDates);
    clearErrorMessage(); 


    const url =`http://localhost/MiniProjectAPI/api/Cart/${encodedUserId}/add-item?vehicleId=${vehicle.vehicleId}&dailyRate=${vehicle.dailyRate}&startDate=${startDates}&endDate=${endDates}`;
    
    try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
    
        if (response.ok) {
          const data = await response.json();
          console.log("Response:", data);
          window.location.href = cartPageUrl;

        } else {
            const errorData = await response.json(); 
            console.error("Error:", response.statusText);
            displayErrorMessage(errorData.message);

        }
      } catch (error) {
        console.error("Request failed:", error);
        displayErrorMessage('An unexpected error occurred. Please try again.'); 

      }
}

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1]; 
    const payload = atob(payloadBase64); 
    const payloadObject = JSON.parse(payload); 

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}

function displayErrorMessage(message) {
    const errorMessageDiv = document.getElementById("error-message");
    errorMessageDiv.style.display = "block";
    errorMessageDiv.textContent = message;
  }
  
function clearErrorMessage() {
    const errorMessageDiv = document.getElementById("error-message");
    errorMessageDiv.style.display = "none";
    errorMessageDiv.textContent = "";
}