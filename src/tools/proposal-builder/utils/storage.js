const STORAGE_KEY = 'skynet_proposals';

export const saveProposal = (proposal) => {
  const proposals = getProposals();
  const existingIndex = proposals.findIndex((p) => p.id === proposal.id);
  const updated = { ...proposal, updatedAt: new Date().toISOString() };

  if (existingIndex >= 0) {
    proposals[existingIndex] = updated;
  } else {
    proposals.unshift(updated);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  return updated;
};

export const getProposals = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getProposal = (id) => {
  const proposals = getProposals();
  return proposals.find((p) => p.id === id) || null;
};

export const deleteProposal = (id) => {
  const proposals = getProposals().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
};
