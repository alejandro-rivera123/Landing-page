// ---------- 1. Prototipo: lista de asistencia ----------
(function () {
  var ESTUDIANTES = [
    { n: 'Ana Rojas',      f: 1 },
    { n: 'Bruno Vargas',   f: 0 },
    { n: 'Camila Flores',  f: 3 },
    { n: 'Diego Mamani',   f: 2 },
    { n: 'Elena Quispe',   f: 0 },
    { n: 'Fabián Choque',  f: 1 }
  ];
  var estado = {}; // nombre -> 'p' | 't' | 'f'
  var roll = document.getElementById('roll');

  var hoy = new Date();
  document.getElementById('fecha').textContent =
    hoy.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });

  function boton(clase, texto, nombre, valor) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = clase;
    b.textContent = texto;
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', texto + ': ' + nombre);
    b.addEventListener('click', function () {
      estado[nombre] = valor;
      pintar();
    });
    return b;
  }

  ESTUDIANTES.forEach(function (e) {
    var li = document.createElement('li');
    var quien = document.createElement('div');
    quien.className = 'who-name';
    quien.innerHTML = '';
    var nombre = document.createElement('span');
    nombre.textContent = e.n;
    var chico = document.createElement('small');
    chico.dataset.base = e.f;
    chico.textContent = e.f + ' faltas este mes';
    quien.appendChild(nombre);
    quien.appendChild(chico);

    var seg = document.createElement('div');
    seg.className = 'seg';
    seg.dataset.nombre = e.n;
    seg.appendChild(boton('p', 'Pres.', e.n, 'p'));
    seg.appendChild(boton('t', 'Tarde', e.n, 't'));
    seg.appendChild(boton('f', 'Falta', e.n, 'f'));

    li.appendChild(quien);
    li.appendChild(seg);
    roll.appendChild(li);
  });

  function pintar() {
    var ok = 0, late = 0, bad = 0;
    roll.querySelectorAll('li').forEach(function (li) {
      var seg = li.querySelector('.seg');
      var v = estado[seg.dataset.nombre];
      seg.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.classList.contains(v)));
      });
      var small = li.querySelector('small');
      var base = Number(small.dataset.base);
      var total = base + (v === 'f' ? 1 : 0);
      small.textContent = total + (total === 1 ? ' falta este mes' : ' faltas este mes');
      if (v === 'p') ok++;
      if (v === 't') late++;
      if (v === 'f') bad++;
    });
    document.getElementById('c-ok').textContent = ok;
    document.getElementById('c-late').textContent = late;
    document.getElementById('c-bad').textContent = bad;
  }

  var msg = document.getElementById('save-msg');
  document.getElementById('save').addEventListener('click', function () {
    var marcados = Object.keys(estado).length;
    msg.hidden = false;
    if (marcados < ESTUDIANTES.length) {
      msg.textContent = 'Faltan ' + (ESTUDIANTES.length - marcados) + ' estudiantes por marcar.';
    } else {
      msg.textContent = 'Asistencia guardada en el prototipo. En la beta quedará en el historial del curso.';
    }
  });

  pintar();
})();

// ---------- 2. Formulario de inscripción a la beta ----------
(function () {
  var form = document.getElementById('form');
  var result = document.getElementById('result');
  var send = document.getElementById('send');
  var necesidad = document.getElementById('necesidad');
  var contador = document.getElementById('count');

  necesidad.addEventListener('input', function () {
    contador.textContent = necesidad.value.length;
  });

  function setError(id, texto) {
    var campo = document.getElementById(id);
    document.getElementById('e-' + id).textContent = texto;
    campo.classList.toggle('bad', !!texto);
    campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
    return !texto;
  }

  function validar() {
    var v = {
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      institucion: form.institucion.value.trim(),
      perfil: form.perfil.value,
      necesidad: form.necesidad.value.trim(),
      interes: form.interes.value
    };
    var ok = true;
    ok = setError('nombre', v.nombre.length < 2 ? 'Escribe tu nombre completo.' : '') && ok;
    ok = setError('correo', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.correo) ? '' : 'Escribe un correo válido, por ejemplo nombre@colegio.edu.bo.') && ok;
    ok = setError('institucion', v.institucion.length < 2 ? 'Escribe el nombre de tu colegio o institución.' : '') && ok;
    ok = setError('perfil', v.perfil ? '' : 'Selecciona tu perfil.') && ok;
    ok = setError('necesidad', v.necesidad.length < 10 ? 'Cuéntanos un poco más (mínimo 10 caracteres).' : '') && ok;
    ok = setError('interes', v.interes ? '' : 'Selecciona tu interés.') && ok;
    ok = setError('acepto', form.acepto.checked ? '' : 'Debes aceptar para poder inscribirte.') && ok;
    return ok ? v : null;
  }

  function mostrar(tipo, texto) {
    result.hidden = false;
    result.className = 'result ' + tipo;
    result.textContent = texto;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    result.hidden = true;

    // Campo trampa para bots: si está lleno, se ignora el envío.
    if (form.web.value) { return; }

    var datos = validar();
    if (!datos) {
      mostrar('error', 'Revisa los campos marcados en rojo e inténtalo de nuevo.');
      return;
    }

    var cfg = window.ZENTRIX_CONFIG || {};
    if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.indexOf('PEGA_AQUI') === 0) {
      console.warn('Falta configurar SUPABASE_URL y SUPABASE_ANON_KEY en config.js');
      mostrar('error', 'El formulario aún no está conectado. Inténtalo más tarde.');
      return;
    }

    send.disabled = true;
    send.textContent = 'Enviando...';

    var headers = {
      'Content-Type': 'application/json',
      'apikey': cfg.SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    };
    // Las claves antiguas "anon" son JWT (empiezan con eyJ) y van también en Authorization.
    // Las nuevas "publishable" (sb_publishable_...) solo van en apikey.
    if (String(cfg.SUPABASE_ANON_KEY).indexOf('eyJ') === 0) {
      headers['Authorization'] = 'Bearer ' + cfg.SUPABASE_ANON_KEY;
    }

    fetch(cfg.SUPABASE_URL + '/rest/v1/' + cfg.TABLA, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        nombre: datos.nombre,
        correo: datos.correo.toLowerCase(),
        institucion: datos.institucion,
        perfil: datos.perfil,
        necesidad: datos.necesidad,
        interes: datos.interes,
        consentimiento: true
      })
    })
    .then(function (r) {
      if (r.ok) {
        mostrar('success', 'Listo, ' + datos.nombre + '. Te inscribimos a la beta de Zentrix Attendance y te contactaremos pronto.');
        form.reset();
        contador.textContent = '0';
      } else if (r.status === 409) {
        mostrar('error', 'Este correo ya está inscrito en la beta.');
      } else {
        mostrar('error', 'No pudimos guardar tu inscripción. Inténtalo de nuevo en unos minutos.');
      }
    })
    .catch(function () {
      mostrar('error', 'Parece que no hay conexión a internet. Revisa tu red e inténtalo otra vez.');
    })
    .finally(function () {
      send.disabled = false;
      send.textContent = 'Quiero unirme a la beta';
    });
  });
})();