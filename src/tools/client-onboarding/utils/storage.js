import { v4 as uuidv4 } from 'uuid';

const CLIENTS_KEY = 'skynet_onboarding_clients';
const TEMPLATES_KEY = 'skynet_onboarding_templates';
const AGENCY_KEY = 'skynet_agency_info';

export function getClients() {
  try {
    return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getClient(id) {
  return getClients().find(c => c.id === id) || null;
}

export function saveClient(client) {
  const clients = getClients();
  const idx = clients.findIndex(c => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = { ...clients[idx], ...client, updatedAt: new Date().toISOString() };
  } else {
    clients.push({
      ...client,
      id: client.id || uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: client.status || 'pending',
    });
  }
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients to localStorage:', e);
  }
  return clients;
}

export function deleteClient(id) {
  const clients = getClients().filter(c => c.id !== id);
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  } catch (e) {
    console.error('Failed to save clients to localStorage:', e);
  }
  return clients;
}

export function getTemplates() {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveTemplate(template) {
  const templates = getTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    templates.push({ ...template, id: template.id || uuidv4(), createdAt: new Date().toISOString() });
  }
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
  return templates;
}

export function deleteTemplate(id) {
  const templates = getTemplates().filter(t => t.id !== id);
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
  return templates;
}

export function getAgencyInfo() {
  try {
    return JSON.parse(localStorage.getItem(AGENCY_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveAgencyInfo(info) {
  try {
    localStorage.setItem(AGENCY_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save agency info to localStorage:', e);
  }
}

export function calculateCompletion(clientData, sections) {
  if (!clientData || !sections || sections.length === 0) return 0;
  let filled = 0;
  let total = 0;

  const checkFields = (obj, fields) => {
    fields.forEach(f => {
      total++;
      if (obj && obj[f] && (typeof obj[f] === 'string' ? obj[f].trim() : true)) filled++;
    });
  };

  if (sections.includes('clientInfo')) {
    checkFields(clientData.clientInfo, ['fullName', 'email', 'phone', 'address']);
  }
  if (sections.includes('projectDetails')) {
    checkFields(clientData.projectDetails, ['projectType', 'description', 'targetAudience']);
  }
  if (sections.includes('accessCredentials')) {
    total++;
    if (clientData.accessCredentials && Object.keys(clientData.accessCredentials).length > 0) filled++;
  }
  if (sections.includes('brandAssets')) {
    total++;
    if (clientData.brandAssets && (clientData.brandAssets.colors?.length > 0 || clientData.brandAssets.logos?.length > 0)) filled++;
  }
  if (sections.includes('contentMedia')) {
    checkFields(clientData.contentMedia, ['companyBio']);
  }
  if (sections.includes('nda')) {
    total++;
    if (clientData.nda?.signature) filled++;
  }
  if (sections.includes('serviceAgreement')) {
    total++;
    if (clientData.serviceAgreement?.signature) filled++;
  }
  if (sections.includes('paymentInfo')) {
    checkFields(clientData.paymentInfo, ['paymentMethod', 'billingAddress']);
  }

  return total === 0 ? 0 : Math.round((filled / total) * 100);
}

export function generateShareLink(templateId) {
  return `${window.location.origin}/client-onboarding/onboard/${templateId}`;
}
