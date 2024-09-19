document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager') {
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

document.getElementById('changeRoleForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    const requestData = { email, newRole: role };
    document.getElementById('submitBtn').disabled = true;

    try {
        const response = await fetch('http://localhost/MiniProjectAPI/api/Auth/ChangeUserRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        const messageElement = document.getElementById('responseMessage');
        if (response.ok && result.isSuccess) {
            messageElement.style.color = 'green';
            messageElement.textContent = 'Role changed successfully!';
        } else {
            messageElement.style.color = 'red';
            messageElement.textContent = result.message || 'Failed to change role.';
        }
    } catch (error) {
        console.error('Error:', error);
        const messageElement = document.getElementById('responseMessage');
        messageElement.style.color = 'red';
        messageElement.textContent = 'Error occurred while changing role.';
    } finally {
        document.getElementById('submitBtn').disabled = false;
    }
});

$(document).ready(function () {
    $('.tab-link[data-tab="role"]').addClass('active');
    $('#role').addClass('active-tab');

    $('.tab-link').on('click', function (e) {
        var href = $(this).attr('href');
        
        if (href === "" || href === "#") {
            e.preventDefault();
            $('.tab-link').removeClass('active');
            $('.tab-content').removeClass('active-tab');
            $(this).addClass('active');
            var tab = $(this).data('tab');
            $('#' + tab).addClass('active-tab');
        }
    });
});

////////////////////////////////////////////////////////////////////////
const ctx = document.getElementById('myBarChart').getContext('2d');
const myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Sample Data',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
///////////////////////////////////////////////////////////////////////
document.getElementById('product-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const vehicle = {
        Name: document.getElementById('product-name').value,
        Registration: document.getElementById('registration').value,
        Make: document.getElementById('Make').value,
        Model: document.getElementById('Model').value,
        Category: document.getElementById('Category').value,
        Description: document.getElementById('Description').value,
        Colors: document.getElementById('Color').value,
        AdditionalFeatures: document.getElementById('AdditionalFeatures').value,
        NumberOfSeats: document.getElementById('NumberOfSeats').value,
        Year: document.getElementById('Year').value,
        Mileage: document.getElementById('Mileage').value,
        DailyRate: document.getElementById('DailyRate').value
    };

    try {
        const response = await fetch('http://localhost/MiniProjectAPI/api/Vehicle/AddCar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(vehicle)
        });

        if (response.ok) {
            alert('Vehicle added successfully!');
            document.getElementById('product-form').reset();
        } else {
            const errorData = await response.json();
            alert('Failed to add vehicle: ' + (errorData.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the vehicle.');
    }
});

document.getElementById('image-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');

    const registration = document.getElementById('registrations').value;
    const imageFile = document.getElementById('CarImage').files[0];

    if (!registration || !imageFile) {
        alert("Please provide both a vehicle registration and an image file.");
        return;
    }

    const formData = new FormData();
    formData.append('Image', imageFile);

    try {
        const encodedRegistration = encodeURIComponent(registration);

        const response = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${encodedRegistration}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Image uploaded successfully!');
        } else {
            const errorData = await response.json();
            alert('Failed to upload image: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while uploading the image.');
    }
});

document.addEventListener('DOMContentLoaded', function() {

    const deleteForm = document.getElementById('delete-form');
    const vehicleDetails = document.querySelector('.vehicle-details');
    const vehicleImage = document.getElementById('vehicle-image');
    const vehicleName = document.getElementById('vehicle-name');
    const vehicleRegistration = document.getElementById('vehicle-registration');
    const vehicleMake = document.getElementById('vehicle-make');
    const vehicleModel = document.getElementById('vehicle-model');
    const vehicleCategory = document.getElementById('vehicle-category');
    const vehicleColors = document.getElementById('vehicle-colors');
    const vehicleSeats = document.getElementById('vehicle-seats');
    const vehicleMileage = document.getElementById('vehicle-mileage');
    const vehicleYear = document.getElementById('vehicle-year');
    const vehicleAdditionalFeatures = document.getElementById('vehicle-additional-features');
    const vehicleDailyRate = document.getElementById('vehicle-daily-rate');
    const vehicleDescription = document.getElementById('vehicle-description');
    const deleteNowButton = document.getElementById('delete-now-button');

    vehicleDetails.style.display = 'none'; 

    deleteForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const regs= document.getElementById('reg').value;


    if (!regs) {
        alert('Please enter a registration number.');
        return;
    }

        try {     
            const token = localStorage.getItem('token');

            const encodedRegistration = encodeURIComponent(regs);
                    console.log('Registration Value:', regs); // Debugging: Log registration value
                    console.log('encodeURIComponent Value:', encodedRegistration); // Debugging: Log registration value


            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);


            const url = `http://localhost/MiniProjectAPI/api/Vehicle/registrations?registration=${encodedRegistration}`;
        
            console.log('Request URL:', url);
        

            const response = await fetch(url, {headers});

            if (!response.ok) {
                throw new Error('Failed to fetch vehicle details');
            }

            const vehicle = await response.json();

            if (vehicle) {
                vehicleDetails.style.display = 'block';
                vehicleName.textContent = vehicle.name;
                vehicleRegistration.textContent = vehicle.registration;
                vehicleMake.textContent = vehicle.make;
                vehicleModel.textContent = vehicle.model;
                vehicleCategory.textContent = vehicle.category;
                vehicleColors.textContent = vehicle.colors;
                vehicleSeats.textContent = vehicle.numberOfSeats;
                vehicleMileage.textContent = vehicle.mileage;
                vehicleYear.textContent = vehicle.year;
                vehicleAdditionalFeatures.textContent = vehicle.additionalFeatures;
                vehicleDailyRate.textContent = vehicle.dailyRate;
                vehicleDescription.textContent = vehicle.description;

                const encodedRegistration = encodeURIComponent(regs);
                const imageResponse = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${encodedRegistration}/image`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                let imageUrl = '';
                if (imageResponse.ok) {
                    imageUrl = URL.createObjectURL(await imageResponse.blob());
                } else {
                    imageUrl = '../images/car13.jpg';
                }
                vehicleImage.src = imageUrl;
            } else {
                vehicleDetails.style.display = 'none'; 
                alert('Vehicle not found.');
            }
        } catch (error) {
            console.error('Error fetching vehicle details:', error);
            alert('Failed to load vehicle details.');
        }
    });

    deleteNowButton.addEventListener('click', async function() {
        const regi = document.getElementById('vehicle-registration').textContent;
          if (!regi) {
        alert('No vehicle registration found.');
        return;
    }

        const encodedRegistration = encodeURIComponent(regi);

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${encodedRegistration}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete vehicle');
            }

            alert('Vehicle deleted successfully.');
            vehicleDetails.style.display = 'none'; 
            deleteForm.reset();
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle.');
        }
    });
});
