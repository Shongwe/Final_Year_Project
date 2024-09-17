document.addEventListener('DOMContentLoaded', () => {
   loadStats();
    initializeChart();
    document.getElementById('role-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const role = document.getElementById('role').value;

        const url = 'http://localhost/MiniProjectAPI/api/Auth/ChangeUserRole';

       
        const data = {
            Email: username,
            NewRole: role
        };

       
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('jwtToken')
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.isSuccess) {
                alert('Role updated successfully');
            } else {
                alert('Failed to update role: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the role.');
        });
    });
});

document.getElementById('product-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const productName = document.getElementById('product-name').value;
        const registration = document.getElementById('registration').value;
        const Make = document.getElementById('Make').value;
        const Model = document.getElementById('Model').value;
        const Category = document.getElementById('Category').value;
        const AdditionalFeatures = document.getElementById('AdditionalFeatures').value;
        const NumberOfSeats = document.getElementById('NumberOfSeats').value;
        const Year = document.getElementById('Year').value;
        const DailyRate = document.getElementById('DailyRate').value;
        const Mileage = document.getElementById('Mileage').value;
        const Color=document.getElementById('Color').value;

        const vehicleData = {
            registration: registration,
            Make: Make,
            Model: Model,
            Category: Category,
            Color:Color,
            AdditionalFeatures: AdditionalFeatures,
            NumberOfSeats: NumberOfSeats,
            Year: Year,
            DailyRate: DailyRate,
            Mileage: Mileage,
        };
        console.log(JSON.stringify(vehicleData));

    fetch('http://localhost/MiniProjectAPI/api/Vehicle/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)  
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error adding vehicle:', error);
        alert('There was an error adding the vehicle. Please try again.');
    });

    });

    document.getElementById('image-form').addEventListener('submit', function (e) {
        e.preventDefault();
    
        const registration = document.getElementById('registration').value;
        const encodedRegistration = encodeURIComponent(registration);

        getVehicleByRegistration(registration)
        .then(vehicle => {
            console.log('Vehicle Details:', vehicle);
            alert(`Vehicle found: ${vehicle.make} ${vehicle.model}, Year: ${vehicle.year}`);

        })
        .catch(error => {
            alert('There was an error fetching the vehicle details.');
        })
        
    }); 
    

    function loadStats() {
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = `
            <p>Total Sales: $5000</p>
            <p>Products Sold: 200</p>
            <p>New Users: 50</p>
        `;
    }

    function initializeChart() {
        const data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'Sales',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                data: [65, 59, 80, 81, 56, 55, 40],
            }]
        };

        const config = {
            type: 'bar', 
            data: data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        const businessChart = new Chart(
            document.getElementById('businessChart'),
            config
        );
    }

async function getVehicleByRegistration(registration) {
    const encodedRegistration = encodeURIComponent(registration);
    console.log(encodedRegistration); 
    const url = `http://localhost/MiniProjectAPI/api/Vehicle/registrations?registration=${encodedRegistration}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Vehicle not found or server error');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


