document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token || !userRole) {
        window.location.href = '../pages/login.html';
    } else if (userRole !== 'Manager') {
        window.location.href = '../pages/index.html';
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

$(document).ready(function () {
    $('.tab-link[data-tab="fleet"]').addClass('active');
    $('#fleet').addClass('active-tab');

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
        DailyRate: document.getElementById('DailyRate').value,
        Deleted: 0
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

        const regs = document.getElementById('reg').value;

        if (!regs) {
            alert('Please enter a registration number.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const encodedRegistration = encodeURIComponent(regs);
            console.log('Registration Value:', regs);
            console.log('encodeURIComponent Value:', encodedRegistration);

            const headers = new Headers();
            headers.append('Authorization', `Bearer ${token}`);

            const url = `http://localhost/MiniProjectAPI/api/Vehicle/registrations?registration=${encodedRegistration}`;
            console.log('Request URL:', url);

            const response = await fetch(url, { headers });

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
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete vehicle');
            }

            alert('Vehicle marked as deleted successfully.');
            vehicleDetails.style.display = 'none'; 
            deleteForm.reset();
        } catch (error) {
            console.error('Error marking vehicle as deleted:', error);
            alert('Failed to mark vehicle as deleted.');
        }
    });
});

document.getElementById('update-search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const registration = document.getElementById('ureg').value;
    const encodeRegistration = encodeURIComponent(registration);

    initializeForm(encodeRegistration);

});

document.getElementById('update-product-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const vehicle = {
        registration: document.getElementById('update-registration').value,
        make: document.getElementById('update-make').value,
        model: document.getElementById('update-model').value,
        category: document.getElementById('update-category').value,
        color: document.getElementById('update-color').value,
        description: document.getElementById('update-description').value,
        additionalFeatures: document.getElementById('update-additional-features').value,
        numberOfSeats: document.getElementById('update-number-of-seats').value,
        year: document.getElementById('update-year').value,
        mileage: document.getElementById('update-mileage').value,
        dailyRate: document.getElementById('update-daily-rate').value
    };

    fetch(`http://localhost/MiniProjectAPI/api/Vehicle/update/${vehicle.registration}?vehicleId=${vehicle.registration}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicle)
    })
    .then(response => {
        if (response.ok) {
            alert('Vehicle updated successfully!');
        } else {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
    })
    .catch(error => {
        console.error('Error updating vehicle:', error);
        alert('Error updating vehicle.');
    });
});

document.getElementById('image-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const registration = document.getElementById('uregistrations').value;
    const imageFile = document.getElementById('uCarImage').files[0];

    if (!registration || !imageFile) {
        alert("Please provide both a vehicle registration and an image file.");
        return;
    }

    const formData = new FormData();
    formData.append('Image', imageFile);

    const token = localStorage.getItem('token'); 
    const encodedRegistration = encodeURIComponent(registration);

    fetch(`http://localhost/MiniProjectAPI/api/Vehicle/${encodedRegistration}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            alert('Image uploaded successfully!');
        } else {
            return response.json().then(error => {
                throw new Error(error.message);
            });
        }
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
    });
});



async function initializeForm(vehicleReg) {
    const token = localStorage.getItem('token');

    try {

        const response = await fetch(`http://localhost/MiniProjectAPI/api/Vehicle/registrations?registration=${vehicleReg}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const vehicle = await response.json();

            document.getElementById('update-product-name').value = vehicle.name;
            document.getElementById('update-registration').value = vehicle.registration;
            document.getElementById('update-Make').value = vehicle.make;
            document.getElementById('update-Model').value = vehicle.model;
            document.getElementById('update-Category').value = vehicle.category;
            document.getElementById('update-Description').value = vehicle.description;
            document.getElementById('update-Color').value = vehicle.colors;
            document.getElementById('update-AdditionalFeatures').value = vehicle.additionalFeatures;
            document.getElementById('update-NumberOfSeats').value = vehicle.numberOfSeats;
            document.getElementById('update-Year').value = vehicle.year;
            document.getElementById('update-Mileage').value = vehicle.mileage;
            document.getElementById('update-DailyRate').value = vehicle.dailyRate;

        } else {
            alert('Failed to fetch vehicle details.');
        }
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        alert('An error occurred while fetching the vehicle details.');
    }
}

document.getElementById('cancel-button').addEventListener('click', function() {
    document.getElementById('update-form').reset();
});