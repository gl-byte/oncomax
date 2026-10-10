/* ============================================================
   OncoMax - Formulario de reserva.
   Al enviar, arma un mensaje con los datos de la cita y abre
   WhatsApp con la clinica, listo para mandar. La validacion de
   campos la hace el navegador (required, pattern) y aqui se
   suman dos reglas: la fecha no puede ser pasada ni caer en
   fin de semana, porque la clinica atiende de lunes a viernes.
   ============================================================ */

(function () {
  const WHATSAPP_CLINICA = '59164556725';

  const form = document.getElementById('form-reserva');
  if (!form) return;

  const campoFecha = form.elements.fecha;
  const aviso = document.getElementById('enviado');

  /* ---------- Fecha: desde hoy y solo de lunes a viernes ---------- */
  // Fecha local en formato AAAA-MM-DD (toISOString usaria la hora UTC).
  function hoyISO() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  // "2026-10-12" -> Date local (new Date("2026-10-12") la tomaria en UTC).
  function leerFecha(valor) {
    const [a, m, d] = valor.split('-').map(Number);
    return new Date(a, m - 1, d);
  }

  campoFecha.min = hoyISO();

  function validarFecha() {
    campoFecha.setCustomValidity('');
    if (!campoFecha.value) return;
    if (campoFecha.value < campoFecha.min) {
      campoFecha.setCustomValidity('Elige una fecha a partir de hoy.');
      return;
    }
    const diaSemana = leerFecha(campoFecha.value).getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      campoFecha.setCustomValidity('Atendemos de lunes a viernes. Elige otro día.');
    }
  }
  campoFecha.addEventListener('input', validarFecha);
  campoFecha.addEventListener('change', validarFecha);

  /* ---------- Mensaje para WhatsApp ---------- */
  function fechaLegible(valor) {
    const texto = leerFecha(valor).toLocaleDateString('es-BO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  function armarMensaje() {
    const datos = new FormData(form);
    const lineas = [
      'Hola OncoMax, quiero solicitar una cita.',
      '',
      `*Nombre:* ${datos.get('nombre').trim()}`,
      `*Teléfono:* ${datos.get('telefono').trim()}`,
      `*Servicio:* ${datos.get('servicio')}`,
      `*La cita es:* ${datos.get('paciente')}`,
      `*Fecha preferida:* ${fechaLegible(datos.get('fecha'))}`,
      `*Turno:* ${datos.get('turno')}`,
      `*Confirmar por:* ${datos.get('contacto')}`
    ];
    const mensaje = datos.get('mensaje').trim();
    if (mensaje) lineas.push(`*Motivo:* ${mensaje}`);
    return lineas.join('\n');
  }

  /* ---------- Envio ---------- */
  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    validarFecha();
    if (!form.reportValidity()) return;

    const enlace = `https://wa.me/${WHATSAPP_CLINICA}?text=${encodeURIComponent(armarMensaje())}`;

    // Se abre en otra pestaña; si el navegador lo bloquea, se abre en esta.
    // (Con 'noopener' window.open siempre devuelve null, por eso se corta a mano.)
    const ventana = window.open(enlace, '_blank');
    if (ventana) ventana.opener = null;
    else window.location.href = enlace;

    aviso.innerHTML =
      '<span>¡Listo! Tu solicitud se abrió en WhatsApp. Presiona <b>Enviar</b> en el chat ' +
      'para que la clínica la reciba. <a target="_blank" rel="noopener">Abrir WhatsApp de nuevo</a></span>';
    aviso.querySelector('a').href = enlace;
    aviso.classList.add('envio--visible');
    aviso.focus({ preventScroll: true });
    aviso.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
