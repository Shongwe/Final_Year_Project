document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager' && userRole !== 'Admin' && userRole !== 'User') {
        window.location.href = '../index.html';
    } else {
        validateToken(token);
    }


    fetchCartItems();

    const urlParams = new URLSearchParams(window.location.search);
    const vehicleName = urlParams.get('name');
    const vehicleDailyRate = urlParams.get('dailyRate');
    const vehicleRegistration = urlParams.get('registration');
    const vehicleId = urlParams.get('vehicleId');
    const startDate = urlParams.get('startDate');
    const endDate = urlParams.get('endDate');

    if (vehicleId && vehicleName && vehicleDailyRate) {
        addToCart({
            id: vehicleId,
            name: vehicleName,
            dailyRate: vehicleDailyRate,
            registration: vehicleRegistration,
            startDate:startDate,
            endDate:endDate
        });
    }
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

async function addToCart(vehicle) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingVehicle = cart.find(item => item.id === vehicle.id);
    if (!existingVehicle) {
        cart.push(vehicle); 
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay(cart); 
}

async function fetchCartItems() {
    const cartItemsElement = document.getElementById('cart-items');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    try {
        const response = await fetch(`http://localhost/MiniProjectAPI/api/Cart/${userId}/items`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const cartData = await response.json();
            if (cartData.length === 0) {
                displayEmptyCartMessage();
            } else {
                cart.push(...cartData); 
            }
        } else if (response.status === 404) {
            displayEmptyCartMessage();
        } else {
            throw new Error('Failed to fetch cart items from the API');
        }
    } catch (error) {
        console.error('Error fetching cart items:', error);
    }

    updateCartDisplay(cart);
}

function displayEmptyCartMessage() {
    const cartItemsElement = document.getElementById('cart-items');
    cartItemsElement.innerHTML = '<p>Your cart is empty.</p>';
}

function updateCartDisplay(cart) {
    const cartItemsElement = document.getElementById('cart-items');
    cartItemsElement.innerHTML = cart.map(car => `
        <div class="cart-item">
            <h4>${car.name}</h4>
            <p>Registration: ${car.registration}</p>
            <p>Daily Rate: R${car.dailyRate}</p>
        </div>
    `).join('');
}

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1];
    const payload = atob(payloadBase64);
    const payloadObject = JSON.parse(payload);

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}