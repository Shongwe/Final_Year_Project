/*Customers must be able to register for an account by providing details
such as name, address, phone number, email, and driver's license
information.*/
document.getElementById('registrationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const licenseInfo = document.getElementById('licenseInfo').value;

    const requestBody = {
        firstname: firstname,
        lastname: lastname,
        phoneNumber: phoneNumber,
        address: address,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        licenseInfo:licenseInfo
    };

    const response = await fetch('http://localhost/MiniProjectAPI/api/Auth/Register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const messageElement = document.getElementById('message');
    
    if (response.ok) {
        messageElement.style.color = 'green';
        messageElement.textContent = 'Registration successful!';
        window.location.href = 'login.html';
    } else {
        messageElement.style.color = 'red';
        messageElement.textContent = 'Failed to register.';
    }
});