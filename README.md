# Zentrix Attendance: landing, Supabase y Vercel

## Archivos
- `index.html`, `styles.css`, `script.js`: la landing (sin framework, no necesita build).
- `config.js`: URL y clave **anon** de Supabase.
- `supabase.sql`: tabla `beta_signups` y permisos.

## 1. Supabase
1. Crea un proyecto en supabase.com.
2. SQL Editor > pega y ejecuta `supabase.sql`.
3. Settings > API: copia **Project URL** y la clave **anon public**.
4. Pégalas en `config.js`. **No uses la clave `service_role` en ningún archivo del frontend.**

## 2. Probar en tu computadora
Abre `index.html` en el navegador (o usa la extensión Live Server de VS Code) y envía el formulario.
En Supabase > Table Editor > `beta_signups` debe aparecer la fila.

## 3. Vercel
1. Sube la carpeta a un repositorio de GitHub.
2. En vercel.com: Add New > Project > importa el repositorio.
3. Framework Preset: **Other**. No hay build ni carpeta de salida.
4. Deploy. Vercel te da una URL pública (por ejemplo, `zentrix-attendance.vercel.app`).

## 4. Evidencia para la tarea
- URL pública de Vercel.
- Captura de la estructura de la tabla (Table Editor o el SQL).
- Captura del formulario enviando una inscripción de prueba y de la fila guardada.
- Captura de que el acceso público NO puede leer: abre en el navegador
  `https://TU-PROYECTO.supabase.co/rest/v1/beta_signups?select=*` con la cabecera `apikey` anon (o usa la consola) y comprueba que devuelve una lista vacía o un error de permisos, no los datos.
- Captura de la política RLS (Authentication > Policies).
