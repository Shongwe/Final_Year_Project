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

function getUserIdFromToken(token) {
    const payloadBase64 = token.split('.')[1];
    const payload = atob(payloadBase64);
    const payloadObject = JSON.parse(payload);

    return payloadObject["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
}
const token = localStorage.getItem('token');
const userId= getUserIdFromToken(token);
const cartItemsUrl = `http://localhost/MiniProjectAPI/api/Cart/${userId}/items`;

async function fetchVehicleDetails(vehicleId) {

    var vehicleUrl = `http://localhost/MiniProjectAPI/api/Vehicle/${vehicleId}`;
    try {
        const response = await fetch(vehicleUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            return await response.json(); 
        } else {
            console.error('Failed to fetch vehicle details:', response.statusText);
            return null;
        }
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        return null;
    }
}

    async function fetchCartItems() {
        try {
            const response = await fetch(cartItemsUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const cartItems = await response.json();

                const structuredCartItems = await Promise.all(cartItems.map(async (item) => {
                    const vehicleDetails = await fetchVehicleDetails(item.vehicleId);

                    if (vehicleDetails) {
                        return {
                            cartItemId: item.cartItemId,
                            name: vehicleDetails.name,
                            imageUrl: `data:image/jpeg;base64,${vehicleDetails.carImage}`,  
                            price: vehicleDetails.dailyRate,
                            startDate: item.startDate,
                            endDate: item.endDate
                        };
                    } else {
                        return null;  
                    }
                }));

                const validCartItems = structuredCartItems.filter(item => item !== null);

                populateCartTable(validCartItems);
            } else {
                console.error('Failed to fetch cart items:', response.statusText);
                displayErrorMessage('Failed to load cart items');
            }
        } catch (error) {
            console.error('Error fetching cart items:', error);
            displayErrorMessage('An error occurred while loading the cart');
        }
    }

    fetchCartItems();

    function populateCartTable(items) {
        const cartItemsContainer = document.getElementById('cart-items');
        const totalPriceElement = document.getElementById('total-price');
    
        cartItemsContainer.innerHTML = '';  
        let totalPrice = 0;
    
        items.forEach(item => {
            const row = document.createElement('tr');
            console.log(item);
    
            const formattedStartDate = new Date(item.startDate).toISOString().split('T')[0];
            const formattedEndDate = new Date(item.endDate).toISOString().split('T')[0];
    
            const price = item.price ? item.price : 0;
            const formattedPrice = price.toFixed(2);
            const time = (new Date(item.endDate)).getTime() - (new Date(item.startDate)).getTime();
            const dayDiff = Math.round(time / (1000 * 3600 * 24));
    
            const totalprice = price * dayDiff;
            const formatedTotal = totalprice.toFixed(2);
    
            row.innerHTML = `
                <td><img src="${item.imageUrl}" alt="${item.name}" style="width: 100px; height: auto;"></td>
                <td>${item.name}</td>
                <td>R${formattedPrice}</td>
                <td>${formattedStartDate}</td>
                <td>${formattedEndDate}</td>
                <td>${dayDiff}</td>
                <td>R${formatedTotal}</td>
                <td><button class="remove-btn" data-id="${item.cartItemId}">Remove</button></td>
            `;
    
            cartItemsContainer.appendChild(row);
            totalPrice += totalprice;
    
            row.style.cursor = 'pointer';
            row.addEventListener('click', function (event) {
                if (event.target.tagName !== 'BUTTON') {
                    window.location.href = `../pages/editItem.html?cartItemId=${item.cartItemId}`;
                }
            });
        });
    
        totalPriceElement.textContent = `R${totalPrice.toFixed(2)}`;
    
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function (event) {
                event.stopPropagation(); 
                const itemId = parseInt(this.getAttribute('data-id'));
                removeFromCart(itemId); 
            });
        });
    }
    
    function removeFromCart(itemId) {
        console.log(`Removing item with ID: ${itemId}`);
        const token = localStorage.getItem('token');
        const userId= getUserIdFromToken(token);
        const url =`http://localhost/MiniProjectAPI/api/Cart/${userId}/remove-item/${itemId}`;
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        headers.append('Content-Type', 'application/json');


    fetch(url, {
        method: 'POST',
        headers: headers
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to remove item from cart.');
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Item removed successfully:', data);
        window.location.reload();

    })
    .catch(error => {
        console.error('Error removing the item:', error);
    });

    }

async function checkoutCart() {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken(token);

    const response = await fetch(`http://localhost/MiniProjectAPI/api/Cart/${userId}/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to checkout cart.');
    }

    const data = await response.json();
    console.log('Checkout response:', data);
    window.location.href = '../pages/confirmation.html'; 
}
document.getElementById('checkout-btn').addEventListener('click', () => {
    alert("check-out");
    checkoutCart().catch(error => console.error('Error during checkout:', error));
});