document.getElementById('search-icon').addEventListener('click', function(event) {
    event.preventDefault();
    var searchForm = document.getElementById('search-form');
    searchForm.classList.toggle('active');
    
    if (searchForm.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const carList = document.getElementById('car-list');
    const cartItems = document.getElementById('cart-items');
    const cart = [];

    try {
        const response = await fetch('http://localhost/MiniProjectAPI/api/Vehicle');
        
        if (!response.ok) {
            throw new Error('Failed to fetch vehicles');
        }

        const vehicles = await response.json();

        for (const vehicle of vehicles) {

                    console.log(vehicle);

            const imageResponse = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${vehicle.registration}/image`);
            let imageUrl = '';

            if (imageResponse.ok) {
                imageUrl = URL.createObjectURL(await imageResponse.blob());
            } else {
                imageUrl = '../car13.jpg';
            }

            const carCard = document.createElement('div');
            carCard.className = 'car-card';

            carCard.innerHTML = `
                <img src="${imageUrl}" alt="${vehicle.name}" style="width: 100%; height: auto;">
                <h3>${vehicle.name}</h3>
                <p>${vehicle.description}</p>
                <p>Daily Rate: R${vehicle.dailyRate}</p>
                <button class="rent-button">Rent Now</button>
            `;

            carCard.addEventListener('click', () => {
                window.location.href = `single_car.html?registration=${encodeURIComponent(vehicle.registration)}`;
            });

            carCard.querySelector('.rent-button').addEventListener('click', () => {
                addToCart(vehicle);
            });

            carList.appendChild(carCard);
        }

    } catch (error) {
        console.error('Error fetching vehicles:', error);
        alert('Failed to load vehicles.');
    }

    function addToCart(car) {
        cart.push(car);
        updateCartDisplay();
    }

    function updateCartDisplay() {
        cartItems.innerHTML = cart.map(car => `
            <div class="cart-item">
                <h4>${car.Name}</h4>
                <p>Daily Rate: R${car.DailyRate}</p>
            </div>
        `).join('');
    }
});