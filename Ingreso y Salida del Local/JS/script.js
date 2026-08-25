const STORAGE_KEY = 'registroIngresoSalidaData';
const LEGACY_STORAGE_KEY = 'registroIngresoSalida';
const USERS_KEY = 'registroIngresoSalidaUsers';
const CURRENT_USER_KEY = 'registroIngresoSalidaCurrentUser';
const AUTH_DRAFTS_KEY = 'registroIngresoSalidaAuthDrafts';
const AUTH_VIEW_KEY = 'registroIngresoSalidaAuthView';
const HISTORY_FILTERS_KEY = 'registroIngresoSalidaHistoryFilters';
const SHARED_SYNC_TABLE = 'registro_sistema';
const SHARED_SYNC_PULL_INTERVAL = 15000;

let sincronizacionCompartidaDisponible = false;
let sincronizacionCompartidaInicializada = false;
let ultimaActualizacionCompartida = '';
let colaSincronizacionCompartida = Promise.resolve();
let intervaloSincronizacionCompartida = null;

const LABELS_ROL = {
  admin: 'Administrador',
  developer: 'Developer',
  empleado: 'Empleado',
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  otro: 'Otro'
};

const ROLES_GESTIONABLES = ['admin', 'developer', 'empleado', 'proveedor'];
const ORDEN_ROLES = ['admin', 'developer', 'empleado', 'proveedor'];

const LABELS_INCIDENCIA = {
  ninguna: 'Sin incidencia',
  retraso: 'Retraso',
  salida_emergencia: 'Salida de emergencia',
  visita_proveedor: 'Visita de proveedor',
  entrega_mercaderia: 'Entrega de mercadería',
  otra: 'Otra'
};

const LABELS_TIPO = {
  ingreso: 'Ingreso',
  salida: 'Salida',
  registro_proveedor: 'Registro',
  advertencia: 'Advertencia',
  sancion: 'Sanción'
};

const INCIDENCIAS_POR_ROL = {
  admin: ['ninguna', 'retraso', 'salida_emergencia', 'visita_proveedor', 'entrega_mercaderia', 'otra'],
  developer: ['ninguna', 'retraso', 'salida_emergencia', 'visita_proveedor', 'entrega_mercaderia', 'otra'],
  empleado: ['ninguna', 'retraso', 'salida_emergencia', 'otra'],
  proveedor: ['visita_proveedor', 'entrega_mercaderia']
};

const LABELS_DISCIPLINA = {
  advertencia: 'Advertencia',
  sancion: 'Sanción'
};

function obtenerConfiguracionCompartida() {
  const config = window.APP_SYNC_CONFIG || {};
  const url = String(config.url || '').trim().replace(/\/+$/, '');
  const anonKey = String(config.anonKey || '').trim();
  const instanceId = String(config.instanceId || 'principal').trim() || 'principal';

  return {
    provider: String(config.provider || 'supabase').trim().toLowerCase(),
    url,
    anonKey,
    instanceId,
    isEnabled: Boolean(url && anonKey)
  };
}

function usarPersistenciaCompartida() {
  const config = obtenerConfiguracionCompartida();
  return config.provider === 'supabase' && config.isEnabled;
}

async function solicitarSupabase(path, options = {}) {
  const config = obtenerConfiguracionCompartida();
  const headers = Object.assign({
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json'
  }, options.headers || {});

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(detalle || 'No se pudo completar la solicitud remota.');
  }

  if (response.status === 204) return null;
  return response.json();
}

function formatoFechaHora(fecha) {
  return fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatoFechaLarga(fecha) {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function obtenerClaveFecha(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizarUsername(nombre) {
  return String(nombre || '').trim().toLowerCase();
}

function normalizarIncidencia(incidencia, rol = 'admin') {
  const valor = String(incidencia || '').trim().toLowerCase();
  const incidenciaNormalizada = valor === 'salida_anticipada'
    ? 'salida_emergencia'
    : valor === 'seguridad' || valor === 'mantenimiento'
      ? 'otra'
      : valor;
  const rolNormalizado = normalizarRolGestionable(rol, 'admin');
  const incidenciasValidas = INCIDENCIAS_POR_ROL[rolNormalizado] || INCIDENCIAS_POR_ROL.admin;
  return incidenciasValidas.includes(incidenciaNormalizada)
    ? incidenciaNormalizada
    : incidenciasValidas[0] || 'ninguna';
}

function esAliasAdminLegacy(valor) {
  const normalizado = String(valor || '').trim().toLowerCase();
  return normalizado === 'administrador'
    || (normalizado.length === 5 && normalizado.startsWith('due') && normalizado.endsWith('o'));
}

function esClaveAdminLegacy(valor) {
  const normalizado = normalizarUsername(valor);
  return normalizado.length === 5 && normalizado.startsWith('due') && normalizado.endsWith('o');
}

function normalizarRolGestionable(rol, valorPorDefecto = 'empleado') {
  const valor = String(rol || '').trim().toLowerCase();
  const rolNormalizado = esAliasAdminLegacy(valor) ? 'admin' : valor;
  const valorNormalizado = esAliasAdminLegacy(valorPorDefecto)
    ? 'admin'
    : valorPorDefecto;
  return ROLES_GESTIONABLES.includes(rolNormalizado) ? rolNormalizado : valorNormalizado;
}

function esRolAdministrativo(rol) {
  return rol === 'admin' || rol === 'developer';
}

function normalizarFiltroRol(rol) {
  const valor = String(rol || '').trim().toLowerCase();
  if (!valor || valor === 'todos') return 'todos';
  return normalizarRolGestionable(valor, 'todos');
}

function crearEstadoInicial() {
  return {
    ultimoIngreso: null,
    ultimaSalida: null,
    historial: []
  };
}

function crearDraftsIniciales() {
  return {
    authView: 'login',
    loginNombre: '',
    loginPassword: '',
    registerNombre: '',
    registerPassword: '',
    registerRol: 'empleado'
  };
}

function crearFiltrosIniciales() {
  return {
    nombre: '',
    periodo: 'hoy',
    fecha: obtenerClaveFecha(new Date()),
    rol: 'todos',
    incidencia: 'todos'
  };
}

function obtenerPesoRol(rol) {
  const index = ORDEN_ROLES.indexOf(rol);
  return index === -1 ? ORDEN_ROLES.length : index;
}

function obtenerFechaDesdeMovimiento(item) {
  if (!item || !item.fechaISO) return null;
  const fecha = new Date(item.fechaISO);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function normalizarDuracionJornada(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function normalizarRegistroDisciplinario(entry) {
  const fecha = entry && entry.fechaISO ? new Date(entry.fechaISO) : new Date();
  return {
    tipo: entry && entry.tipo === 'sancion' ? 'sancion' : 'advertencia',
    motivo: String((entry && entry.motivo) || '').trim(),
    fechaISO: entry && entry.fechaISO ? entry.fechaISO : fecha.toISOString(),
    fechaTexto: entry && entry.fechaTexto ? entry.fechaTexto : formatoFechaHora(fecha),
    asignadoPorUsername: String((entry && entry.asignadoPorUsername) || '').trim(),
    asignadoPorUsernameKey: normalizarUsername(entry && (entry.asignadoPorUsernameKey || entry.asignadoPorUsername))
  };
}

function normalizarMovimiento(item) {
  const fecha = obtenerFechaDesdeMovimiento(item) || new Date();
  const rolPersona = normalizarRolGestionable(item.rolPersona || item.tipoPersona, 'otro');
  const tipoNormalizado = rolPersona === 'proveedor'
    ? 'registro_proveedor'
    : item.tipo === 'salida'
      ? 'salida'
      : 'ingreso';
  return {
    tipo: tipoNormalizado,
    nombre: item.nombre || 'Sin nombre',
    rolPersona,
    incidencia: normalizarIncidencia(item.incidencia, rolPersona),
    observacion: item.observacion || '',
    fechaISO: item.fechaISO || fecha.toISOString(),
    fechaTexto: item.fechaTexto || formatoFechaHora(fecha),
    fechaDia: item.fechaDia && item.fechaDia.includes('-') ? item.fechaDia : obtenerClaveFecha(fecha),
    duracionJornadaMs: normalizarDuracionJornada(item.duracionJornadaMs),
    creadoPorUsername: String(item.creadoPorUsername || '').trim(),
    creadoPorUsernameKey: normalizarUsername(item.creadoPorUsernameKey || item.creadoPorUsername)
  };
}

function obtenerClaveSeguimientoMovimiento(item) {
  if (!item) return '';

  const rolPersona = normalizarRolGestionable(item.rolPersona, 'otro');
  if (rolPersona !== 'admin' && rolPersona !== 'empleado') return '';

  const creadoPor = normalizarUsername(item.creadoPorUsernameKey || item.creadoPorUsername);
  if (creadoPor) return `${rolPersona}::${creadoPor}`;

  const nombre = normalizarUsername(item.nombre);
  return nombre ? `${rolPersona}::${nombre}` : '';
}

function recalcularMetadatosHistorial(historial) {
  const historialIndexado = historial.map((item, index) => ({
    index,
    item: normalizarMovimiento(item)
  }));
  const jornadasAbiertas = new Map();

  historialIndexado
    .slice()
    .sort((a, b) => {
      const fechaA = obtenerFechaDesdeMovimiento(a.item);
      const fechaB = obtenerFechaDesdeMovimiento(b.item);
      const tiempoA = fechaA ? fechaA.getTime() : 0;
      const tiempoB = fechaB ? fechaB.getTime() : 0;
      return tiempoA - tiempoB || a.index - b.index;
    })
    .forEach(({ item }) => {
      item.duracionJornadaMs = null;

      if (item.tipo !== 'ingreso' && item.tipo !== 'salida') return;

      const clave = obtenerClaveSeguimientoMovimiento(item);
      const fecha = obtenerFechaDesdeMovimiento(item);
      if (!clave || !fecha) return;

      if (item.tipo === 'ingreso') {
        jornadasAbiertas.set(clave, fecha.getTime());
        return;
      }

      const inicio = jornadasAbiertas.get(clave);
      if (typeof inicio !== 'number') return;

      item.duracionJornadaMs = Math.max(0, fecha.getTime() - inicio);
      jornadasAbiertas.delete(clave);
    });

  return historialIndexado
    .sort((a, b) => a.index - b.index)
    .map(({ item }) => item);
}

function normalizarUsuario(user) {
  const historialDisciplinario = Array.isArray(user.historialDisciplinario)
    ? user.historialDisciplinario.map(normalizarRegistroDisciplinario).sort((a, b) => new Date(b.fechaISO) - new Date(a.fechaISO))
    : [];
  const username = String(user.username || '').trim();
  const usernameKey = normalizarUsername(user.usernameKey || user.username);
  return {
    username,
    usernameKey,
    password: String(user.password || ''),
    rol: normalizarRolGestionable(user.rol, usernameKey === 'gabriel' || usernameKey === 'admin' || esClaveAdminLegacy(usernameKey) ? 'admin' : 'empleado'),
    observacionUsuario: String(user.observacionUsuario || ''),
    advertencias: historialDisciplinario.filter((item) => item.tipo === 'advertencia').length,
    sanciones: historialDisciplinario.filter((item) => item.tipo === 'sancion').length,
    historialDisciplinario
  };
}

function crearUsuarioAdminInicial() {
  return {
    username: 'Gabriel',
    usernameKey: 'gabriel',
    password: '1234',
    rol: 'admin',
    observacionUsuario: '',
    advertencias: 0,
    sanciones: 0,
    historialDisciplinario: []
  };
}

function obtenerUltimoMovimiento(historial, tipo) {
  return historial.find((item) => item.tipo === tipo) || null;
}

function normalizarEstado(data) {
  const historial = Array.isArray(data.historial) ? recalcularMetadatosHistorial(data.historial) : [];
  return {
    historial,
    ultimoIngreso: obtenerUltimoMovimiento(historial, 'ingreso') || (data.ultimoIngreso ? normalizarMovimiento(data.ultimoIngreso) : null),
    ultimaSalida: obtenerUltimoMovimiento(historial, 'salida') || (data.ultimaSalida ? normalizarMovimiento(data.ultimaSalida) : null)
  };
}

function construirSnapshotCompartido(users = obtenerUsuariosGuardados(), estado = obtenerEstadoGuardado()) {
  const config = obtenerConfiguracionCompartida();
  return {
    id: config.instanceId,
    users: users.map(normalizarUsuario),
    state: normalizarEstado(estado),
    updated_at: new Date().toISOString()
  };
}

function normalizarSnapshotCompartido(payload) {
  if (!payload || typeof payload !== 'object') return null;
  return {
    id: String(payload.id || ''),
    users: Array.isArray(payload.users) ? payload.users.map(normalizarUsuario).filter((user) => user.usernameKey) : [],
    state: normalizarEstado(payload.state || crearEstadoInicial()),
    updatedAt: String(payload.updated_at || '')
  };
}

function escribirSnapshotCompartidoEnLocal(snapshot) {
  if (!snapshot) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(snapshot.users || []));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.state || crearEstadoInicial()));
  ultimaActualizacionCompartida = snapshot.updatedAt || new Date().toISOString();
}

async function obtenerSnapshotCompartidoRemoto() {
  const config = obtenerConfiguracionCompartida();
  const query = new URLSearchParams({
    id: `eq.${config.instanceId}`,
    select: 'id,users,state,updated_at'
  });
  const filas = await solicitarSupabase(`${SHARED_SYNC_TABLE}?${query.toString()}`);
  if (!Array.isArray(filas) || !filas.length) return null;
  return normalizarSnapshotCompartido(filas[0]);
}

async function guardarSnapshotCompartidoRemoto(snapshot) {
  const filas = await solicitarSupabase(SHARED_SYNC_TABLE, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: snapshot
  });

  if (!Array.isArray(filas) || !filas.length) return normalizarSnapshotCompartido(snapshot);
  return normalizarSnapshotCompartido(filas[0]);
}

function programarSincronizacionCompartida() {
  if (!usarPersistenciaCompartida() || !sincronizacionCompartidaDisponible) return;

  colaSincronizacionCompartida = colaSincronizacionCompartida
    .catch(() => null)
    .then(async () => {
      try {
        const snapshot = construirSnapshotCompartido();
        const remoto = await guardarSnapshotCompartidoRemoto(snapshot);
        if (remoto) escribirSnapshotCompartidoEnLocal(remoto);
      } catch (error) {
        console.error('No se pudo sincronizar el sistema compartido.', error);
      }
    });
}

async function refrescarSnapshotCompartido(force = false) {
  if (!usarPersistenciaCompartida() || !sincronizacionCompartidaDisponible) return false;

  try {
    const remoto = await obtenerSnapshotCompartidoRemoto();
    if (!remoto) return false;

    if (!force && remoto.updatedAt && remoto.updatedAt === ultimaActualizacionCompartida) {
      return false;
    }

    const sesionActual = obtenerSesionActual();
    escribirSnapshotCompartidoEnLocal(remoto);

    if (sesionActual) {
      const usuarioSincronizado = remoto.users.find((user) => user.usernameKey === sesionActual.usernameKey);
      if (usuarioSincronizado) {
        guardarSesionActual(usuarioSincronizado);
      } else {
        cerrarSesionActual();
      }
    }

    renderizarTodo();
    return true;
  } catch (error) {
    console.error('No se pudo refrescar el sistema compartido.', error);
    return false;
  }
}

async function inicializarPersistenciaCompartida() {
  if (!usarPersistenciaCompartida()) return false;

  try {
    const remoto = await obtenerSnapshotCompartidoRemoto();

    if (remoto) {
      escribirSnapshotCompartidoEnLocal(remoto);
    } else {
      const semilla = construirSnapshotCompartido();
      const creado = await guardarSnapshotCompartidoRemoto(semilla);
      escribirSnapshotCompartidoEnLocal(creado || semilla);
    }

    sincronizacionCompartidaDisponible = true;
    return true;
  } catch (error) {
    console.error('La persistencia compartida no se pudo iniciar. Se usará almacenamiento local.', error);
    sincronizacionCompartidaDisponible = false;
    return false;
  }
}

function iniciarVigilanciaPersistenciaCompartida() {
  if (!usarPersistenciaCompartida() || sincronizacionCompartidaInicializada) return;

  sincronizacionCompartidaInicializada = true;
  intervaloSincronizacionCompartida = window.setInterval(() => {
    if (document.visibilityState === 'visible') refrescarSnapshotCompartido(false);
  }, SHARED_SYNC_PULL_INTERVAL);

  window.addEventListener('focus', () => {
    refrescarSnapshotCompartido(true);
  });
}

function obtenerUsuariosGuardados() {
  try {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY));
    return Array.isArray(raw) ? raw.map(normalizarUsuario).filter((user) => user.usernameKey) : [];
  } catch (error) {
    return [];
  }
}

function guardarUsuarios(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users.map(normalizarUsuario)));
  programarSincronizacionCompartida();
}

function asegurarUsuarioAdminInicial() {
  const users = obtenerUsuariosGuardados();
  if (users.length) return false;
  guardarUsuarios([crearUsuarioAdminInicial()]);
  return true;
}

function migrarUsuarioInicialAGabriel() {
  const users = obtenerUsuariosGuardados();
  if (!users.length) return;

  let seActualizo = false;
  const usersActualizados = users.map((user) => {
    const esCuentaInicialAntigua = esClaveAdminLegacy(user.usernameKey)
      && esRolAdministrativo(user.rol)
      && user.password === '1234';

    if (!esCuentaInicialAntigua) return user;

    seActualizo = true;
    return normalizarUsuario({
      ...user,
      username: 'Gabriel',
      usernameKey: 'gabriel',
      observacionUsuario: ''
    });
  });

  if (!seActualizo) return;

  guardarUsuarios(usersActualizados);

  const sesionActual = obtenerSesionActual();
  if (sesionActual && esClaveAdminLegacy(sesionActual.usernameKey)) {
    const usuarioGabriel = usersActualizados.find((user) => user.usernameKey === 'gabriel');
    if (usuarioGabriel) guardarSesionActual(usuarioGabriel);
  }
}

function obtenerSesionActual() {
  try {
    const session = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    return session && session.usernameKey
      ? {
        ...session,
        rol: normalizarRolGestionable(session.rol, 'empleado')
      }
      : null;
  } catch (error) {
    return null;
  }
}

function guardarSesionActual(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    username: user.username,
    usernameKey: user.usernameKey,
    rol: user.rol
  }));
}

function obtenerUsuarioPorUsernameKey(usernameKey) {
  return obtenerUsuariosGuardados().find((item) => item.usernameKey === usernameKey) || null;
}

function obtenerUsuarioActualCompleto() {
  const session = obtenerSesionActual();
  return session ? obtenerUsuarioPorUsernameKey(session.usernameKey) : null;
}

function cerrarSesionActual() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function obtenerFiltrosHistorialGuardados() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_FILTERS_KEY));
    return raw && typeof raw === 'object' ? raw : {};
  } catch (error) {
    return {};
  }
}

function guardarFiltrosHistorialGuardados(data) {
  localStorage.setItem(HISTORY_FILTERS_KEY, JSON.stringify(data));
}

function obtenerClaveFiltrosUsuario(usuario) {
  return usuario && usuario.usernameKey ? usuario.usernameKey : 'anonimo';
}

function obtenerFiltrosGuardadosUsuario(usuario) {
  const todos = obtenerFiltrosHistorialGuardados();
  const clave = obtenerClaveFiltrosUsuario(usuario);
  const filtros = Object.assign(crearFiltrosIniciales(), todos[clave] || {});
  return {
    ...filtros,
    rol: normalizarFiltroRol(filtros.rol)
  };
}

function guardarFiltrosUsuario(usuario, filtros) {
  const todos = obtenerFiltrosHistorialGuardados();
  const clave = obtenerClaveFiltrosUsuario(usuario);
  const filtrosNormalizados = Object.assign(crearFiltrosIniciales(), filtros || {});
  filtrosNormalizados.rol = normalizarFiltroRol(filtrosNormalizados.rol);
  todos[clave] = filtrosNormalizados;
  guardarFiltrosHistorialGuardados(todos);
}

function obtenerDraftsAuth() {
  try {
    return Object.assign(crearDraftsIniciales(), JSON.parse(localStorage.getItem(AUTH_DRAFTS_KEY)) || {});
  } catch (error) {
    return crearDraftsIniciales();
  }
}

function guardarDraftsAuth(drafts) {
  localStorage.setItem(AUTH_DRAFTS_KEY, JSON.stringify(drafts));
}

function actualizarDraftsAuth() {
  const elements = obtenerElementos();
  guardarDraftsAuth({
    authView: obtenerVistaAuthActual(),
    loginNombre: elements.loginNombre ? elements.loginNombre.value : '',
    loginPassword: elements.loginPassword ? elements.loginPassword.value : '',
    registerNombre: elements.registerNombre ? elements.registerNombre.value : '',
    registerPassword: elements.registerPassword ? elements.registerPassword.value : '',
    registerRol: elements.registerRol ? elements.registerRol.value : 'empleado'
  });
}

function limpiarDraftsAuth(seccion) {
  const drafts = obtenerDraftsAuth();
  if (seccion === 'login') {
    drafts.loginNombre = '';
    drafts.loginPassword = '';
  }
  if (seccion === 'register') {
    drafts.registerNombre = '';
    drafts.registerPassword = '';
    drafts.registerRol = 'empleado';
  }
  guardarDraftsAuth(drafts);
}

function migrarRegistroLegacy() {
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (!legacy || localStorage.getItem(STORAGE_KEY)) return;

    const data = crearEstadoInicial();

    if (legacy.ingreso && legacy.ingreso !== '—') {
      data.ultimoIngreso = {
        tipo: 'ingreso',
        nombre: 'Registro anterior',
        rolPersona: 'otro',
        incidencia: 'ninguna',
        fechaTexto: legacy.ingreso,
        observacion: 'Migrado desde la versión anterior'
      };
    }

    if (legacy.salida && legacy.salida !== '—') {
      data.ultimaSalida = {
        tipo: 'salida',
        nombre: 'Registro anterior',
        rolPersona: 'otro',
        incidencia: 'ninguna',
        fechaTexto: legacy.salida,
        observacion: 'Migrado desde la versión anterior'
      };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}

function obtenerEstadoGuardado() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizarEstado(raw || crearEstadoInicial());
  } catch (error) {
    return crearEstadoInicial();
  }
}

function guardarEstado(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizarEstado(data)));
  programarSincronizacionCompartida();
}

function obtenerElementos() {
  return {
    authShell: document.getElementById('authShell'),
    dashboardShell: document.getElementById('dashboardShell'),
    loginPanel: document.getElementById('loginPanel'),
    registerPanel: document.getElementById('registerPanel'),
    showLogin: document.getElementById('showLogin'),
    showRegister: document.getElementById('showRegister'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginNombre: document.getElementById('loginNombre'),
    loginPassword: document.getElementById('loginPassword'),
    loginStatus: document.getElementById('loginStatus'),
    registerNombre: document.getElementById('registerNombre'),
    registerPassword: document.getElementById('registerPassword'),
    registerRol: document.getElementById('registerRol'),
    registerStatus: document.getElementById('registerStatus'),
    sessionUserName: document.getElementById('sessionUserName'),
    sessionUserRole: document.getElementById('sessionUserRole'),
    sessionRoleChip: document.getElementById('sessionRoleChip'),
    heroEyebrow: document.getElementById('heroEyebrow'),
    heroTitle: document.getElementById('heroTitle'),
    profilePanel: document.querySelector('.profile-panel'),
    profileGrid: document.getElementById('profileGrid'),
    profileRoleLabel: document.getElementById('profileRoleLabel'),
    profileRole: document.getElementById('profileRole'),
    profileWarningsCard: document.getElementById('profileWarningsCard'),
    profileWarningsLabel: document.getElementById('profileWarningsLabel'),
    profileWarnings: document.getElementById('profileWarnings'),
    profileSanctionsCard: document.getElementById('profileSanctionsCard'),
    profileSanctionsLabel: document.getElementById('profileSanctionsLabel'),
    profileSanctions: document.getElementById('profileSanctions'),
    profileObservation: document.getElementById('profileObservation'),
    togglePasswordPanelButton: document.getElementById('togglePasswordPanel'),
    logoutButton: document.getElementById('cerrarSesion'),
    passwordPanel: document.getElementById('passwordPanel'),
    passwordModal: document.getElementById('passwordModal'),
    changePasswordForm: document.getElementById('changePasswordForm'),
    currentPassword: document.getElementById('currentPassword'),
    newAccountPassword: document.getElementById('newAccountPassword'),
    confirmAccountPassword: document.getElementById('confirmAccountPassword'),
    cancelPasswordPanelButton: document.getElementById('cancelPasswordPanel'),
    closePasswordModalButton: document.getElementById('closePasswordModal'),
    passwordStatus: document.getElementById('passwordStatus'),
    adminCreateUserForm: document.getElementById('adminCreateUserForm'),
    adminCreateUsername: document.getElementById('adminCreateUsername'),
    adminCreatePassword: document.getElementById('adminCreatePassword'),
    adminCreateRole: document.getElementById('adminCreateRole'),
    adminCreateObservation: document.getElementById('adminCreateObservation'),
    adminUsersStatus: document.getElementById('adminUsersStatus'),
    usersBody: document.getElementById('usersBody'),
    userModal: document.getElementById('userModal'),
    closeUserModalButton: document.getElementById('closeUserModal'),
    cancelUserModalButton: document.getElementById('cancelUserModal'),
    editUserForm: document.getElementById('editUserForm'),
    editUserKey: document.getElementById('editUserKey'),
    editUserUsername: document.getElementById('editUserUsername'),
    editUserRole: document.getElementById('editUserRole'),
    editUserPassword: document.getElementById('editUserPassword'),
    editUserWarnings: document.getElementById('editUserWarnings'),
    editUserSanctions: document.getElementById('editUserSanctions'),
    showWarningEditorButton: document.getElementById('showWarningEditor'),
    showSanctionEditorButton: document.getElementById('showSanctionEditor'),
    showObservationEditorButton: document.getElementById('showObservationEditor'),
    warningReasonWrap: document.getElementById('warningReasonWrap'),
    sanctionReasonWrap: document.getElementById('sanctionReasonWrap'),
    userObservationWrap: document.getElementById('userObservationWrap'),
    editWarningReason: document.getElementById('editWarningReason'),
    editSanctionReason: document.getElementById('editSanctionReason'),
    editUserObservation: document.getElementById('editUserObservation'),
    editUserDisciplineList: document.getElementById('editUserDisciplineList'),
    editUserStatus: document.getElementById('editUserStatus'),
    historyModal: document.getElementById('historyModal'),
    closeHistoryModalButton: document.getElementById('closeHistoryModal'),
    cancelHistoryModalButton: document.getElementById('cancelHistoryModal'),
    editHistoryForm: document.getElementById('editHistoryForm'),
    editHistoryIndex: document.getElementById('editHistoryIndex'),
    editHistoryDate: document.getElementById('editHistoryDate'),
    editHistoryType: document.getElementById('editHistoryType'),
    editHistoryName: document.getElementById('editHistoryName'),
    editHistoryRole: document.getElementById('editHistoryRole'),
    editHistoryDuration: document.getElementById('editHistoryDuration'),
    editHistoryIncidencia: document.getElementById('editHistoryIncidencia'),
    editHistoryObservation: document.getElementById('editHistoryObservation'),
    editHistoryStatus: document.getElementById('editHistoryStatus'),
    disciplineModal: document.getElementById('disciplineModal'),
    closeDisciplineModalButton: document.getElementById('closeDisciplineModal'),
    cancelDisciplineModalButton: document.getElementById('cancelDisciplineModal'),
    editDisciplineForm: document.getElementById('editDisciplineForm'),
    editDisciplineUserKey: document.getElementById('editDisciplineUserKey'),
    editDisciplineIndex: document.getElementById('editDisciplineIndex'),
    editDisciplineDate: document.getElementById('editDisciplineDate'),
    editDisciplineName: document.getElementById('editDisciplineName'),
    editDisciplineType: document.getElementById('editDisciplineType'),
    editDisciplineAssignedBy: document.getElementById('editDisciplineAssignedBy'),
    editDisciplineReason: document.getElementById('editDisciplineReason'),
    editDisciplineStatus: document.getElementById('editDisciplineStatus'),
    adminSections: document.querySelectorAll('[data-admin-section="true"]'),
    employeePlusSections: document.querySelectorAll('[data-employee-plus="true"]'),
    viewerPlusSections: document.querySelectorAll('[data-viewer-plus="true"]'),
    workerControls: document.querySelectorAll('[data-worker-write="true"]'),
    adminControls: document.querySelectorAll('[data-admin-only="true"]'),
    nombreInput: document.getElementById('nombrePersona'),
    incidenciaInput: document.getElementById('incidencia'),
    observacionInput: document.getElementById('observacion'),
    providerSaveButton: document.getElementById('guardarProveedor'),
    ingresoTime: document.getElementById('ingresoTime'),
    salidaTime: document.getElementById('salidaTime'),
    ultimoIngresoPersona: document.getElementById('ultimoIngresoPersona'),
    ultimaSalidaPersona: document.getElementById('ultimaSalidaPersona'),
    totalMovimientos: document.getElementById('totalMovimientos'),
    resumenHoy: document.getElementById('resumenHoy'),
    totalSemana: document.getElementById('totalSemana'),
    resumenSemana: document.getElementById('resumenSemana'),
    totalMes: document.getElementById('totalMes'),
    resumenMes: document.getElementById('resumenMes'),
    personasHoy: document.getElementById('personasHoy'),
    resumenPersonasHoy: document.getElementById('resumenPersonasHoy'),
    adminHistoryColumns: document.querySelectorAll('[data-admin-history-column]'),
    historialBody: document.getElementById('historialBody'),
    historyCount: document.getElementById('historyCount'),
    openFiltersDrawerButton: document.getElementById('openFiltersDrawer'),
    closeFiltersDrawerButton: document.getElementById('closeFiltersDrawer'),
    filtersDrawerBackdrop: document.getElementById('filtersDrawerBackdrop'),
    historyFilters: document.getElementById('historyFilters'),
    estadoActual: document.getElementById('estadoActual'),
    contadorPanel: document.getElementById('contadorPanel'),
    contadorLabel: document.getElementById('contadorLabel'),
    contadorTiempo: document.getElementById('contadorTiempo'),
    liveClock: document.getElementById('liveClock'),
    liveDate: document.getElementById('liveDate'),
    filtroNombre: document.getElementById('buscarNombre'),
    filtroPeriodo: document.getElementById('filtroPeriodo'),
    filtroFecha: document.getElementById('filtroFecha'),
    filtroFechaWrap: document.getElementById('fechaFiltroWrap'),
    filtroRol: document.getElementById('filtroRol'),
    filtroIncidencia: document.getElementById('filtroIncidencia'),
    formStatus: document.getElementById('formStatus')
  };
}

function obtenerEtiqueta(mapa, valor) {
  return mapa[valor] || valor || '—';
}

function escapeHtml(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function obtenerInicioSemana(fecha) {
  const copia = new Date(fecha);
  const dia = copia.getDay();
  const diferencia = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + diferencia);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function obtenerFinSemana(fecha) {
  const inicio = obtenerInicioSemana(fecha);
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

function obtenerFiltros(elements) {
  return {
    nombre: elements.filtroNombre ? elements.filtroNombre.value.trim().toLowerCase() : '',
    periodo: elements.filtroPeriodo ? elements.filtroPeriodo.value : 'todos',
    fecha: elements.filtroFecha ? elements.filtroFecha.value : '',
    rol: normalizarFiltroRol(elements.filtroRol ? elements.filtroRol.value : 'todos'),
    incidencia: elements.filtroIncidencia ? elements.filtroIncidencia.value : 'todos'
  };
}

function aplicarFiltrosEnFormulario(elements, filtros, usuario) {
  const filtrosBase = Object.assign(crearFiltrosIniciales(), filtros || {});
  if (elements.filtroNombre) elements.filtroNombre.value = filtrosBase.nombre;
  if (elements.filtroPeriodo) elements.filtroPeriodo.value = filtrosBase.periodo;
  if (elements.filtroFecha) elements.filtroFecha.value = filtrosBase.fecha || obtenerClaveFecha(new Date());
  if (elements.filtroRol) elements.filtroRol.value = normalizarFiltroRol(filtrosBase.rol);
  renderizarOpcionesFiltroIncidencia(elements, usuario ? usuario.rol : 'empleado', filtrosBase.incidencia || 'todos');
  if (elements.filtroIncidencia) elements.filtroIncidencia.value = filtrosBase.incidencia || 'todos';
  actualizarVisibilidadFiltroFecha(elements);
}

function movimientoCoincidePeriodo(item, periodo, fechaFiltro) {
  const fecha = obtenerFechaDesdeMovimiento(item);
  if (!fecha) return periodo === 'todos';

  const hoy = new Date();
  if (periodo === 'hoy') return obtenerClaveFecha(fecha) === obtenerClaveFecha(hoy);
  if (periodo === 'semana') return fecha >= obtenerInicioSemana(hoy) && fecha <= obtenerFinSemana(hoy);
  if (periodo === 'mes') return fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth();
  if (periodo === 'fecha') return fechaFiltro ? obtenerClaveFecha(fecha) === fechaFiltro : true;
  return true;
}

function filtrarHistorial(historial, filtros) {
  return historial.filter((item) => {
    const textoBusqueda = `${item.nombre} ${item.observacion}`.toLowerCase();
    const coincideNombre = !filtros.nombre || textoBusqueda.includes(filtros.nombre);
    const coincidePeriodo = movimientoCoincidePeriodo(item, filtros.periodo, filtros.fecha);
    const coincideRol = filtros.rol === 'todos' || item.rolPersona === filtros.rol;
    const coincideIncidencia = filtros.incidencia === 'todos' || item.incidencia === filtros.incidencia;
    return coincideNombre && coincidePeriodo && coincideRol && coincideIncidencia;
  });
}

function filtrarHistorialConIndice(historial, filtros) {
  return historial
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const textoBusqueda = `${item.nombre} ${item.observacion}`.toLowerCase();
      const coincideNombre = !filtros.nombre || textoBusqueda.includes(filtros.nombre);
      const coincidePeriodo = movimientoCoincidePeriodo(item, filtros.periodo, filtros.fecha);
      const coincideRol = filtros.rol === 'todos' || item.rolPersona === filtros.rol;
      const coincideIncidencia = filtros.incidencia === 'todos' || item.incidencia === filtros.incidencia;
      return coincideNombre && coincidePeriodo && coincideRol && coincideIncidencia;
    });
}

function movimientoPerteneceAUsuario(item, usuario) {
  if (!item || !usuario) return false;
  if (item.creadoPorUsernameKey) return item.creadoPorUsernameKey === usuario.usernameKey;

  const nombreMovimiento = normalizarUsername(item.nombre);
  if (nombreMovimiento !== usuario.usernameKey) return false;

  return normalizarRolGestionable(item.rolPersona, usuario.rol) === usuario.rol;
}

function obtenerHistorialPropioUsuario(historial, usuario) {
  if (!usuario) return [];
  return historial.filter((item) => movimientoPerteneceAUsuario(item, usuario));
}

function obtenerUltimoMovimientoDeUsuario(historial, usuario) {
  return historial.find((item) => movimientoPerteneceAUsuario(item, usuario)) || null;
}

function obtenerClaseTipoMovimiento(item) {
  if (!item) return '';
  if (item.tipo === 'registro_proveedor') return 'type-provider';
  if (item.tipo === 'ingreso') return 'type-in';
  if (item.tipo === 'salida') return 'type-out';
  if (item.tipo === 'advertencia') return 'type-warning';
  if (item.tipo === 'sancion') return 'type-sanction';
  return '';
}

function obtenerEtiquetaTipoMovimiento(item) {
  if (!item) return '—';
  return obtenerEtiqueta(LABELS_TIPO, item.tipo);
}

function historialVisibleParaUsuario(historial, usuario) {
  if (!usuario) return [];
  if (esRolAdministrativo(usuario.rol)) return historial;
  return obtenerHistorialPropioUsuario(historial, usuario);
}

function construirEntradasDisciplinarias(users, usuario) {
  const usuariosVisibles = usuario && esRolAdministrativo(usuario.rol)
    ? users
    : users.filter((item) => usuario && item.usernameKey === usuario.usernameKey);

  return usuariosVisibles.flatMap((user) => {
    const rolEtiqueta = obtenerEtiqueta(LABELS_ROL, user.rol);
    return (user.historialDisciplinario || []).map((entry, disciplineIndex) => ({
      sourceType: 'disciplina',
      usernameKey: user.usernameKey,
      disciplineIndex,
      item: {
        tipo: entry.tipo,
        nombre: user.username,
        rolPersona: user.rol,
        incidencia: '',
        observacion: entry.motivo,
        fechaISO: entry.fechaISO,
        fechaTexto: entry.fechaTexto,
        fechaDia: obtenerClaveFecha(new Date(entry.fechaISO)),
        duracionJornadaMs: null,
        origenRegistro: 'disciplina',
        detalleDisciplina: `${obtenerEtiqueta(LABELS_DISCIPLINA, entry.tipo)} · ${rolEtiqueta}`,
        asignadoPorUsername: entry.asignadoPorUsername
      }
    }));
  });
}

function construirEntradasHistorial(data, users, usuario) {
  const movimientos = historialVisibleParaUsuario(data.historial, usuario).map((item, index) => ({
    sourceType: 'movimiento',
    index,
    item
  }));

  const disciplinas = construirEntradasDisciplinarias(users, usuario);

  return [...movimientos, ...disciplinas]
    .slice()
    .sort((a, b) => new Date(b.item.fechaISO) - new Date(a.item.fechaISO));
}

function obtenerMovimientosPorFecha(historial, claveFecha) {
  return historial
    .filter((item) => obtenerClaveFecha(obtenerFechaDesdeMovimiento(item) || new Date()) === claveFecha)
    .slice()
    .sort((a, b) => new Date(a.fechaISO) - new Date(b.fechaISO));
}

function obtenerResumenPeriodo(historial, comparador) {
  return historial.filter((item) => comparador(obtenerFechaDesdeMovimiento(item)));
}

function obtenerPermisosUsuario(usuario) {
  const rol = usuario ? usuario.rol : null;
  const esAdmin = esRolAdministrativo(rol);
  return {
    tieneSesion: Boolean(usuario),
    esAdmin,
    puedeRegistrar: esAdmin || rol === 'empleado' || rol === 'proveedor',
    puedeVerSeguridad: esAdmin,
    puedeVerReportes: esAdmin,
    puedeVerOperacion: esAdmin || rol === 'empleado' || rol === 'proveedor',
    puedeVerPanelBase: Boolean(usuario)
  };
}

function obtenerVistaAuthActual() {
  return localStorage.getItem(AUTH_VIEW_KEY) || obtenerDraftsAuth().authView || 'login';
}

function fijarVistaAuth(vista) {
  const nuevaVista = vista === 'register' ? 'register' : 'login';
  localStorage.setItem(AUTH_VIEW_KEY, nuevaVista);
  const drafts = obtenerDraftsAuth();
  drafts.authView = nuevaVista;
  guardarDraftsAuth(drafts);

  const elements = obtenerElementos();
  if (elements.loginPanel) elements.loginPanel.classList.toggle('is-hidden', nuevaVista !== 'login');
  if (elements.registerPanel) elements.registerPanel.classList.toggle('is-hidden', nuevaVista !== 'register');
  if (elements.showLogin) {
    elements.showLogin.classList.toggle('is-active', nuevaVista === 'login');
    elements.showLogin.setAttribute('aria-selected', nuevaVista === 'login' ? 'true' : 'false');
  }
  if (elements.showRegister) {
    elements.showRegister.classList.toggle('is-active', nuevaVista === 'register');
    elements.showRegister.setAttribute('aria-selected', nuevaVista === 'register' ? 'true' : 'false');
  }
}

function actualizarVisibilidadFiltroFecha(elements) {
  if (!elements.filtroFechaWrap || !elements.filtroPeriodo) return;
  elements.filtroFechaWrap.classList.toggle('is-hidden', elements.filtroPeriodo.value !== 'fecha');
}

function renderizarOpcionesIncidenciaEnSelect(selectElement, rol, valorSeleccionado, incluirTodos = false) {
  if (!selectElement) return;
  const incidencias = INCIDENCIAS_POR_ROL[normalizarRolGestionable(rol, 'admin')] || INCIDENCIAS_POR_ROL.admin;
  const incidenciaActual = incluirTodos && valorSeleccionado === 'todos'
    ? 'todos'
    : normalizarIncidencia(valorSeleccionado, rol);
  const opcionesBase = incidencias.map((incidencia) => {
    const selected = incidencia === incidenciaActual ? ' selected' : '';
    return `<option value="${escapeHtml(incidencia)}"${selected}>${escapeHtml(obtenerEtiqueta(LABELS_INCIDENCIA, incidencia))}</option>`;
  });
  if (incluirTodos) {
    opcionesBase.unshift(`<option value="todos"${incidenciaActual === 'todos' ? ' selected' : ''}>Todas</option>`);
  }
  selectElement.innerHTML = opcionesBase.join('');
  selectElement.value = incidenciaActual;
}

function renderizarOpcionesIncidencia(elements, rol, valorSeleccionado) {
  renderizarOpcionesIncidenciaEnSelect(elements.incidenciaInput, rol, valorSeleccionado, false);
}

function renderizarOpcionesFiltroIncidencia(elements, rol, valorSeleccionado) {
  renderizarOpcionesIncidenciaEnSelect(elements.filtroIncidencia, rol, valorSeleccionado, true);
}

function renderizarOpcionesIncidenciaEdicion(elements, rol, valorSeleccionado) {
  renderizarOpcionesIncidenciaEnSelect(elements.editHistoryIncidencia, rol, valorSeleccionado, false);
}

function renderizarOpcionesTipoEdicion(elements, rol, valorSeleccionado) {
  if (!elements.editHistoryType) return;
  const opciones = rol === 'proveedor'
    ? [{ value: 'registro_proveedor', label: 'Registro' }]
    : [
      { value: 'ingreso', label: 'Ingreso' },
      { value: 'salida', label: 'Salida' }
    ];

  elements.editHistoryType.innerHTML = opciones.map((opcion) => {
    const selected = opcion.value === valorSeleccionado ? ' selected' : '';
    return `<option value="${escapeHtml(opcion.value)}"${selected}>${escapeHtml(opcion.label)}</option>`;
  }).join('');
  elements.editHistoryType.value = opciones.some((opcion) => opcion.value === valorSeleccionado)
    ? valorSeleccionado
    : opciones[0].value;
}

function actualizarFormularioPorRol(elements, usuario) {
  const rol = usuario ? usuario.rol : 'empleado';
  const esProveedor = rol === 'proveedor';
  const botonIngreso = document.getElementById('ingreso');
  const botonSalida = document.getElementById('salida');

  renderizarOpcionesIncidencia(elements, rol, elements.incidenciaInput ? elements.incidenciaInput.value : 'ninguna');
  renderizarOpcionesFiltroIncidencia(elements, rol, elements.filtroIncidencia ? elements.filtroIncidencia.value : 'todos');

  if (elements.observacionInput) {
    elements.observacionInput.placeholder = esProveedor
      ? 'Ejemplo: Entrega de mercadería, visita programada, recepción de pedido...'
      : 'Ejemplo: Apertura del local, entrega de pedido, cierre de jornada...';
  }

  if (botonIngreso) botonIngreso.classList.toggle('is-hidden', esProveedor);
  if (botonSalida) botonSalida.classList.toggle('is-hidden', esProveedor);
  if (elements.providerSaveButton) elements.providerSaveButton.classList.toggle('is-hidden', !esProveedor);
}

function restaurarDraftsAuth(elements) {
  const drafts = obtenerDraftsAuth();
  if (elements.loginNombre) elements.loginNombre.value = drafts.loginNombre;
  if (elements.loginPassword) elements.loginPassword.value = drafts.loginPassword;
  if (elements.registerNombre) elements.registerNombre.value = drafts.registerNombre;
  if (elements.registerPassword) elements.registerPassword.value = drafts.registerPassword;
  if (elements.registerRol) elements.registerRol.value = drafts.registerRol || 'empleado';
  fijarVistaAuth('login');
}

function actualizarVistaSesion(elements, usuario) {
  const permisos = obtenerPermisosUsuario(usuario);
  const etiquetaRol = usuario ? obtenerEtiqueta(LABELS_ROL, usuario.rol) : 'Sin rol';
  const textosHeroPorRol = {
    admin: {
      eyebrow: 'Área administrativa',
      title: 'Control de registro'
    },
    developer: {
      eyebrow: 'Área Developer',
      title: 'Control de registro'
    },
    empleado: {
      eyebrow: 'Área operativa',
      title: 'Control de registro'
    },
    proveedor: {
      eyebrow: 'Área proveedor',
      title: 'Control de registro'
    }
  };
  const heroConfig = usuario ? (textosHeroPorRol[usuario.rol] || {
    eyebrow: `Panel de ${etiquetaRol.toLowerCase()}`,
    title: 'Control de registro'
  }) : {
    eyebrow: 'Control del local',
    title: 'Centro de registro y control'
  };

  if (elements.authShell) elements.authShell.classList.toggle('is-hidden', permisos.tieneSesion);
  if (elements.dashboardShell) elements.dashboardShell.classList.toggle('is-hidden', !permisos.tieneSesion);
  if (elements.dashboardShell) {
    elements.dashboardShell.classList.toggle('is-admin-access-view', Boolean(usuario && esRolAdministrativo(usuario.rol)));
    elements.dashboardShell.classList.toggle('is-user-view', Boolean(usuario && !esRolAdministrativo(usuario.rol)));
    elements.dashboardShell.classList.toggle('is-admin-view', Boolean(usuario && usuario.rol === 'admin'));
    elements.dashboardShell.classList.toggle('is-developer-view', Boolean(usuario && usuario.rol === 'developer'));
    elements.dashboardShell.classList.toggle('is-empleado-view', Boolean(usuario && usuario.rol === 'empleado'));
    elements.dashboardShell.classList.toggle('is-proveedor-view', Boolean(usuario && usuario.rol === 'proveedor'));
  }

  if (!permisos.tieneSesion) return;

  if (elements.sessionUserName) elements.sessionUserName.textContent = usuario.username;
  if (elements.sessionUserRole) {
    elements.sessionUserRole.textContent = '';
  }
  if (elements.heroEyebrow) {
    elements.heroEyebrow.textContent = heroConfig.eyebrow;
  }
  if (elements.heroTitle) {
    elements.heroTitle.textContent = heroConfig.title;
  }
  if (elements.sessionRoleChip) {
    elements.sessionRoleChip.textContent = etiquetaRol;
    elements.sessionRoleChip.className = `role-chip role-chip-${usuario.rol}`;
  }

  elements.adminSections.forEach((section) => {
    section.classList.toggle('is-hidden', !permisos.puedeVerSeguridad);
  });

  elements.employeePlusSections.forEach((section) => {
    section.classList.toggle('is-hidden', !permisos.puedeVerOperacion);
  });

  elements.viewerPlusSections.forEach((section) => {
    section.classList.toggle('is-hidden', !permisos.puedeVerPanelBase);
  });

  if (elements.profilePanel) {
    elements.profilePanel.classList.toggle('is-hidden', !permisos.puedeVerPanelBase || permisos.esAdmin);
  }

  if (elements.adminHistoryColumns) {
    elements.adminHistoryColumns.forEach((column) => {
      column.classList.toggle('is-hidden', !permisos.esAdmin);
    });
  }

  elements.workerControls.forEach((control) => {
    if ('disabled' in control) control.disabled = !permisos.puedeRegistrar;
  });

  elements.adminControls.forEach((control) => {
    if ('disabled' in control) control.disabled = !permisos.esAdmin;
  });

  if (elements.formStatus) {
    if (permisos.puedeRegistrar) {
      elements.formStatus.textContent = permisos.esAdmin
        ? usuario && usuario.rol === 'developer'
          ? 'Como Developer puedes registrar movimientos, gestionar usuarios, cambiar tu clave y editar el historial.'
          : 'Como administrador puedes registrar movimientos, gestionar usuarios, cambiar tu clave y editar el historial.'
        : usuario && usuario.rol === 'proveedor'
          ? 'Como proveedor puedes guardar visitas y entregas.'
          : 'Puedes registrar ingresos y salidas con la cuenta que te asignó el administrador.';
    } else {
      elements.formStatus.textContent = 'Tu rol actual solo permite consulta.';
    }
  }

  if (elements.passwordStatus) {
    elements.passwordStatus.textContent = 'Cada usuario puede cambiar la clave de su propia cuenta.';
  }

  if (elements.nombreInput) {
    if (permisos.esAdmin) {
      elements.nombreInput.readOnly = false;
      elements.nombreInput.placeholder = 'Ejemplo: Cristian';
    } else {
      elements.nombreInput.value = usuario.username;
      elements.nombreInput.readOnly = true;
      elements.nombreInput.placeholder = usuario.username;
    }
  }

  actualizarFormularioPorRol(elements, usuario);
}

function renderizarFichaUsuarioActual(usuario, elements) {
  if (!usuario) return;
  const esProveedor = usuario.rol === 'proveedor';
  const totalReportes = Number(usuario.advertencias || 0) + Number(usuario.sanciones || 0);

  if (elements.profileGrid) {
    elements.profileGrid.classList.toggle('is-provider-profile', esProveedor);
  }
  if (elements.profileWarningsCard) {
    elements.profileWarningsCard.classList.toggle('is-hidden', false);
  }
  if (elements.profileSanctionsCard) {
    elements.profileSanctionsCard.classList.toggle('is-hidden', esProveedor);
  }
  if (elements.profileWarningsLabel) {
    elements.profileWarningsLabel.textContent = esProveedor ? 'Reportes' : 'Advertencias';
  }
  if (elements.profileSanctionsLabel) {
    elements.profileSanctionsLabel.textContent = 'Sanciones';
  }
  if (elements.profileRole) elements.profileRole.textContent = obtenerEtiqueta(LABELS_ROL, usuario.rol);
  if (elements.profileWarnings) elements.profileWarnings.textContent = String(esProveedor ? totalReportes : (usuario.advertencias || 0));
  if (elements.profileSanctions) elements.profileSanctions.textContent = String(usuario.sanciones || 0);
  if (elements.profileObservation) {
    elements.profileObservation.textContent = usuario.observacionUsuario || 'No tienes observaciones registradas.';
  }
}

function renderizarHistorialDisciplinarioUsuario(user, elements) {
  if (!elements.editUserDisciplineList) return;

  const entries = user && Array.isArray(user.historialDisciplinario) ? user.historialDisciplinario : [];
  if (!entries.length) {
    elements.editUserDisciplineList.innerHTML = 'Sin registros disciplinarios.';
    return;
  }

  elements.editUserDisciplineList.innerHTML = `<ul>${entries.map((entry) => `<li><strong>${escapeHtml(obtenerEtiqueta(LABELS_DISCIPLINA, entry.tipo))}</strong> · ${escapeHtml(entry.motivo || 'Sin motivo')} · ${escapeHtml(entry.fechaTexto)}</li>`).join('')}</ul>`;
}

function alternarEditorDisciplinario(elements, panel) {
  const mostrarAdvertencia = panel === 'advertencia';
  const mostrarSancion = panel === 'sancion';
  const mostrarObservacion = panel === 'observacion';

  if (elements.warningReasonWrap) elements.warningReasonWrap.classList.toggle('is-hidden', !mostrarAdvertencia);
  if (elements.sanctionReasonWrap) elements.sanctionReasonWrap.classList.toggle('is-hidden', !mostrarSancion);
  if (elements.userObservationWrap) elements.userObservationWrap.classList.toggle('is-hidden', !mostrarObservacion);

  if (elements.showWarningEditorButton) elements.showWarningEditorButton.classList.toggle('is-active', mostrarAdvertencia);
  if (elements.showSanctionEditorButton) elements.showSanctionEditorButton.classList.toggle('is-active', mostrarSancion);
  if (elements.showObservationEditorButton) elements.showObservationEditorButton.classList.toggle('is-active', mostrarObservacion);
}

function formatearDuracion(ms) {
  const totalSegundos = Math.max(0, Math.floor(ms / 1000));
  const horas = String(Math.floor(totalSegundos / 3600)).padStart(2, '0');
  const minutos = String(Math.floor((totalSegundos % 3600) / 60)).padStart(2, '0');
  const segundos = String(totalSegundos % 60).padStart(2, '0');
  return `${horas}:${minutos}:${segundos}`;
}

function obtenerTextoDuracionJornada(item) {
  return item && item.duracionJornadaMs !== null && item.duracionJornadaMs !== undefined
    ? formatearDuracion(item.duracionJornadaMs)
    : '—';
}

function obtenerDatosContadorUsuario(historial, usuario, ahora = new Date()) {
  if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'empleado')) return null;

  const historialPropio = obtenerHistorialPropioUsuario(historial, usuario);
  const ultimoMovimiento = historialPropio[0];
  if (!ultimoMovimiento) return null;

  const fechaUltimoMovimiento = obtenerFechaDesdeMovimiento(ultimoMovimiento);
  if (!fechaUltimoMovimiento) return null;

  if (ultimoMovimiento.tipo === 'ingreso') {
    return {
      activo: true,
      etiqueta: 'Jornada iniciada',
      duracion: ahora.getTime() - fechaUltimoMovimiento.getTime()
    };
  }

  if (ultimoMovimiento.tipo !== 'salida') return null;

  return {
    activo: false,
    etiqueta: 'Jornada terminada',
    duracion: ultimoMovimiento.duracionJornadaMs || 0
  };
}

function renderizarContadorTiempo(data, elements, usuarioActual, ahora = new Date()) {
  if (!elements.contadorPanel || !elements.contadorLabel || !elements.contadorTiempo) return;

  const contador = obtenerDatosContadorUsuario(data.historial, usuarioActual, ahora);
  const debeMostrar = Boolean(contador);

  elements.contadorPanel.classList.toggle('is-hidden', !debeMostrar);
  elements.contadorPanel.classList.toggle('is-active', Boolean(contador && contador.activo));
  elements.contadorPanel.classList.toggle('is-paused', Boolean(contador && !contador.activo));

  if (!contador) {
    elements.contadorLabel.textContent = 'Jornada iniciada';
    elements.contadorTiempo.textContent = '00:00:00';
    return;
  }

  elements.contadorLabel.textContent = contador.etiqueta;
  elements.contadorTiempo.textContent = formatearDuracion(contador.duracion);
}

function renderizarResumenGeneral(data, elements, usuarioActual) {
  if (elements.ingresoTime) elements.ingresoTime.textContent = data.ultimoIngreso ? data.ultimoIngreso.fechaTexto : '—';
  if (elements.salidaTime) elements.salidaTime.textContent = data.ultimaSalida ? data.ultimaSalida.fechaTexto : '—';

  if (elements.ultimoIngresoPersona) {
    elements.ultimoIngresoPersona.textContent = data.ultimoIngreso
      ? data.ultimoIngreso.nombre
      : 'Sin registro';
  }

  if (elements.ultimaSalidaPersona) {
    elements.ultimaSalidaPersona.textContent = data.ultimaSalida
      ? data.ultimaSalida.nombre
      : 'Sin registro';
  }

  const hoyClave = obtenerClaveFecha(new Date());
  const hoy = data.historial.filter((item) => item.fechaDia === hoyClave);
  const hoyIngresos = hoy.filter((item) => item.tipo === 'ingreso').length;
  const hoySalidas = hoy.filter((item) => item.tipo === 'salida').length;

  if (elements.totalMovimientos) elements.totalMovimientos.textContent = hoy.length;
  if (elements.resumenHoy) {
    elements.resumenHoy.textContent = hoy.length
      ? `${hoyIngresos} ingresos y ${hoySalidas} salidas hoy`
      : 'Todavía no hay actividad registrada';
  }

  const semana = obtenerResumenPeriodo(data.historial, (fecha) => {
    if (!fecha) return false;
    return fecha >= obtenerInicioSemana(new Date()) && fecha <= obtenerFinSemana(new Date());
  });

  if (elements.totalSemana) elements.totalSemana.textContent = semana.length;
  if (elements.resumenSemana) {
    const retrasos = semana.filter((item) => item.incidencia === 'retraso').length;
    elements.resumenSemana.textContent = semana.length ? `${retrasos} retrasos en la semana actual` : 'Sin actividad semanal';
  }

  const mes = obtenerResumenPeriodo(data.historial, (fecha) => {
    if (!fecha) return false;
    const hoyFecha = new Date();
    return fecha.getFullYear() === hoyFecha.getFullYear() && fecha.getMonth() === hoyFecha.getMonth();
  });

  if (elements.totalMes) elements.totalMes.textContent = mes.length;
  if (elements.resumenMes) {
    const incidencias = mes.filter((item) => item.incidencia !== 'ninguna').length;
    elements.resumenMes.textContent = mes.length ? `${incidencias} incidencias en el mes actual` : 'Sin actividad mensual';
  }

  const personasUnicasHoy = [...new Set(hoy.map((item) => item.nombre.toLowerCase()))];
  if (elements.personasHoy) elements.personasHoy.textContent = personasUnicasHoy.length;
  if (elements.resumenPersonasHoy) {
    elements.resumenPersonasHoy.textContent = personasUnicasHoy.length
      ? `${personasUnicasHoy.length} personas distintas registradas hoy`
      : 'Sin personas registradas hoy';
  }

  if (elements.estadoActual) {
    if (usuarioActual && usuarioActual.rol === 'developer') {
      elements.estadoActual.textContent = 'Estado actual: En linea';
      elements.estadoActual.className = 'status-pill status-provider';
    } else {
      const ultimo = obtenerUltimoMovimientoDeUsuario(data.historial, usuarioActual);
      if (!ultimo) {
        elements.estadoActual.textContent = 'Sin registros';
        elements.estadoActual.className = 'status-pill';
      } else if (ultimo.tipo === 'ingreso') {
        elements.estadoActual.textContent = 'Estado actual: Dentro del local';
        elements.estadoActual.className = 'status-pill status-in';
      } else if (ultimo.tipo === 'registro_proveedor') {
        elements.estadoActual.textContent = 'Estado actual: Registro guardado';
        elements.estadoActual.className = 'status-pill status-provider';
      } else {
        elements.estadoActual.textContent = 'Estado actual: Fuera del local';
        elements.estadoActual.className = 'status-pill status-out';
      }
    }
  }

  renderizarContadorTiempo(data, elements, usuarioActual, new Date());
}

function renderizarUsuariosRegistrados(elements) {
  if (!elements.usersBody) return;

  const users = obtenerUsuariosGuardados()
    .slice()
    .sort((a, b) => obtenerPesoRol(a.rol) - obtenerPesoRol(b.rol) || a.username.localeCompare(b.username, 'es', { sensitivity: 'base' }));
  if (!users.length) {
    elements.usersBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Todavía no hay usuarios registrados.</td>
      </tr>
    `;
    return;
  }

  elements.usersBody.innerHTML = users.map((user) => `
    <tr>
      <td>${escapeHtml(obtenerEtiqueta(LABELS_ROL, user.rol))}</td>
      <td>${escapeHtml(user.username)}</td>
      <td>${escapeHtml(user.password || '—')}</td>
      <td>${escapeHtml(String(user.advertencias || 0))}</td>
      <td>${escapeHtml(String(user.sanciones || 0))}</td>
      <td>${escapeHtml(user.observacionUsuario || '—')}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="table-action-btn" data-edit-user="${escapeHtml(user.usernameKey)}">Editar</button>
          <button type="button" class="table-action-btn table-action-btn-danger table-action-btn-icon" data-delete-user="${escapeHtml(user.usernameKey)}" aria-label="Eliminar usuario ${escapeHtml(user.username)}" title="Eliminar usuario">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Zm-1 11h12l1-13H5l1 13Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderizarHistorial(historialFiltrado, totalOriginal, elements, usuarioActual) {
  if (!elements.historialBody) return;
  const esAdmin = Boolean(usuarioActual && esRolAdministrativo(usuarioActual.rol));
  const colspan = esAdmin ? 8 : 6;

  if (!historialFiltrado.length) {
    elements.historialBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="${colspan}">No hay movimientos que coincidan con los filtros actuales.</td>
      </tr>
    `;
  } else {
    elements.historialBody.innerHTML = historialFiltrado.map(({ item, index, sourceType, usernameKey, disciplineIndex }) => `
      <tr>
        <td><span class="type-badge ${obtenerClaseTipoMovimiento(item)}">${escapeHtml(obtenerEtiquetaTipoMovimiento(item))}</span></td>
        <td>${escapeHtml(item.nombre)}</td>
        ${esAdmin ? `<td>${escapeHtml(obtenerEtiqueta(LABELS_ROL, item.rolPersona))}</td>` : ''}
        <td>${escapeHtml(obtenerTextoDuracionJornada(item))}</td>
        <td>${escapeHtml(item.tipo === 'advertencia' || item.tipo === 'sancion' ? (item.asignadoPorUsername ? `Asignado por ${item.asignadoPorUsername}` : 'Disciplina') : obtenerEtiqueta(LABELS_INCIDENCIA, item.incidencia))}</td>
        <td>${escapeHtml(item.fechaTexto)}</td>
        <td>${escapeHtml(item.observacion || '—')}</td>
        ${esAdmin ? `<td>${sourceType === 'disciplina'
          ? `<div class="table-actions"><button type="button" class="table-action-btn" data-edit-discipline="${escapeHtml(`${usernameKey}::${disciplineIndex}`)}">Editar</button><button type="button" class="table-action-btn table-action-btn-danger table-action-btn-icon" data-delete-discipline="${escapeHtml(`${usernameKey}::${disciplineIndex}`)}" aria-label="Eliminar registro disciplinario" title="Eliminar registro disciplinario"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Zm-1 11h12l1-13H5l1 13Z" fill="currentColor"/></svg></button></div>`
          : `<div class="table-actions"><button type="button" class="table-action-btn" data-edit-history="${index}">Editar</button><button type="button" class="table-action-btn table-action-btn-danger table-action-btn-icon" data-delete-history="${index}" aria-label="Eliminar movimiento" title="Eliminar movimiento"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM7 10h2v8H7v-8Zm-1 11h12l1-13H5l1 13Z" fill="currentColor"/></svg></button></div>`}</td>` : ''}
      </tr>
    `).join('');
  }

  if (elements.historyCount) elements.historyCount.textContent = `${historialFiltrado.length} de ${totalOriginal} registros`;
}

function renderizarTodo() {
  const data = obtenerEstadoGuardado();
  const elements = obtenerElementos();
  const session = obtenerSesionActual();
  const usuarioActual = session ? obtenerUsuarioPorUsernameKey(session.usernameKey) : null;
  const users = obtenerUsuariosGuardados();

  if (session && !usuarioActual) {
    cerrarSesionActual();
    renderizarTodo();
    return;
  }

  restaurarDraftsAuth(elements);
  actualizarVistaSesion(elements, usuarioActual);

  if (!usuarioActual) return;

  aplicarFiltrosEnFormulario(elements, obtenerFiltrosGuardadosUsuario(usuarioActual), usuarioActual);
  actualizarVisibilidadFiltroFecha(elements);

  const historialBase = construirEntradasHistorial(data, users, usuarioActual);
  const filtros = obtenerFiltros(elements);
  const historialFiltrado = filtrarHistorialConIndice(historialBase.map((entry) => entry.item), filtros)
    .map(({ item }) => historialBase.find((entry) => entry.item === item));
  renderizarResumenGeneral(data, elements, usuarioActual);
  renderizarFichaUsuarioActual(usuarioActual, elements);
  renderizarUsuariosRegistrados(elements);
  renderizarHistorial(historialFiltrado, historialBase.length, elements, usuarioActual);
  actualizarFormularioPorRol(elements, usuarioActual);
}

function usuarioPuedeRegistrar() {
  return obtenerPermisosUsuario(obtenerSesionActual()).puedeRegistrar;
}

function usuarioEsAdmin() {
  return obtenerPermisosUsuario(obtenerSesionActual()).esAdmin;
}

function registrarMovimiento(tipo) {
  if (!usuarioPuedeRegistrar()) {
    alert('Tu rol actual no puede registrar movimientos.');
    return;
  }

  const elements = obtenerElementos();
  const currentSession = obtenerSesionActual();
  const nombre = currentSession && !esRolAdministrativo(currentSession.rol)
    ? currentSession.username
    : elements.nombreInput ? elements.nombreInput.value.trim() : '';
  const observacion = elements.observacionInput ? elements.observacionInput.value.trim() : '';
  const rolPersona = currentSession ? currentSession.rol : 'otro';
  const tipoMovimiento = rolPersona === 'proveedor' ? 'registro_proveedor' : tipo;
  const incidencia = elements.incidenciaInput ? normalizarIncidencia(elements.incidenciaInput.value, rolPersona) : 'ninguna';

  if (!nombre) {
    alert('Ingresa un nombre antes de registrar el movimiento.');
    if (elements.nombreInput) elements.nombreInput.focus();
    return;
  }

  const ahora = new Date();
  const data = obtenerEstadoGuardado();
  const movimiento = {
    tipo: tipoMovimiento,
    nombre,
    rolPersona,
    incidencia,
    observacion,
    fechaISO: ahora.toISOString(),
    fechaTexto: formatoFechaHora(ahora),
    fechaDia: obtenerClaveFecha(ahora),
    duracionJornadaMs: null,
    creadoPorUsername: currentSession ? currentSession.username : '',
    creadoPorUsernameKey: currentSession ? currentSession.usernameKey : ''
  };

  data.historial.unshift(movimiento);
  data.historial = recalcularMetadatosHistorial(data.historial);
  data.ultimoIngreso = obtenerUltimoMovimiento(data.historial, 'ingreso');
  data.ultimaSalida = obtenerUltimoMovimiento(data.historial, 'salida');
  guardarEstado(data);

  if (elements.observacionInput) elements.observacionInput.value = '';
  if (elements.nombreInput && currentSession && esRolAdministrativo(currentSession.rol)) elements.nombreInput.value = '';

  renderizarTodo();
}

function limpiarHistorial() {
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede borrar el historial.');
    return;
  }

  if (!window.confirm('Se eliminará todo el historial guardado. ¿Deseas continuar?')) return;

  guardarEstado(crearEstadoInicial());
  renderizarTodo();
}

function escaparCsv(valor) {
  return `"${String(valor || '').replace(/"/g, '""')}"`;
}

function descargarArchivo(contenido, nombreArchivo, tipo) {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

function exportarCsv() {
  const data = obtenerEstadoGuardado();
  const elements = obtenerElementos();
  const filtros = obtenerFiltros(elements);
  const historialFiltrado = filtrarHistorial(data.historial, filtros);

  if (!historialFiltrado.length) {
    alert('No hay registros para exportar con los filtros actuales.');
    return;
  }

  const encabezado = ['Tipo', 'Nombre', 'Rol', 'Tiempo de jornada', 'Incidencia', 'Fecha y hora', 'Observacion'];
  const filas = historialFiltrado.map((item) => [
    item.tipo,
    item.nombre,
    obtenerEtiqueta(LABELS_ROL, item.rolPersona),
    obtenerTextoDuracionJornada(item),
    obtenerEtiqueta(LABELS_INCIDENCIA, item.incidencia),
    item.fechaTexto,
    item.observacion || ''
  ]);

  const separador = ';';
  const contenido = [encabezado, ...filas]
    .map((fila) => fila.map(escaparCsv).join(separador))
    .join('\r\n');
  const csv = `\ufeffsep=${separador}\r\n${contenido}`;
  descargarArchivo(csv, 'historial-filtrado-ingreso-salida.csv', 'text/csv;charset=utf-8;');
}

function alternarPanelClave(mostrar) {
  const elements = obtenerElementos();
  if (!elements.passwordModal) return;
  const debeMostrar = typeof mostrar === 'boolean' ? mostrar : elements.passwordModal.classList.contains('is-hidden');
  elements.passwordModal.classList.toggle('is-hidden', !debeMostrar);
  elements.passwordModal.setAttribute('aria-hidden', debeMostrar ? 'false' : 'true');
  if (!debeMostrar) {
    if (elements.currentPassword) elements.currentPassword.value = '';
    if (elements.newAccountPassword) elements.newAccountPassword.value = '';
    if (elements.confirmAccountPassword) elements.confirmAccountPassword.value = '';
  }
}

function cambiarClaveCuenta(event) {
  event.preventDefault();
  const currentSession = obtenerSesionActual();
  if (!currentSession) {
    alert('Debes iniciar sesión para cambiar la clave.');
    return;
  }

  const elements = obtenerElementos();
  const currentPassword = elements.currentPassword ? elements.currentPassword.value : '';
  const newPassword = elements.newAccountPassword ? elements.newAccountPassword.value.trim() : '';
  const confirmPassword = elements.confirmAccountPassword ? elements.confirmAccountPassword.value.trim() : '';
  const users = obtenerUsuariosGuardados();
  const index = users.findIndex((item) => item.usernameKey === currentSession.usernameKey);

  if (index === -1) {
    if (elements.passwordStatus) elements.passwordStatus.textContent = 'No se encontró la cuenta actual.';
    return;
  }

  if (users[index].password !== currentPassword) {
    if (elements.passwordStatus) elements.passwordStatus.textContent = 'La clave actual no coincide.';
    return;
  }

  if (newPassword.length < 4) {
    if (elements.passwordStatus) elements.passwordStatus.textContent = 'La nueva clave debe tener al menos 4 caracteres.';
    return;
  }

  if (newPassword !== confirmPassword) {
    if (elements.passwordStatus) elements.passwordStatus.textContent = 'La confirmación no coincide con la nueva clave.';
    return;
  }

  users[index].password = newPassword;
  guardarUsuarios(users);
  guardarSesionActual(users[index]);
  if (elements.passwordStatus) elements.passwordStatus.textContent = 'Clave actualizada correctamente.';
  alternarPanelClave(false);
}

function alternarModal(elements, modalKey, mostrar) {
  const modal = elements[modalKey];
  if (!modal) return;
  const debeMostrar = typeof mostrar === 'boolean' ? mostrar : modal.classList.contains('is-hidden');
  modal.classList.toggle('is-hidden', !debeMostrar);
  modal.setAttribute('aria-hidden', debeMostrar ? 'false' : 'true');
}

function alternarDrawerFiltros(elements, mostrar) {
  if (!elements.historyFilters || !elements.filtersDrawerBackdrop) return;

  const debeMostrar = typeof mostrar === 'boolean'
    ? mostrar
    : !elements.historyFilters.classList.contains('is-open');

  elements.historyFilters.classList.toggle('is-open', debeMostrar);
  elements.filtersDrawerBackdrop.classList.toggle('is-hidden', !debeMostrar);
  elements.filtersDrawerBackdrop.setAttribute('aria-hidden', debeMostrar ? 'false' : 'true');
  elements.historyFilters.setAttribute('aria-hidden', debeMostrar ? 'false' : 'true');
  if (elements.openFiltersDrawerButton) {
    elements.openFiltersDrawerButton.setAttribute('aria-expanded', debeMostrar ? 'true' : 'false');
  }
  document.body.classList.toggle('has-mobile-drawer-open', debeMostrar && window.innerWidth <= 720);
}

function contarAdministradores(users) {
  return users.filter((user) => esRolAdministrativo(user.rol)).length;
}

function eliminarUsuario(usernameKey) {
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede eliminar usuarios.');
    return;
  }

  const users = obtenerUsuariosGuardados();
  const user = users.find((item) => item.usernameKey === usernameKey);
  if (!user) return;

  if (esRolAdministrativo(user.rol) && contarAdministradores(users) === 1) {
    alert('Debe permanecer al menos un usuario con permisos de administración.');
    return;
  }

  const sesionActual = obtenerSesionActual();
  if (sesionActual && sesionActual.usernameKey === usernameKey) {
    alert('No puedes eliminar la cuenta con la que estás conectado.');
    return;
  }

  if (!window.confirm(`Se eliminará la cuenta de ${user.username}. ¿Deseas continuar?`)) return;

  guardarUsuarios(users.filter((item) => item.usernameKey !== usernameKey));
  renderizarTodo();
}

function eliminarMovimiento(index) {
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede eliminar movimientos.');
    return;
  }

  const data = obtenerEstadoGuardado();
  const movimiento = data.historial[index];
  if (!movimiento) return;

  if (!window.confirm(`Se eliminará el movimiento de ${movimiento.nombre} del ${movimiento.fechaTexto}. ¿Deseas continuar?`)) return;

  data.historial.splice(index, 1);
  data.ultimoIngreso = obtenerUltimoMovimiento(data.historial, 'ingreso');
  data.ultimaSalida = obtenerUltimoMovimiento(data.historial, 'salida');
  guardarEstado(data);
  renderizarTodo();
}

function descomponerClaveDisciplina(valor) {
  const [usernameKey = '', disciplineIndex = ''] = String(valor || '').split('::');
  return {
    usernameKey,
    disciplineIndex: Number(disciplineIndex)
  };
}

function obtenerRegistroDisciplinario(usernameKey, disciplineIndex) {
  const users = obtenerUsuariosGuardados();
  const userIndex = users.findIndex((item) => item.usernameKey === usernameKey);
  if (userIndex === -1) return null;

  const historialDisciplinario = Array.isArray(users[userIndex].historialDisciplinario)
    ? users[userIndex].historialDisciplinario
    : [];
  const entry = historialDisciplinario[disciplineIndex];

  if (!entry) return null;

  return {
    users,
    userIndex,
    user: users[userIndex],
    historialDisciplinario,
    entry
  };
}

function eliminarRegistroDisciplinario(usernameKey, disciplineIndex) {
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede eliminar registros disciplinarios.');
    return;
  }

  const resultado = obtenerRegistroDisciplinario(usernameKey, disciplineIndex);
  if (!resultado) return;

  const { users, userIndex, user, historialDisciplinario, entry } = resultado;
  if (!window.confirm(`Se eliminará la ${entry.tipo} de ${user.username} del ${entry.fechaTexto}. ¿Deseas continuar?`)) return;

  const historialActualizado = historialDisciplinario.filter((_, index) => index !== disciplineIndex);
  users[userIndex] = normalizarUsuario({
    ...user,
    historialDisciplinario: historialActualizado
  });
  guardarUsuarios(users);

  const sesionActual = obtenerSesionActual();
  if (sesionActual && sesionActual.usernameKey === user.usernameKey) {
    guardarSesionActual(users[userIndex]);
  }

  renderizarTodo();
}

function crearUsuarioDesdePanel(event) {
  event.preventDefault();
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede registrar usuarios.');
    return;
  }

  const elements = obtenerElementos();
  const username = elements.adminCreateUsername ? elements.adminCreateUsername.value.trim() : '';
  const password = elements.adminCreatePassword ? elements.adminCreatePassword.value.trim() : '';
  const rol = elements.adminCreateRole ? elements.adminCreateRole.value : 'empleado';
  const observacionUsuario = elements.adminCreateObservation ? elements.adminCreateObservation.value.trim() : '';

  if (username.length < 3) {
    if (elements.adminUsersStatus) elements.adminUsersStatus.textContent = 'El usuario debe tener al menos 3 caracteres.';
    return;
  }

  if (password.length < 4) {
    if (elements.adminUsersStatus) elements.adminUsersStatus.textContent = 'La contraseña debe tener al menos 4 caracteres.';
    return;
  }

  const users = obtenerUsuariosGuardados();
  const usernameKey = normalizarUsername(username);
  if (users.some((item) => item.usernameKey === usernameKey)) {
    if (elements.adminUsersStatus) elements.adminUsersStatus.textContent = 'Ese usuario ya existe.';
    return;
  }

  users.push(normalizarUsuario({
    username,
    usernameKey,
    password,
    rol: normalizarRolGestionable(rol),
    observacionUsuario,
    advertencias: 0,
    sanciones: 0,
    historialDisciplinario: []
  }));
  guardarUsuarios(users);

  if (elements.adminCreateUserForm) elements.adminCreateUserForm.reset();
  if (elements.adminCreateRole) elements.adminCreateRole.value = 'empleado';
  if (elements.adminUsersStatus) elements.adminUsersStatus.textContent = `Usuario ${username} creado correctamente.`;
  renderizarTodo();
}

function abrirEditorUsuario(usernameKey) {
  if (!usuarioEsAdmin()) return;
  const user = obtenerUsuarioPorUsernameKey(usernameKey);
  const elements = obtenerElementos();
  if (!user || !elements.userModal) return;

  if (elements.editUserKey) elements.editUserKey.value = user.usernameKey;
  if (elements.editUserUsername) elements.editUserUsername.value = user.username;
  if (elements.editUserRole) elements.editUserRole.value = user.rol;
  if (elements.editUserPassword) elements.editUserPassword.value = user.password;
  if (elements.editUserWarnings) elements.editUserWarnings.value = String(user.advertencias || 0);
  if (elements.editUserSanctions) elements.editUserSanctions.value = String(user.sanciones || 0);
  if (elements.editWarningReason) elements.editWarningReason.value = '';
  if (elements.editSanctionReason) elements.editSanctionReason.value = '';
  if (elements.editUserObservation) elements.editUserObservation.value = user.observacionUsuario || '';
  alternarEditorDisciplinario(elements, null);
  renderizarHistorialDisciplinarioUsuario(user, elements);
  if (elements.editUserStatus) elements.editUserStatus.textContent = `Editando la cuenta de ${user.username}.`;

  alternarModal(elements, 'userModal', true);
}

function guardarEdicionUsuario(event) {
  event.preventDefault();
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede editar usuarios.');
    return;
  }

  const elements = obtenerElementos();
  const usernameKey = elements.editUserKey ? elements.editUserKey.value : '';
  const users = obtenerUsuariosGuardados();
  const index = users.findIndex((item) => item.usernameKey === usernameKey);

  if (index === -1) {
    if (elements.editUserStatus) elements.editUserStatus.textContent = 'No se encontró el usuario seleccionado.';
    return;
  }

  const nuevoRol = elements.editUserRole ? normalizarRolGestionable(elements.editUserRole.value, users[index].rol) : users[index].rol;
  const nuevaClave = elements.editUserPassword ? elements.editUserPassword.value.trim() : users[index].password;
  const warningReason = elements.editWarningReason ? elements.editWarningReason.value.trim() : '';
  const sanctionReason = elements.editSanctionReason ? elements.editSanctionReason.value.trim() : '';
  const nuevaObservacion = elements.editUserObservation ? elements.editUserObservation.value.trim() : '';

  if (nuevaClave.length < 4) {
    if (elements.editUserStatus) elements.editUserStatus.textContent = 'La contraseña debe tener al menos 4 caracteres.';
    return;
  }

  if (esRolAdministrativo(users[index].rol) && !esRolAdministrativo(nuevoRol) && contarAdministradores(users) === 1) {
    if (elements.editUserStatus) elements.editUserStatus.textContent = 'Debe permanecer al menos un usuario con permisos de administración.';
    return;
  }

  const historialDisciplinario = Array.isArray(users[index].historialDisciplinario)
    ? [...users[index].historialDisciplinario]
    : [];

  if (warningReason) {
    historialDisciplinario.unshift(normalizarRegistroDisciplinario({
      tipo: 'advertencia',
      motivo: warningReason,
      asignadoPorUsername: obtenerSesionActual() ? obtenerSesionActual().username : 'Administrador',
      asignadoPorUsernameKey: obtenerSesionActual() ? obtenerSesionActual().usernameKey : 'gabriel'
    }));
  }

  if (sanctionReason) {
    historialDisciplinario.unshift(normalizarRegistroDisciplinario({
      tipo: 'sancion',
      motivo: sanctionReason,
      asignadoPorUsername: obtenerSesionActual() ? obtenerSesionActual().username : 'Administrador',
      asignadoPorUsernameKey: obtenerSesionActual() ? obtenerSesionActual().usernameKey : 'gabriel'
    }));
  }

  users[index] = normalizarUsuario({
    ...users[index],
    rol: nuevoRol,
    password: nuevaClave,
    observacionUsuario: nuevaObservacion,
    historialDisciplinario
  });
  guardarUsuarios(users);

  const sesionActual = obtenerSesionActual();
  if (sesionActual && sesionActual.usernameKey === users[index].usernameKey) {
    guardarSesionActual(users[index]);
  }

  if (elements.editUserStatus) elements.editUserStatus.textContent = 'Usuario actualizado correctamente.';
  alternarModal(elements, 'userModal', false);
  renderizarTodo();
}

function abrirEditorHistorial(index) {
  if (!usuarioEsAdmin()) return;
  const data = obtenerEstadoGuardado();
  const item = data.historial[index];
  const elements = obtenerElementos();
  if (!item || !elements.historyModal) return;

  renderizarOpcionesTipoEdicion(elements, item.rolPersona, item.tipo);
  renderizarOpcionesIncidenciaEdicion(elements, item.rolPersona, item.incidencia);
  if (elements.editHistoryIndex) elements.editHistoryIndex.value = String(index);
  if (elements.editHistoryDate) elements.editHistoryDate.value = item.fechaTexto;
  if (elements.editHistoryType) elements.editHistoryType.value = item.tipo;
  if (elements.editHistoryName) elements.editHistoryName.value = item.nombre;
  if (elements.editHistoryRole) elements.editHistoryRole.value = obtenerEtiqueta(LABELS_ROL, item.rolPersona);
  if (elements.editHistoryDuration) elements.editHistoryDuration.value = obtenerTextoDuracionJornada(item);
  if (elements.editHistoryIncidencia) elements.editHistoryIncidencia.value = item.incidencia;
  if (elements.editHistoryObservation) elements.editHistoryObservation.value = item.observacion || '';
  if (elements.editHistoryStatus) elements.editHistoryStatus.textContent = 'Edita los campos necesarios y guarda.';

  alternarModal(elements, 'historyModal', true);
}

function abrirEditorDisciplina(usernameKey, disciplineIndex) {
  if (!usuarioEsAdmin()) return;

  const resultado = obtenerRegistroDisciplinario(usernameKey, disciplineIndex);
  const elements = obtenerElementos();
  if (!resultado || !elements.disciplineModal) return;

  const { user, entry } = resultado;
  if (elements.editDisciplineUserKey) elements.editDisciplineUserKey.value = user.usernameKey;
  if (elements.editDisciplineIndex) elements.editDisciplineIndex.value = String(disciplineIndex);
  if (elements.editDisciplineDate) elements.editDisciplineDate.value = entry.fechaTexto;
  if (elements.editDisciplineName) elements.editDisciplineName.value = user.username;
  if (elements.editDisciplineType) elements.editDisciplineType.value = entry.tipo;
  if (elements.editDisciplineAssignedBy) elements.editDisciplineAssignedBy.value = entry.asignadoPorUsername || 'Administrador';
  if (elements.editDisciplineReason) elements.editDisciplineReason.value = entry.motivo || '';
  if (elements.editDisciplineStatus) elements.editDisciplineStatus.textContent = 'Edita el registro disciplinario y guarda.';

  alternarModal(elements, 'disciplineModal', true);
}

function guardarEdicionHistorial(event) {
  event.preventDefault();
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede editar el historial.');
    return;
  }

  const elements = obtenerElementos();
  const index = Number(elements.editHistoryIndex ? elements.editHistoryIndex.value : -1);
  const data = obtenerEstadoGuardado();
  const actual = data.historial[index];

  if (!actual) {
    if (elements.editHistoryStatus) elements.editHistoryStatus.textContent = 'No se encontró el movimiento seleccionado.';
    return;
  }

  const nombre = elements.editHistoryName ? elements.editHistoryName.value.trim() : '';
  if (!nombre) {
    if (elements.editHistoryStatus) elements.editHistoryStatus.textContent = 'El nombre no puede quedar vacío.';
    return;
  }

  data.historial[index] = normalizarMovimiento({
    ...actual,
    tipo: actual.rolPersona === 'proveedor'
      ? 'registro_proveedor'
      : elements.editHistoryType ? elements.editHistoryType.value : actual.tipo,
    nombre,
    rolPersona: actual.rolPersona,
    incidencia: elements.editHistoryIncidencia
      ? normalizarIncidencia(elements.editHistoryIncidencia.value, actual.rolPersona)
      : actual.incidencia,
    observacion: elements.editHistoryObservation ? elements.editHistoryObservation.value.trim() : actual.observacion,
    fechaISO: actual.fechaISO,
    fechaTexto: actual.fechaTexto,
    fechaDia: actual.fechaDia
  });

  data.historial = recalcularMetadatosHistorial(data.historial);
  data.ultimoIngreso = obtenerUltimoMovimiento(data.historial, 'ingreso');
  data.ultimaSalida = obtenerUltimoMovimiento(data.historial, 'salida');
  guardarEstado(data);

  if (elements.editHistoryStatus) elements.editHistoryStatus.textContent = 'Movimiento actualizado correctamente.';
  alternarModal(elements, 'historyModal', false);
  renderizarTodo();
}

function guardarEdicionDisciplina(event) {
  event.preventDefault();
  if (!usuarioEsAdmin()) {
    alert('Solo un administrador puede editar registros disciplinarios.');
    return;
  }

  const elements = obtenerElementos();
  const usernameKey = elements.editDisciplineUserKey ? elements.editDisciplineUserKey.value : '';
  const disciplineIndex = Number(elements.editDisciplineIndex ? elements.editDisciplineIndex.value : -1);
  const motivo = elements.editDisciplineReason ? elements.editDisciplineReason.value.trim() : '';

  if (!motivo) {
    if (elements.editDisciplineStatus) elements.editDisciplineStatus.textContent = 'El motivo no puede quedar vacío.';
    return;
  }

  const resultado = obtenerRegistroDisciplinario(usernameKey, disciplineIndex);
  if (!resultado) {
    if (elements.editDisciplineStatus) elements.editDisciplineStatus.textContent = 'No se encontró el registro disciplinario seleccionado.';
    return;
  }

  const { users, userIndex, user, historialDisciplinario, entry } = resultado;
  const historialActualizado = historialDisciplinario.slice();
  historialActualizado[disciplineIndex] = normalizarRegistroDisciplinario({
    ...entry,
    tipo: elements.editDisciplineType ? elements.editDisciplineType.value : entry.tipo,
    motivo,
    fechaISO: entry.fechaISO,
    fechaTexto: entry.fechaTexto,
    asignadoPorUsername: entry.asignadoPorUsername,
    asignadoPorUsernameKey: entry.asignadoPorUsernameKey
  });

  users[userIndex] = normalizarUsuario({
    ...user,
    historialDisciplinario: historialActualizado
  });
  guardarUsuarios(users);

  const sesionActual = obtenerSesionActual();
  if (sesionActual && sesionActual.usernameKey === user.usernameKey) {
    guardarSesionActual(users[userIndex]);
  }

  if (elements.editDisciplineStatus) elements.editDisciplineStatus.textContent = 'Registro disciplinario actualizado correctamente.';
  alternarModal(elements, 'disciplineModal', false);
  renderizarTodo();
}

function limpiarFiltros() {
  const elements = obtenerElementos();
  const usuarioActual = obtenerUsuarioActualCompleto();
  const filtrosIniciales = crearFiltrosIniciales();
  aplicarFiltrosEnFormulario(elements, filtrosIniciales, usuarioActual);
  guardarFiltrosUsuario(usuarioActual, filtrosIniciales);
  if (window.innerWidth <= 720) alternarDrawerFiltros(elements, false);
  renderizarTodo();
}

function actualizarReloj() {
  const ahora = new Date();
  const elements = obtenerElementos();
  if (elements.liveClock) {
    elements.liveClock.textContent = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  if (elements.liveDate) elements.liveDate.textContent = formatoFechaLarga(ahora);

  const usuarioActual = obtenerUsuarioActualCompleto();
  if (usuarioActual) {
    renderizarContadorTiempo(obtenerEstadoGuardado(), elements, usuarioActual, ahora);
  } else if (elements.contadorPanel) {
    elements.contadorPanel.classList.add('is-hidden');
  }
}

function inicializarValoresBase() {
  const elements = obtenerElementos();
  const hoy = obtenerClaveFecha(new Date());
  if (elements.filtroFecha && !elements.filtroFecha.value) elements.filtroFecha.value = hoy;
}

function iniciarSesion(event) {
  event.preventDefault();
  const elements = obtenerElementos();
  const username = elements.loginNombre ? elements.loginNombre.value.trim() : '';
  const password = elements.loginPassword ? elements.loginPassword.value : '';
  const users = obtenerUsuariosGuardados();
  const user = users.find((item) => item.usernameKey === normalizarUsername(username) && item.password === password);

  actualizarDraftsAuth();

  if (!user) {
    fijarVistaAuth('login');
    if (elements.loginStatus) elements.loginStatus.textContent = 'Usuario o contraseña incorrectos.';
    return;
  }

  guardarSesionActual(user);
  limpiarDraftsAuth('login');
  fijarVistaAuth('login');
  if (elements.loginStatus) elements.loginStatus.textContent = `Bienvenido, ${user.username}.`;
  renderizarTodo();
}

function cerrarSesion() {
  cerrarSesionActual();
  alternarPanelClave(false);
  renderizarTodo();
}

function registrarEventos() {
  const elements = obtenerElementos();

  [
    elements.loginNombre,
    elements.loginPassword,
    elements.registerNombre,
    elements.registerPassword,
    elements.registerRol
  ].filter(Boolean).forEach((element) => {
    element.addEventListener('input', actualizarDraftsAuth);
    element.addEventListener('change', actualizarDraftsAuth);
  });

  [
    elements.filtroNombre,
    elements.filtroPeriodo,
    elements.filtroFecha,
    elements.filtroRol,
    elements.filtroIncidencia
  ].filter(Boolean).forEach((element) => {
    const manejarCambioFiltros = () => {
      guardarFiltrosUsuario(obtenerUsuarioActualCompleto(), obtenerFiltros(obtenerElementos()));
      renderizarTodo();
    };
    element.addEventListener('input', manejarCambioFiltros);
    element.addEventListener('change', manejarCambioFiltros);
  });

  if (elements.loginForm) elements.loginForm.addEventListener('submit', iniciarSesion);
  if (elements.logoutButton) elements.logoutButton.addEventListener('click', cerrarSesion);
  if (elements.showLogin) elements.showLogin.addEventListener('click', () => fijarVistaAuth('login'));
  if (elements.showRegister) elements.showRegister.addEventListener('click', () => fijarVistaAuth('register'));
  if (elements.adminCreateUserForm) elements.adminCreateUserForm.addEventListener('submit', crearUsuarioDesdePanel);
  if (elements.editUserForm) elements.editUserForm.addEventListener('submit', guardarEdicionUsuario);
  if (elements.editHistoryForm) elements.editHistoryForm.addEventListener('submit', guardarEdicionHistorial);
  if (elements.editDisciplineForm) elements.editDisciplineForm.addEventListener('submit', guardarEdicionDisciplina);
  if (elements.showWarningEditorButton) elements.showWarningEditorButton.addEventListener('click', () => alternarEditorDisciplinario(elements, 'advertencia'));
  if (elements.showSanctionEditorButton) elements.showSanctionEditorButton.addEventListener('click', () => alternarEditorDisciplinario(elements, 'sancion'));
  if (elements.showObservationEditorButton) elements.showObservationEditorButton.addEventListener('click', () => alternarEditorDisciplinario(elements, 'observacion'));
  if (elements.togglePasswordPanelButton) elements.togglePasswordPanelButton.addEventListener('click', () => alternarPanelClave());
  if (elements.cancelPasswordPanelButton) elements.cancelPasswordPanelButton.addEventListener('click', () => alternarPanelClave(false));
  if (elements.changePasswordForm) elements.changePasswordForm.addEventListener('submit', cambiarClaveCuenta);
  if (elements.closePasswordModalButton) elements.closePasswordModalButton.addEventListener('click', () => alternarPanelClave(false));
  if (elements.closeUserModalButton) elements.closeUserModalButton.addEventListener('click', () => alternarModal(elements, 'userModal', false));
  if (elements.cancelUserModalButton) elements.cancelUserModalButton.addEventListener('click', () => alternarModal(elements, 'userModal', false));
  if (elements.closeHistoryModalButton) elements.closeHistoryModalButton.addEventListener('click', () => alternarModal(elements, 'historyModal', false));
  if (elements.cancelHistoryModalButton) elements.cancelHistoryModalButton.addEventListener('click', () => alternarModal(elements, 'historyModal', false));
  if (elements.closeDisciplineModalButton) elements.closeDisciplineModalButton.addEventListener('click', () => alternarModal(elements, 'disciplineModal', false));
  if (elements.cancelDisciplineModalButton) elements.cancelDisciplineModalButton.addEventListener('click', () => alternarModal(elements, 'disciplineModal', false));
  if (elements.openFiltersDrawerButton) elements.openFiltersDrawerButton.addEventListener('click', () => alternarDrawerFiltros(elements));
  if (elements.closeFiltersDrawerButton) elements.closeFiltersDrawerButton.addEventListener('click', () => alternarDrawerFiltros(elements, false));
  if (elements.filtersDrawerBackdrop) elements.filtersDrawerBackdrop.addEventListener('click', () => alternarDrawerFiltros(elements, false));
  document.addEventListener('click', (event) => {
    if (!elements.historyFilters || !elements.historyFilters.classList.contains('is-open')) return;
    const dentroDelPanel = event.target instanceof Element && event.target.closest('#historyFilters');
    const dentroDelBoton = event.target instanceof Element && event.target.closest('#openFiltersDrawer');
    if (!dentroDelPanel && !dentroDelBoton) {
      alternarDrawerFiltros(elements, false);
    }
  });
  document.addEventListener('touchstart', (event) => {
    if (!elements.historyFilters || !elements.historyFilters.classList.contains('is-open')) return;
    const dentroDelPanel = event.target instanceof Element && event.target.closest('#historyFilters');
    const dentroDelBoton = event.target instanceof Element && event.target.closest('#openFiltersDrawer');
    if (!dentroDelPanel && !dentroDelBoton) {
      alternarDrawerFiltros(elements, false);
    }
  }, { passive: true });
  if (elements.passwordModal) {
    elements.passwordModal.addEventListener('click', (event) => {
      if (event.target === elements.passwordModal) alternarPanelClave(false);
    });
  }
  if (elements.userModal) {
    elements.userModal.addEventListener('click', (event) => {
      if (event.target === elements.userModal) alternarModal(elements, 'userModal', false);
    });
  }
  if (elements.historyModal) {
    elements.historyModal.addEventListener('click', (event) => {
      if (event.target === elements.historyModal) alternarModal(elements, 'historyModal', false);
    });
  }
  if (elements.disciplineModal) {
    elements.disciplineModal.addEventListener('click', (event) => {
      if (event.target === elements.disciplineModal) alternarModal(elements, 'disciplineModal', false);
    });
  }
  if (elements.usersBody) {
    elements.usersBody.addEventListener('click', (event) => {
      const botonEditar = event.target.closest('[data-edit-user]');
      if (botonEditar) {
        abrirEditorUsuario(botonEditar.getAttribute('data-edit-user'));
        return;
      }

      const botonEliminar = event.target.closest('[data-delete-user]');
      if (botonEliminar) {
        eliminarUsuario(botonEliminar.getAttribute('data-delete-user'));
      }
    });
  }
  if (elements.historialBody) {
    elements.historialBody.addEventListener('click', (event) => {
      const botonEditarDisciplina = event.target.closest('[data-edit-discipline]');
      if (botonEditarDisciplina) {
        const { usernameKey, disciplineIndex } = descomponerClaveDisciplina(botonEditarDisciplina.getAttribute('data-edit-discipline'));
        abrirEditorDisciplina(usernameKey, disciplineIndex);
        return;
      }

      const botonEliminarDisciplina = event.target.closest('[data-delete-discipline]');
      if (botonEliminarDisciplina) {
        const { usernameKey, disciplineIndex } = descomponerClaveDisciplina(botonEliminarDisciplina.getAttribute('data-delete-discipline'));
        eliminarRegistroDisciplinario(usernameKey, disciplineIndex);
        return;
      }

      const botonEditar = event.target.closest('[data-edit-history]');
      if (botonEditar) {
        abrirEditorHistorial(Number(botonEditar.getAttribute('data-edit-history')));
        return;
      }

      const botonEliminar = event.target.closest('[data-delete-history]');
      if (botonEliminar) {
        eliminarMovimiento(Number(botonEliminar.getAttribute('data-delete-history')));
      }
    });
  }

  const botonIngreso = document.getElementById('ingreso');
  const botonSalida = document.getElementById('salida');
  const botonGuardarProveedor = document.getElementById('guardarProveedor');
  const botonLimpiar = document.getElementById('limpiarHistorial');
  const botonExportar = document.getElementById('exportarCsv');
  const botonLimpiarFiltros = document.getElementById('limpiarFiltros');

  if (botonIngreso) botonIngreso.addEventListener('click', () => registrarMovimiento('ingreso'));
  if (botonSalida) botonSalida.addEventListener('click', () => registrarMovimiento('salida'));
  if (botonGuardarProveedor) botonGuardarProveedor.addEventListener('click', () => registrarMovimiento('ingreso'));
  if (botonLimpiar) botonLimpiar.addEventListener('click', limpiarHistorial);
  if (botonExportar) botonExportar.addEventListener('click', exportarCsv);
  if (botonLimpiarFiltros) botonLimpiarFiltros.addEventListener('click', limpiarFiltros);
}

document.addEventListener('DOMContentLoaded', async () => {
  migrarRegistroLegacy();
  asegurarUsuarioAdminInicial();
  migrarUsuarioInicialAGabriel();
  await inicializarPersistenciaCompartida();
  iniciarVigilanciaPersistenciaCompartida();
  inicializarValoresBase();
  registrarEventos();
  renderizarTodo();
  actualizarReloj();
  window.setInterval(actualizarReloj, 1000);
});