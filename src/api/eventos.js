import instanceAxios from "./axios.js";

export const getEventosRequest = () => instanceAxios.get("/eventos");

export const createEventoRequest = (payload) =>
  instanceAxios.post("/eventos", payload);

export const getEventoDetalleRequest = (id) =>
  instanceAxios.get(`/eventos/${id}`);

export const updateEventoRequest = (id, payload) =>
  instanceAxios.put(`/eventos/${id}`, payload);

export const duplicarEventoRequest = (id) =>
  instanceAxios.post(`/eventos/${id}/duplicar`);

export const cambiarPropietarioRequest = (id, payload) =>
  instanceAxios.post(`/eventos/${id}/propietario`, payload);

export const deleteEventoRequest = (id) =>
  instanceAxios.delete(`/eventos/${id}`);

// Invitados y Difusión
export const addInvitadoRequest = (idEvento, payload) =>
  instanceAxios.post(`/eventos/${idEvento}/invitados`, payload);

export const importarInvitadosRequest = (idEvento, payload) =>
  instanceAxios.post(`/eventos/${idEvento}/invitados/importar`, payload);

export const updateInvitadoRequest = (idEvento, idInvitado, payload) =>
  instanceAxios.put(`/eventos/${idEvento}/invitados/${idInvitado}`, payload);

export const deleteInvitadoRequest = (idEvento, idInvitado) =>
  instanceAxios.delete(`/eventos/${idEvento}/invitados/${idInvitado}`);

export const enviarCorreoIndividualRequest = (
  idEvento,
  idInvitado,
  payload = {}
) =>
  instanceAxios.post(
    `/eventos/${idEvento}/invitados/${idInvitado}/enviar-correo`,
    payload
  );

export const enviarDifusionRequest = (idEvento, payload = {}) =>
  instanceAxios.post(`/eventos/${idEvento}/difusion`, payload);

export const guardarConfigWhatsAppApiRequest = (idEvento, payload = {}) =>
  instanceAxios.put(`/eventos/${idEvento}/whatsapp-config`, payload);

export const listarPlantillasWhatsAppApiRequest = (idEvento, payload = {}) =>
  instanceAxios.post(`/eventos/${idEvento}/whatsapp-plantillas`, payload);

export const enviarWhatsAppIndividualApiRequest = (
  idEvento,
  idInvitado,
  payload = {}
) =>
  instanceAxios.post(
    `/eventos/${idEvento}/invitados/${idInvitado}/enviar-whatsapp`,
    payload
  );

export const enviarRecordatoriosWhatsAppMasivoRequest = (
  idEvento,
  payload = {}
) => instanceAxios.post(`/eventos/${idEvento}/recordatorios-whatsapp`, payload);

// Logística (Mesas / Seating Chart, Cronograma, Tareas)
export const addLogisticaRequest = (idEvento, payload) =>
  instanceAxios.post(`/eventos/${idEvento}/logistica`, payload);

export const updateLogisticaRequest = (idEvento, idItem, payload) =>
  instanceAxios.put(`/eventos/${idEvento}/logistica/${idItem}`, payload);

export const deleteLogisticaRequest = (idEvento, idItem) =>
  instanceAxios.delete(`/eventos/${idEvento}/logistica/${idItem}`);

// Presupuesto
export const addPresupuestoRequest = (idEvento, payload) =>
  instanceAxios.post(`/eventos/${idEvento}/presupuesto`, payload);

export const updatePresupuestoRequest = (idEvento, idGasto, payload) =>
  instanceAxios.put(`/eventos/${idEvento}/presupuesto/${idGasto}`, payload);

export const deletePresupuestoRequest = (idEvento, idGasto) =>
  instanceAxios.delete(`/eventos/${idEvento}/presupuesto/${idGasto}`);

// Invitación Pública y Confirmación RSVP (/rsvp/:id)
export const getInvitacionPublicaRequest = (idEvento, guestToken = "") =>
  instanceAxios.get(
    `/rsvp/${idEvento}${guestToken ? `?guest=${encodeURIComponent(guestToken)}` : ""}`
  );

export const confirmarRsvpPublicoRequest = (idEvento, payload) =>
  instanceAxios.post(`/rsvp/${idEvento}`, payload);

export const getCatalogosEstadosMunicipiosRequest = () =>
  instanceAxios.get("/catalogos/estados-municipios");

// Administración Global de Plataforma (Solo Cuentas Administradoras)
export const getPlatformConfigAdminRequest = () =>
  instanceAxios.get("/admin/config");

export const updatePlatformConfigAdminRequest = (payload = {}) =>
  instanceAxios.put("/admin/config", payload);

export const listarPlantillasPlatformAdminRequest = (payload = {}) =>
  instanceAxios.post("/admin/whatsapp-plantillas", payload);

export const ejecutarVerificacionRecordatoriosAdminRequest = () =>
  instanceAxios.post("/admin/verificar-recordatorios");



