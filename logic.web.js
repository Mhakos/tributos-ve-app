function validateRIF(rif) {
    const format = /^[VJEFG]-[0-9]{8}-[0-9]$/;
    return format.test(rif);
}

function validateEmail(email) {
    const format = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return format.test(email);
}

function validateName(name) {
    return name !== '';
}

const rifInput = document.getElementById('rif');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const submitButton = document.getElementById('submit');

rifInput.addEventListener('input', () => {
    const rif = rifInput.value;
    const error = document.getElementById('rif-error');
    if (!validateRIF(rif)) {
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
    validateForm();
});

emailInput.addEventListener('input', () => {
    const email = emailInput.value;
    const error = document.getElementById('email-error');
    if (!validateEmail(email)) {
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
    validateForm();
});

nameInput.addEventListener('input', () => {
    const name = nameInput.value;
    const error = document.getElementById('name-error');
    if (!validateName(name)) {
        error.style.display = 'block';
    } else {
        error.style.display = 'none';
    }
    validateForm();
});

function validateForm() {
    const rifError = document.getElementById('rif-error');
    const emailError = document.getElementById('email-error');
    const nameError = document.getElementById('name-error');
    if (rifError.style.display === 'none' && emailError.style.display === 'none' && nameError.style.display === 'none') {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}
