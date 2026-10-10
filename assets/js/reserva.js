/* APRENDE A EDITAR LA RESERVA
Este archivo revisa las fechas y prepara un mensaje en WhatsApp; no guarda citas en una base de datos.
La persona debe presionar Enviar en WhatsApp y esperar la confirmación de la clínica.
CAMBIOS FRECUENTES: teléfono en WHATSAPP_CLINICA, días cerrados en validarFecha,
saludo y datos del chat en armarMensaje, aviso visible al final del archivo.
Conserva comillas, comas, paréntesis y llaves; cambia primero las palabras o números indicados.
Los nombres nombre, telefono, servicio, paciente, fecha, turno, contacto y mensaje
coinciden con name en reserva.html; si renombras uno, cambia ambas referencias.
PRUEBA: guarda, abre Reserva, elige un día hábil y completa los datos. Revisa el mensaje preparado
sin enviarlo; luego prueba una fecha pasada y un sábado para ver los avisos. */

/* ============================================================
   OncoMax - Formulario de reserva.
   Al enviar, arma un mensaje con los datos de la cita y abre
   WhatsApp con la clinica, listo para mandar. La validacion de
   campos la hace el navegador (required, pattern) y aqui se
   suman dos reglas: la fecha no puede ser pasada ni caer en
   fin de semana, porque la clinica atiende de lunes a viernes.
   ============================================================ */

/* APRENDE: Inicia una pequeña rutina que se ejecuta al cargar la página; mantiene sus nombres dentro de este
   archivo para no mezclarlos con otros. */
(function () {
  /* APRENDE: TELÉFONO DE LA CLÍNICA: cambia solo los dígitos entre comillas. Incluye el país (591 en Bolivia),
     sin +, espacios ni guiones. Actualiza también los enlaces y teléfonos de las siete páginas. */
  const WHATSAPP_CLINICA = '59164556725';

  /* APRENDE: Busca el formulario con id="form-reserva" en reserva.html. Si cambias ese id, cambia aquí el
     nombre también. */
  const form = document.getElementById('form-reserva');
  /* APRENDE: Si esta página no tiene ese formulario, termina sin hacer nada; permite cargar el archivo sin
     causar errores en otras páginas. */
  if (!form) return;

  /* APRENDE: Encuentra el campo cuyo name es fecha. Conserva ese name en reserva.html o actualiza esta
     referencia. */
  const campoFecha = form.elements.fecha;
  /* APRENDE: Encuentra el aviso con id="enviado" que se mostrará al abrir WhatsApp; conserva el mismo nombre
     en reserva.html. */
  const aviso = document.getElementById('enviado');

  /* ---------- Fecha: desde hoy y solo de lunes a viernes ---------- */
  // Fecha local en formato AAAA-MM-DD (toISOString usaria la hora UTC).
  /* APRENDE: Prepara la fecha de hoy usando el reloj del dispositivo del visitante; devuelve año-mes-día, como
     2026-10-12. */
  function hoyISO() {
    /* APRENDE: Lee la fecha y hora actuales del dispositivo. Este sitio no consulta el reloj de un servidor. */
    const d = new Date();
    /* APRENDE: Obtiene el mes y lo escribe con dos dígitos: enero es 01. Se suma 1 porque aquí los meses se
       cuentan desde cero. */
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    /* APRENDE: Obtiene el día y pone un cero delante si hace falta: 5 pasa a 05. Mantén dos dígitos para poder
       comparar fechas. */
    const dia = String(d.getDate()).padStart(2, '0');
    /* APRENDE: Une el año, mes y día con guiones. El campo de calendario necesita este orden; no cambies a
       día/mes/año aquí. */
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  // "2026-10-12" -> Date local (new Date("2026-10-12") la tomaria en UTC).
  /* APRENDE: Convierte la fecha que se eligió en una fecha local; así no cambia de día por diferencias de
     horario. */
  function leerFecha(valor) {
    /* APRENDE: Separa el texto por sus guiones y convierte cada parte en número: a es año, m mes y d día. */
    const [a, m, d] = valor.split('-').map(Number);
    /* APRENDE: Construye la fecha con esas tres partes; resta 1 al mes porque esta herramienta numera enero como
       cero. */
    return new Date(a, m - 1, d);
  }

  /* APRENDE: La primera fecha permitida es hoy. Para permitir fechas desde mañana, cambia la rutina hoyISO de
     forma coherente con esta regla. */
  campoFecha.min = hoyISO();

  /* APRENDE: Revisa la fecha cada vez que se cambia y antes de preparar WhatsApp; reúne aquí todas las reglas
     de días permitidos. */
  function validarFecha() {
    /* APRENDE: Borra el error anterior para volver a revisar; conserva las comillas vacías para que una
       corrección pueda aceptarse. */
    campoFecha.setCustomValidity('');
    /* APRENDE: Si todavía no se eligió fecha, termina esta revisión; required en reserva.html se encarga de
       pedir que se complete. */
    if (!campoFecha.value) return;
    /* APRENDE: Comprueba si se eligió un día anterior al mínimo. Año-mes-día con dos dígitos permite comparar
       las fechas en este orden. */
    if (campoFecha.value < campoFecha.min) {
      /* APRENDE: Texto de error para una fecha pasada; cambia las palabras entre comillas para dar otra
         explicación. */
      campoFecha.setCustomValidity('Elige una fecha a partir de hoy.');
      /* APRENDE: Detiene la revisión después del error de fecha pasada; no prepara WhatsApp mientras la fecha siga
         siendo inválida. */
      return;
    }
    /* APRENDE: Obtiene el día de la semana: 0 domingo, 1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes y 6
       sábado. */
    const diaSemana = leerFecha(campoFecha.value).getDay();
    /* APRENDE: DÍAS CERRADOS: rechaza domingo (0) o sábado (6); || significa "o". Para atender sábados, deja
       solo diaSemana === 0. Actualiza también el aviso siguiente y los horarios de las páginas. */
    if (diaSemana === 0 || diaSemana === 6) {
      /* APRENDE: Mensaje para un día cerrado; cambia sus palabras si cambias la regla anterior. El formulario no
         valida horarios concretos ni disponibilidad real. */
      campoFecha.setCustomValidity('Atendemos de lunes a viernes. Elige otro día.');
    }
  }
  /* APRENDE: Vuelve a revisar en cuanto la persona modifica el campo; conserva input para responder durante la
     edición. */
  campoFecha.addEventListener('input', validarFecha);
  /* APRENDE: También revisa cuando se confirma un cambio en el calendario; ambos avisos ayudan a cubrir
     distintas formas de elegir la fecha. */
  campoFecha.addEventListener('change', validarFecha);

  /* ---------- Mensaje para WhatsApp ---------- */
  /* APRENDE: Convierte la fecha del calendario en una frase fácil de leer para el mensaje de WhatsApp. */
  function fechaLegible(valor) {
    /* APRENDE: Usa español de Bolivia para escribir la fecha. Puedes cambiar es-BO por otra región, como es-ES,
       si adaptas el sitio. */
    const texto = leerFecha(valor).toLocaleDateString('es-BO', {
      /* APRENDE: long escribe el día de semana y mes con palabras completas; numeric escribe día del mes y año con
         números. Cambia long por short para abreviar. */
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    /* APRENDE: Pone en mayúscula la primera letra de la fecha; el resto de la frase se conserva igual. */
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  /* APRENDE: Prepara el mensaje de solicitud a partir de los datos del formulario; cambia aquí las frases y el
     orden que recibirá la clínica. */
  function armarMensaje() {
    /* APRENDE: Recoge lo que se escribió o eligió en cada campo; cada dato se encuentra por su name de
       reserva.html. */
    const datos = new FormData(form);
    /* APRENDE: Comienza una lista de renglones del mensaje. Para añadir otro, copia un renglón y conserva las
       comas entre ellos. */
    const lineas = [
      /* APRENDE: SALUDO: cambia esta frase entre comillas para personalizar el comienzo del mensaje. */
      'Hola OncoMax, quiero solicitar una cita.',
      /* APRENDE: Renglón vacío que separa el saludo de los datos; puedes quitarlo si prefieres un mensaje más
         compacto. */
      '',
      /* APRENDE: Añade el nombre y quita espacios sobrantes al principio y final. Cambia *Nombre:* para otro
         rótulo; conserva nombre como nombre del campo. Los asteriscos resaltan en WhatsApp. */
      `*Nombre:* ${datos.get('nombre').trim()}`,
      /* APRENDE: Añade el teléfono del paciente y quita espacios en los extremos. Cambia el rótulo, pero conserva
         telefono para leer ese campo. */
      `*Teléfono:* ${datos.get('telefono').trim()}`,
      /* APRENDE: Añade el servicio elegido. Las opciones se editan en reserva.html; conserva servicio para
         encontrar la elección. */
      `*Servicio:* ${datos.get('servicio')}`,
      /* APRENDE: Indica para quién es la cita. Cambia el rótulo *La cita es:* para otra frase; paciente conecta
         con el campo del formulario. */
      `*La cita es:* ${datos.get('paciente')}`,
      /* APRENDE: Incluye la fecha ya convertida en palabras; conserva fechaLegible si quieres seguir viendo el día
         de la semana y el mes escrito. */
      `*Fecha preferida:* ${fechaLegible(datos.get('fecha'))}`,
      /* APRENDE: Añade Mañana o Tarde según la elección; agrega o cambia esas opciones en la lista turno de
         reserva.html. */
      `*Turno:* ${datos.get('turno')}`,
      /* APRENDE: Añade el medio elegido para confirmar (WhatsApp o llamada); sus textos enviados dependen de value
         en las opciones contacto de reserva.html. */
      `*Confirmar por:* ${datos.get('contacto')}`
    /* APRENDE: Termina la lista de renglones; agrega los nuevos datos antes de este cierre y revisa las comas. */
    ];
    /* APRENDE: Lee el mensaje adicional y quita espacios sobrantes; conserva name="mensaje" en reserva.html para
       que se encuentre. */
    const mensaje = datos.get('mensaje').trim();
    /* APRENDE: Solo añade Motivo si se escribió algo. Cambia ese rótulo para otra descripción; el campo sigue
       siendo opcional. */
    if (mensaje) lineas.push(`*Motivo:* ${mensaje}`);
    /* APRENDE: Une los renglones con un salto de línea. Conserva \n para que cada dato aparezca en un renglón
       del chat. */
    return lineas.join('\n');
  }

  /* ---------- Envio ---------- */
  /* APRENDE: Espera a que se pulse Enviar solicitud. El navegador revisa también los campos obligatorios y su
     formato antes de completar el envío. */
  form.addEventListener('submit', function (evento) {
    /* APRENDE: Evita el envío normal de la página; este sitio prepara un chat de WhatsApp en su lugar. */
    evento.preventDefault();
    /* APRENDE: Revisa otra vez la fecha para confirmar que cumple las reglas antes de abrir el chat. */
    validarFecha();
    /* APRENDE: Muestra los errores del formulario y termina si falta algo o hay un dato inválido; conserva esta
       revisión antes del enlace. */
    if (!form.reportValidity()) return;

    /* APRENDE: Crea el enlace con el teléfono de la clínica y el mensaje preparado. encodeURIComponent convierte
       espacios, tildes y saltos en una forma que el enlace puede transportar; consérvalo. */
    const enlace = `https://wa.me/${WHATSAPP_CLINICA}?text=${encodeURIComponent(armarMensaje())}`;

    // Se abre en otra pestaña; si el navegador lo bloquea, se abre en esta.
    // (Con 'noopener' window.open siempre devuelve null, por eso se corta a mano.)
    /* APRENDE: Intenta abrir WhatsApp en otra pestaña; _blank elige una pestaña nueva. Solo prepara el mensaje:
       la persona aún debe pulsar Enviar en WhatsApp. */
    const ventana = window.open(enlace, '_blank');
    /* APRENDE: Si abrió otra pestaña, le quita el acceso a controlar esta página; conserva esta protección. */
    if (ventana) ventana.opener = null;
    /* APRENDE: Si no pudo abrir otra pestaña, abre WhatsApp en la actual para que el visitante pueda continuar. */
    else window.location.href = enlace;

    /* APRENDE: Reemplaza el contenido del aviso de reserva.html. Si cambias el mensaje de éxito, edita las dos
       frases siguientes. */
    aviso.innerHTML =
      /* APRENDE: Primera parte del aviso visible; cambia las palabras conservando span y b, las comillas y el
         signo + que une ambas partes. */
      '<span>¡Listo! Tu solicitud se abrió en WhatsApp. Presiona <b>Enviar</b> en el chat ' +
      /* APRENDE: Segunda parte del aviso y enlace para reabrir WhatsApp; conserva a, target y rel. Este aviso
         indica apertura del chat, no recepción ni confirmación de la cita. */
      'para que la clínica la reciba. <a target="_blank" rel="noopener">Abrir WhatsApp de nuevo</a></span>';
    /* APRENDE: Da al enlace del aviso la misma dirección preparada; conserva el enlace a dentro del aviso para
       que se pueda encontrar. */
    aviso.querySelector('a').href = enlace;
    /* APRENDE: Muestra el aviso añadiendo envio--visible, cuyo diseño está en estilos.css; si renombras esa
       clase, actualiza los dos archivos. */
    aviso.classList.add('envio--visible');
    /* APRENDE: Lleva la atención del teclado al aviso sin desplazar todavía la página; tabindex="-1" en el HTML
       permite este paso. */
    aviso.focus({ preventScroll: true });
    /* APRENDE: Desplaza suavemente hasta el aviso y lo centra. Cambia smooth por auto para un salto inmediato, o
       center por start para colocarlo arriba. */
    aviso.scrollIntoView({ behavior: 'smooth', block: 'center' });
  /* APRENDE: Termina las acciones que ocurren cuando se pide enviar la solicitud. */
  });
/* APRENDE: Cierra la rutina y la pone en marcha una vez al cargar el archivo. */
})();
