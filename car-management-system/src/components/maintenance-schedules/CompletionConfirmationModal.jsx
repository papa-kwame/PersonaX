import React from 'react';

const CompletionConfirmationModal = ({
  showCompleteConfirm,
  setShowCompleteConfirm,
  handleCompleteWithInvoice,
  loading
}) => {
  if (!showCompleteConfirm) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(30, 41, 59, 0.18)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.25s',
    }}>
      <div style={{
        minWidth: 340,
        maxWidth: 420,
        width: '90vw',
        background: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        boxShadow: '0 8px 40px rgba(37,99,235,0.13)',
        padding: '2.2rem 2.2rem 1.5rem 2.2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        border: '1.5px solid #e0eaff',
        position: 'relative',
        animation: 'scaleIn 0.22s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 32, color: '#fbbf24', filter: 'drop-shadow(0 2px 8px #fbbf2433)' }}>⚠️</span>
          <span style={{ fontWeight: 900, fontSize: 23, color: '#222', letterSpacing: 0.2 }}>Are you sure?</span>
        </div>
        
        <div style={{ fontSize: 17, color: '#374151', marginBottom: 28, textAlign: 'center', fontWeight: 500 }}>
          Are you sure you have completed all necessary work on this vehicle?
        </div>
        
        <div style={{ display: 'flex', gap: 18, justifyContent: 'flex-end', width: '100%' }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: '1.5px solid #2563eb',
              color: '#2563eb',
              fontWeight: 700,
              borderRadius: 8,
              padding: '0.7rem 1.6rem',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
              boxShadow: '0 1px 6px rgba(37,99,235,0.06)',
            }}
            onClick={() => setShowCompleteConfirm(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              background: 'linear-gradient(90deg, #2563eb 60%, #60a5fa 100%)',
              color: '#fff',
              fontWeight: 800,
              border: 'none',
              borderRadius: 8,
              padding: '0.7rem 1.8rem',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(37,99,235,0.13)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.18s, box-shadow 0.18s',
            }}
            onClick={() => {
              setShowCompleteConfirm(false);
              handleCompleteWithInvoice();
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ fontSize: 18, marginRight: 6 }}>⏳</span> Processing...
              </>
            ) : (
              <>
                Yes, Complete
              </>
            )}
          </button>
        </div>
        
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { transform: scale(0.95); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
          button:active { transform: scale(0.97); }
          button:focus { outline: 2px solid #2563eb33; }
        `}</style>
      </div>
    </div>
  );
};

export default CompletionConfirmationModal;














