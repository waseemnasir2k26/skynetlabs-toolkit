import { createContext, useContext, useReducer, useCallback } from 'react';
import { createEmptyProposal } from '../utils/defaultData';
import { saveProposal as saveToStorage } from '../utils/storage';

const ProposalContext = createContext(null);

const proposalReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROPOSAL':
      return { ...state, proposal: action.payload };
    case 'UPDATE_FIELD':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          [action.section]: {
            ...state.proposal[action.section],
            [action.field]: action.value,
          },
        },
      };
    case 'UPDATE_SECTION':
      return {
        ...state,
        proposal: {
          ...state.proposal,
          [action.section]: action.value,
        },
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_TEMPLATE':
      return {
        ...state,
        proposal: { ...state.proposal, template: action.payload },
      };
    default:
      return state;
  }
};

export const ProposalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(proposalReducer, {
    proposal: createEmptyProposal(),
    currentStep: 0,
  });

  const updateField = useCallback((section, field, value) => {
    dispatch({ type: 'UPDATE_FIELD', section, field, value });
  }, []);

  const updateSection = useCallback((section, value) => {
    dispatch({ type: 'UPDATE_SECTION', section, value });
  }, []);

  const setStep = useCallback((step) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setProposal = useCallback((proposal) => {
    dispatch({ type: 'SET_PROPOSAL', payload: proposal });
  }, []);

  const setTemplate = useCallback((template) => {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  }, []);

  const saveProposal = useCallback(() => {
    const updated = saveToStorage(state.proposal);
    dispatch({ type: 'SET_PROPOSAL', payload: updated });
    return updated;
  }, [state.proposal]);

  return (
    <ProposalContext.Provider
      value={{
        proposal: state.proposal,
        currentStep: state.currentStep,
        updateField,
        updateSection,
        setStep,
        setProposal,
        setTemplate,
        saveProposal,
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposal = () => {
  const context = useContext(ProposalContext);
  if (!context) throw new Error('useProposal must be used within ProposalProvider');
  return context;
};
