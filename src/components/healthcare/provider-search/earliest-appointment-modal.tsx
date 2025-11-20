import React, { useState, useEffect } from 'react';
import { sendSMS } from '../../../services/smsService';

interface EarliestAppointmentModalProps {
  onClose: () => void;
}

const EarliestAppointmentModal: React.FC<EarliestAppointmentModalProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loader for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      sendSMS("we have received your request for the earliest available appointment, We will contact you shortly");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '24px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          maxHeight: '90vh',
          overflow: 'auto',
          textAlign: 'center'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
          aria-label="Close"
        >
          ×
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Earliest Appointment Request</h2>
        
        {isLoading ? (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
              WebkitAnimation: 'spin 1s linear infinite'
            }} />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @-webkit-keyframes spin {
                  0% { -webkit-transform: rotate(0deg); }
                  100% { -webkit-transform: rotate(360deg); }
                }
              `}
            </style>
            <h3 style={{ margin: '0 0 16px' }}>Processing your request...</h3>
            <p style={{ margin: '0 0 16px', color: '#666' }}>
              Please wait while we find the earliest available appointment.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              backgroundColor: '#4CAF50',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 16px'
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 16px' }}>Request Received!</h3>
            <p style={{ margin: '0 0 16px', color: '#666' }}>
              We have received your request for the earliest available appointment.
            </p>
            <p style={{ margin: '0 0 24px', color: '#666' }}>
              Our team will contact you shortly.
            </p>
          </div>
        )}
        
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#2196f3',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            width: '100%',
            maxWidth: '200px',
            opacity: isLoading ? 0.7 : 1
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default EarliestAppointmentModal;
