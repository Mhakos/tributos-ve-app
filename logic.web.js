// Elementos del DOM
const rifInput = document.getElementById('rif');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const submitButton = document.getElementById('submit');
const returnButton = document.getElementById('return-button');

// Validaciones
function validateRIF(rif) {
    // Acepta formatos con o sin guiones: V123456789, V-12345678-9
    const format = /^[VJEFG]-?[0-9]{7,9}-?[0-9]$/i;
    return format.test(rif);
}

function validateEmail(email) {
    const format = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return format.test(email);
}

function validateName(name) {
    return name.trim().length >= 3;
}

// Manejadores de Eventos
function checkFields() {
    const isNameValid = validateName(nameInput.value);
    const isRifValid = validateRIF(rifInput.value);
    const isEmailValid = validateEmail(emailInput.value);

    // Mostrar/Ocultar mensajes de error
    document.getElementById('name-error').style.display = (nameInput.value && !isNameValid) ? 'block' : 'none';
    document.getElementById('rif-error').style.display = (rifInput.value && !isRifValid) ? 'block' : 'none';
    document.getElementById('email-error').style.display = (emailInput.value && !isEmailValid) ? 'block' : 'none';

    // Activar/Desactivar botón
    submitButton.disabled = !(isNameValid && isRifValid && isEmailValid);
}

nameInput.addEventListener('input', checkFields);
rifInput.addEventListener('input', checkFields);
emailInput.addEventListener('input', checkFields);

// Función para enviar a WhatsApp (Rotación de asesores)
function enviarAsesoria(nivelRiesgo) {
    const asesores = ['584265112653', '584122089575'];
    const asesorElegido = asesores[Math.floor(Math.random() * asesores.length)];
    
    // MENSAJE PROFESIONAL SIN EMOJIS
    const mensaje = `Hola! Mi nombre es ${nameInput.value}, RIF ${rifInput.value}. Mi resultado en el diagnóstico es RIESGO ${nivelRiesgo}. Mi correo es ${emailInput.value}. Necesito asesoría especializada urgente.`;

    const url = `https://wa.me/${asesorElegido}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// Botón de Reinicio
returnButton.addEventListener('click', () => {
    window.location.reload(); // La forma más limpia de resetear todo el estado
});