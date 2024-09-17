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
            alert('Button clicked in event.');

            addToCart(vehicle); 
        });

    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        alert('Failed to load vehicle details.');
    }
});

async function addToCart(vehicle) {
    alert('Button clicked in function.');

    const { id, name, dailyRate, registration } = vehicle;
    
    const cartPageUrl = `../pages/cart.html?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&dailyRate=${encodeURIComponent(dailyRate)}&registration=${encodeURIComponent(registration)}`;
    
    window.location.href = cartPageUrl;
}
