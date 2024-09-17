document.getElementById('search-icon').addEventListener('click', function(event) {
    event.preventDefault();
    var searchForm = document.getElementById('search-form');
    searchForm.classList.toggle('active');
    
    if (searchForm.classList.contains('active')) {
        document.getElementById('search-input').focus();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const cars = [
        {
            name: "Toyota corola",
            image: "images/car12.jpg",
            description: "Luxury sedan with advanced autopilot features.",
            dailyRate: 200,
            totalCost: 0,
            startDate: '',
            endDate: ''
        },
        {
            name: "VW Polo",
            image: "images/car15.jpg",
            description: "A good Sports car with a powerful engine.",
            dailyRate: 450,
            totalCost: 0,
            startDate: '',
            endDate: ''
        },
        {
            name: "Honda jazz",
            image: "images/car13.jpg",
            description: "Spacious honda jazz with top-notch interior and technology.",
            dailyRate: 340,
            totalCost: 0,
            startDate: '',
            endDate: ''
        },
        {
            name: "Audi A4",
            image: "images/car14.jpg",
            description: "Iconic Audi A4 with a thrilling driving experience.",
            dailyRate: 550,
            totalCost: 0,
            startDate: '',
            endDate: ''
        }
    ];

    const carList = document.getElementById('car-list');
    const cartItems = document.getElementById('cart-items');

    const cart = [];

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';

        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}">
            <h3>${car.name}</h3>
            <p>${car.description}</p>
            <p>Daily Rate: R${car.dailyRate}</p>
            <button class="rent-button">Rent Now</button>
        `;

        carCard.querySelector('.rent-button').addEventListener('click', () => {
            addToCart(car);
        });

        carList.appendChild(carCard);
    });



function addToCart(car) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingCar = cart.find(item => item.name === car.name);

    if (existingCar) {
        alert('This car is already in the cart. Update the rental dates in the cart if needed.');
    } else {
        cart.push({ ...car, startDate: '', endDate: '', totalCost: 0 });
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${car.name} added to the cart. Proceed to cart for details.`);
    }
}

carCard.querySelector('.rent-button').addEventListener('click', () => {
    addToCart(car);
    window.location.href = "cart.html";  // Redirect to cart page after adding
});


    function updateCartUI() {
        cartItems.innerHTML = ''; // Clear the current cart items

        cart.forEach((car, index) => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${car.name}</td>
                <td><input type="date" class="form-control" onchange="updateCartDate(${index}, 'startDate', this.value)" value="${car.startDate}"></td>
                <td><input type="date" class="form-control" onchange="updateCartDate(${index}, 'endDate', this.value)" value="${car.endDate}"></td>
                <td>$${car.dailyRate}</td>
                <td id="total-cost-${index}">$${car.totalCost.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            cartItems.appendChild(tr);
        });
    }

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Proceeding to checkout with the following items: \n' + cart.map(car => `${car.name} (Total Cost: $${car.totalCost.toFixed(2)})`).join('\n'));
            // Add your checkout logic here
        } else {
            alert('Your cart is empty.');
        }
    });

    window.updateCartDate = function(index, dateType, value) {
        const car = cart[index];
        car[dateType] = value;

        if (car.startDate && car.endDate) {
            const startDate = new Date(car.startDate);
            const endDate = new Date(car.endDate);

            const timeDiff = endDate.getTime() - startDate.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysDiff > 0) {
                car.totalCost = daysDiff * car.dailyRate;
                document.getElementById(`total-cost-${index}`).textContent = `$${car.totalCost.toFixed(2)}`;
            } else {
                alert('End date must be after the start date.');
                car.endDate = '';
                updateCartUI();
            }
        }
       
    }
});