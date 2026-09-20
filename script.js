document.addEventListener('DOMContentLoaded', () => {
    console.log('--- Sistema Web Municipalidad de Molina Cargado ---');

    obtenerClimaMolina();
    obtenerIndicadores();

    activarFiltrosTramites();

    activarFormularioVecinal();

    activarAsistenteMoli();
});

async function obtenerClimaMolina() {
    const contenedorClima = document.getElementById('info-clima');
    if (!contenedorClima) return;

    try {
        const urlAPI = 'https://api.open-meteo.com/v1/forecast?latitude=-35.1147&longitude=-71.2829&current_weather=true';
        const respuesta = await fetch(urlAPI);

        if (!respuesta.ok) throw new Error('Error al conectar con la API del clima');

        const datos = await respuesta.json();
        const temperatura = Math.round(datos.current_weather.temperature);

        contenedorClima.innerHTML = `
            <i class="fas fa-sun text-warning me-2 fa-lg"></i>
            <span><strong>Clima Molina:</strong> ${temperatura}°C | Despejado</span>
        `;
        console.log('API Fetch Clima:', { ciudad: 'Molina', temperatura: `${temperatura}°C` });

    } catch (error) {
        console.log('Nota: Se utiliza clima de respaldo por falla de red:', error);
        contenedorClima.innerHTML = `
            <i class="fas fa-sun text-warning me-2 fa-lg"></i>
            <span><strong>Clima Molina:</strong> 19°C | Despejado</span>
        `;
    }
}

async function obtenerIndicadores() {
    const contenedorIndicadores = document.getElementById('info-indicadores');
    if (!contenedorIndicadores) return;

    try {
        const urlAPI = 'https://mindicador.cl/api';
        const respuesta = await fetch(urlAPI);

        if (!respuesta.ok) throw new Error('Error en la respuesta de la API');

        const datos = await respuesta.json();
        const uf = datos.uf ? Math.round(datos.uf.valor).toLocaleString('es-CL') : '38.500';
        const utm = datos.utm ? Math.round(datos.utm.valor).toLocaleString('es-CL') : '66.800';
        const dolar = datos.dolar ? Math.round(datos.dolar.valor).toLocaleString('es-CL') : '940';

        contenedorIndicadores.innerHTML = `
            <span><strong>UF:</strong> $${uf}</span>
            <span>|</span>
            <span><strong>UTM:</strong> $${utm}</span>
            <span>|</span>
            <span><strong>Dólar:</strong> $${dolar}</span>
        `;
        console.log('API Fetch Indicadores:', { UF: uf, UTM: utm, Dolar: dolar });

    } catch (error) {
        console.log('Nota: Se muestran valores referenciales por falta de conexión:', error);
        contenedorIndicadores.innerHTML = `
            <span><strong>UF:</strong> $38.550</span>
            <span>|</span>
            <span><strong>UTM:</strong> $66.820</span>
            <span>|</span>
            <span><strong>Dólar:</strong> $945</span>
        `;
    }
}

function activarFiltrosTramites() {
    const botonesFiltro = document.querySelectorAll('.btn-filtro');
    const tarjetasTramite = document.querySelectorAll('.item-tramite');

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const categoria = e.target.getAttribute('data-categoria');

            botonesFiltro.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            tarjetasTramite.forEach(tarjeta => {
                const catTarjeta = tarjeta.getAttribute('data-categoria');
                if (categoria === 'todos' || catTarjeta === categoria) {
                    tarjeta.style.display = 'block';
                } else {
                    tarjeta.style.display = 'none';
                }
            });
            console.log(`Filtro seleccionado: ${categoria}`);
        });
    });
}

function activarAsistenteMoli() {
    const btnToggle = document.getElementById('btnToggleChat');
    const btnCerrar = document.getElementById('btnCerrarChat');
    const cajaChat = document.getElementById('cajaChatMoli');
    const chatBody = document.getElementById('chatBody');
    const inputMsg = document.getElementById('inputChatMsg');
    const btnEnviar = document.getElementById('btnEnviarChat');
    const opcionesBtns = document.querySelectorAll('.chat-opcion-btn');

    if (!btnToggle || !cajaChat) return;

    btnToggle.addEventListener('click', () => {
        cajaChat.classList.toggle('d-none');
    });

    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            cajaChat.classList.add('d-none');
        });
    }

    const enviarMensaje = (texto) => {
        const msg = texto || (inputMsg ? inputMsg.value.trim() : '');
        if (!msg) return;

        const divUsuario = document.createElement('div');
        divUsuario.className = 'mensaje-chat mensaje-usuario p-3 rounded-4 shadow-sm mb-3';
        divUsuario.innerHTML = `<p class="mb-0 fs-7">${sanitizarTexto(msg)}</p>`;
        chatBody.appendChild(divUsuario);

        if (inputMsg) inputMsg.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
            let respuestaMoli = 'Entiendo tu consulta. Puedes enviarnos los detalles mediante el **Formulario de Atención al Vecino** o llamando a nuestra mesa central al **(75) 256 5600**.';

            const msgMinuscula = msg.toLowerCase();
            if (msgMinuscula.includes('permiso') || msgMinuscula.includes('circulacion') || msgMinuscula.includes('vehiculo')) {
                respuestaMoli = 'Para renovar tu **Permiso de Circulación**, puedes hacer clic en la opción en la sección de *Trámites Digitales* o acceder directamente al portal de pagos.';
            } else if (msgMinuscula.includes('dideco') || msgMinuscula.includes('beneficio') || msgMinuscula.includes('social') || msgMinuscula.includes('ayuda')) {
                respuestaMoli = 'La **Guía de Beneficios Sociales** de la DIDECO incluye subsidios de agua potable, becas de estudio y ayudas de emergencia. Puedes consultar en el formulario.';
            } else if (msgMinuscula.includes('horario') || msgMinuscula.includes('atencion') || msgMinuscula.includes('abierto')) {
                respuestaMoli = 'La Municipalidad de Molina atiende de **Lunes a Viernes de 08:30 a 14:00 hrs** en Yerbas Buenas #1390. ¡Para emergencias llama al **1462**!';
            }

            const divMoli = document.createElement('div');
            divMoli.className = 'mensaje-chat moli-mensaje p-3 rounded-4 bg-light shadow-sm mb-3';
            divMoli.innerHTML = `<p class="mb-0 fs-7">${respuestaMoli}</p>`;
            chatBody.appendChild(divMoli);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 500);
    };

    if (btnEnviar) {
        btnEnviar.addEventListener('click', () => enviarMensaje());
    }

    if (inputMsg) {
        inputMsg.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensaje();
        });
    }

    opcionesBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const pregunta = btn.getAttribute('data-pregunta');
            enviarMensaje(pregunta);
        });
    });
}

function sanitizarTexto(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

function activarFormularioVecinal() {
    const formulario = document.getElementById('formVecinal');
    const btnResetear = document.getElementById('btnResetear');
    const cajaAlerta = document.getElementById('cajaAlerta');
    const mensajeAlerta = document.getElementById('mensajeAlerta');
    const inputRut = document.getElementById('campoRut');

    if (!formulario) return;

    const campoNombre = document.getElementById('campoNombre');
    const campoEmail = document.getElementById('campoEmail');
    const campoTelefono = document.getElementById('campoTelefono');
    const campoSector = document.getElementById('campoSector');
    const campoTipo = document.getElementById('campoTipo');
    const campoMensaje = document.getElementById('campoMensaje');
    const campoTerminos = document.getElementById('campoTerminos');

    if (inputRut) {
        inputRut.addEventListener('input', (e) => {
            e.target.value = formatearRut(e.target.value);
            if (inputRut.classList.contains('is-invalid') || inputRut.classList.contains('is-valid')) {
                marcarCampo(inputRut, validarRutChileno(inputRut.value.trim()));
            }
        });

        inputRut.addEventListener('blur', () => {
            if (inputRut.value.trim() !== '') {
                marcarCampo(inputRut, validarRutChileno(inputRut.value.trim()));
            }
        });
    }

    if (campoTelefono) {
        campoTelefono.addEventListener('input', (e) => {
            e.target.value = formatearTelefonoChileno(e.target.value);
            if (campoTelefono.classList.contains('is-invalid') || campoTelefono.classList.contains('is-valid')) {
                marcarCampo(campoTelefono, validarTelefono(campoTelefono.value));
            }
        });

        campoTelefono.addEventListener('blur', () => {
            if (campoTelefono.value.trim() !== '') {
                marcarCampo(campoTelefono, validarTelefono(campoTelefono.value));
            }
        });
    }

    const camposParaValidar = [
        { el: campoNombre, fn: (v) => validarNombre(v) },
        { el: campoEmail, fn: (v) => validarEmail(v) },
        { el: campoTelefono, fn: (v) => validarTelefono(v) },
        { el: campoSector, fn: (v) => v !== '' },
        { el: campoTipo, fn: (v) => v !== '' },
        { el: campoMensaje, fn: (v) => v.trim().length >= 10 }
    ];

    camposParaValidar.forEach(({ el, fn }) => {
        if (!el) return;
        el.addEventListener('blur', () => {
            if (el.value.trim() !== '') {
                marcarCampo(el, fn(el.value));
            }
        });
        el.addEventListener('input', () => {
            if (el.classList.contains('is-invalid')) {
                marcarCampo(el, fn(el.value));
            }
        });
    });

    if (campoTerminos) {
        campoTerminos.addEventListener('change', () => {
            marcarCampo(campoTerminos, campoTerminos.checked);
        });
    }

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = campoNombre ? campoNombre.value.trim() : '';
        const rut = inputRut ? inputRut.value.trim() : '';
        const email = campoEmail ? campoEmail.value.trim() : '';
        const telefonoDigitos = campoTelefono ? campoTelefono.value.trim() : '';
        const telefonoCompleto = telefonoDigitos !== '' ? `+56 ${telefonoDigitos}` : '';
        const sector = campoSector ? campoSector.value : '';
        const tipoSolicitud = campoTipo ? campoTipo.value : '';
        const mensaje = campoMensaje ? campoMensaje.value.trim() : '';
        const aceptaTerminos = campoTerminos ? campoTerminos.checked : false;

        const esNombreValido = validarNombre(nombre);
        const esRutValido = validarRutChileno(rut);
        const esEmailValido = validarEmail(email);
        const esTelefonoValido = validarTelefono(telefonoDigitos);
        const esSectorValido = sector !== '';
        const esTipoValido = tipoSolicitud !== '';
        const esMensajeValido = mensaje.length >= 10;

        marcarCampo(campoNombre, esNombreValido);
        marcarCampo(inputRut, esRutValido);
        marcarCampo(campoEmail, esEmailValido);
        marcarCampo(campoTelefono, esTelefonoValido);
        marcarCampo(campoSector, esSectorValido);
        marcarCampo(campoTipo, esTipoValido);
        marcarCampo(campoMensaje, esMensajeValido);
        marcarCampo(campoTerminos, aceptaTerminos);

        if (!esNombreValido || !esRutValido || !esEmailValido || !esTelefonoValido || !esSectorValido || !esTipoValido || !esMensajeValido || !aceptaTerminos) {
            let mensajeError = '⚠️ Por favor revisa los campos destacados en rojo:';
            if (!esNombreValido) mensajeError += ' El nombre solo debe contener letras (mínimo 3 caracteres, sin números ni símbolos).';
            else if (!esRutValido && rut !== '') mensajeError += ' El RUT ingresado no es válido (verifique el dígito verificador).';
            else if (!esTelefonoValido) mensajeError += ' El teléfono debe contener 9 dígitos (ej: 9 1234 5678).';
            else if (!esEmailValido) mensajeError += ' Ingrese un correo electrónico válido.';

            mostrarAlerta(cajaAlerta, mensajeAlerta, 'danger', mensajeError);
            console.log('Error: Formulario no enviado por datos incorrectos o incompletos.');
            return;
        }

        console.log("=== SOLICITUD VECINAL REGISTRADA CON ÉXITO ===");
        console.log("Nombre Solicitante:", nombre);
        console.log("RUT               :", rut);
        console.log("Correo Electrónico:", email);
        console.log("Teléfono          :", telefonoCompleto);
        console.log("Sector Residencial:", sector);
        console.log("Tipo de Solicitud :", tipoSolicitud);
        console.log("Detalle Mensaje   :", mensaje);
        console.log("Fecha y Hora      :", new Date().toLocaleString('es-CL'));
        console.log("==============================================");

        const nombreSeguro = sanitizarTexto(nombre);
        const tipoSeguro = sanitizarTexto(tipoSolicitud);
        const emailSeguro = sanitizarTexto(email);

        mostrarAlerta(
            cajaAlerta,
            mensajeAlerta,
            'success',
            `✅ ¡Gracias <strong>${nombreSeguro}</strong>! Tu solicitud sobre <strong>"${tipoSeguro}"</strong> fue registrada correctamente. Te contactaremos al correo <strong>${emailSeguro}</strong>.`
        );

        formulario.reset();
        limpiarEstilosValidacion(formulario);
    });

    if (btnResetear) {
        btnResetear.addEventListener('click', () => {
            formulario.reset();
            limpiarEstilosValidacion(formulario);
            if (cajaAlerta) cajaAlerta.classList.add('d-none');
            console.log('Formulario reseteado por el usuario.');
        });
    }
}

function validarNombre(nombre) {
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/;
    return regexNombre.test(nombre.trim());
}

function formatearTelefonoChileno(valor) {
    let digitos = valor.replace(/[^0-9]/g, '');
    if (digitos.startsWith('56')) {
        digitos = digitos.slice(2);
    }
    digitos = digitos.slice(0, 9);

    if (digitos.length === 0) return '';
    if (digitos.length <= 1) return digitos;
    if (digitos.length <= 5) return `${digitos.slice(0, 1)} ${digitos.slice(1)}`;
    return `${digitos.slice(0, 1)} ${digitos.slice(1, 5)} ${digitos.slice(5)}`;
}

function validarTelefono(telefono) {
    let digitos = telefono.replace(/[^0-9]/g, '');
    if (digitos.startsWith('56')) {
        digitos = digitos.slice(2);
    }
    return digitos.length === 9;
}

function formatearRut(rut) {
    let valor = rut.replace(/[^0-9kK]/g, '');
    if (valor.length <= 1) return valor;
    let cuerpo = valor.slice(0, -1);
    let dv = valor.slice(-1).toUpperCase();
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${cuerpo}-${dv}`;
}

function validarRutChileno(rut) {
    let limpio = rut.replace(/\./g, '').replace('-', '');
    if (limpio.length < 8 || limpio.length > 9) return false;
    let cuerpo = limpio.slice(0, -1);
    let dvIngresado = limpio.slice(-1).toUpperCase();
    let suma = 0;
    let multiplo = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    let dvEsperado = 11 - (suma % 11);
    let dvCalc = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    return dvIngresado === dvCalc;
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function marcarCampo(inputElement, esValido) {
    if (!inputElement) return;
    if (esValido) {
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
    } else {
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
    }
}

function limpiarEstilosValidacion(formElement) {
    const inputs = formElement.querySelectorAll('.form-control, .form-select, .form-check-input');
    inputs.forEach(input => input.classList.remove('is-valid', 'is-invalid'));
}

function mostrarAlerta(caja, mensaje, tipo, textoHtml) {
    if (!caja || !mensaje) return;
    caja.className = `alert alert-${tipo} alert-dismissible fade show mb-4`;
    mensaje.innerHTML = textoHtml;
    caja.classList.remove('d-none');
    caja.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
