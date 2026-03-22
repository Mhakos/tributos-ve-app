const rifInput = document.getElementById('rif');
const emailInput = document.getElementById('email');
const nameInput = document.getElementById('name');
const submitButton = document.getElementById('submit');
const returnButton = document.getElementById('return-button');

// Validaciones Técnicas
const validateRIF = (rif) => /^[VJEFG]-?[0-9]{7,9}-?[0-9]$/i.test(rif);
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validateName = (name) => name.trim().length >= 3;

function checkFields() {
    const isNameValid = validateName(nameInput.value);
    const isRifValid = validateRIF(rifInput.value);
    const isEmailValid = validateEmail(emailInput.value);

    // Gestión de mensajes de error visuales
    document.getElementById('name-error').style.display = (nameInput.value && !isNameValid) ? 'block' : 'none';
    document.getElementById('rif-error').style.display = (rifInput.value && !isRifValid) ? 'block' : 'none';
    document.getElementById('email-error').style.display = (emailInput.value && !isEmailValid) ? 'block' : 'none';

    // Bloqueo de botón
    submitButton.disabled = !(isNameValid && isRifValid && isEmailValid);
}

// Escuchadores de eventos
[nameInput, rifInput, emailInput].forEach(input => input.addEventListener('input', checkFields));

// Función de diagnóstico (Ejemplo simplificado)
submitButton.addEventListener('click', () => {
    document.getElementById('form-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');
    
    // Aquí puedes integrar tu lógica de cálculo de riesgo
    document.getElementById('resultado-contenido').innerHTML = `
        <h2>Resultado: RIESGO CRÍTICO</h2>
        <p>Se han detectado inconsistencias graves en su perfil tributario.</p>
    `;
});

// Enlace de WhatsApp sin emojis y rotativo
document.getElementById('wa-button').addEventListener('click', () => {
    const asesores = ['584265112653', '584122089575'];
    const asesor = asesores[Math.floor(Math.random() * asesores.length)];
    
    const mensaje = `Hola! Mi nombre es ${nameInput.value}, RIF ${rifInput.value}. Mi resultado en el diagnóstico es RIESGO CRÍTICO. Mi correo es ${emailInput.value}. Necesito asesoría especializada urgente.`;
    
    window.open(`https://wa.me/${asesor}?text=${encodeURIComponent(mensaje)}`, '_blank');
});

// Botón volver al inicio
returnButton.addEventListener('click', () => window.location.reload());