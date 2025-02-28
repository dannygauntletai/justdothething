import React from 'react';
import { useExtensionAuth } from './useExtensionAuth';
import { GoogleLoginButton } from '../../../shared/ui-components/GoogleLoginButton';

const App = () => {
  const { isAuthenticated, user, isLoading, login, logout } = useExtensionAuth();

  if (isLoading) {
    return (
      <div style={{ 
        width: '320px', 
        height: '320px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '50%', 
          borderTop: '2px solid #3b82f6',
          borderRight: '2px solid transparent',
          animation: 'spin 1s linear infinite' 
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        width: '320px', 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          marginBottom: '16px', 
          textAlign: 'center' 
        }}>
          JustDoTheThing.ai
        </h1>
        <p style={{ 
          fontSize: '14px', 
          marginBottom: '24px', 
          textAlign: 'center',
          color: '#4b5563' 
        }}>
          Sign in to boost your productivity
        </p>
        
        <div style={{ width: '100%' }}>
          <GoogleLoginButton onSuccess={() => {}} buttonText="Sign in with Google" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '320px', 
      padding: '24px', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          overflow: 'hidden',
          marginRight: '12px',
          backgroundColor: '#f3f4f6'
        }}>
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata.full_name || 'User'} 
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: '#9ca3af',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            marginBottom: '4px' 
          }}>
            {user?.user_metadata?.full_name || user?.email || 'User'}
          </h2>
          <p style={{ 
            fontSize: '12px', 
            color: '#4b5563' 
          }}>
            {user?.email}
          </p>
        </div>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold' }}>Productivity Modes</h3>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <span style={{ fontSize: '14px' }}>Yell Mode</span>
          <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '44px', 
            height: '24px' 
          }}>
            <input 
              type="checkbox" 
              style={{ 
                opacity: 0, 
                width: 0, 
                height: 0 
              }} 
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#e5e7eb',
              borderRadius: '12px',
              transition: '0.4s'
            }}></span>
          </label>
        </div>
      </div>
      
      <button
        onClick={logout}
        style={{ 
          backgroundColor: '#ef4444', 
          color: 'white', 
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'medium',
          cursor: 'pointer'
        }}
      >
        Sign out
      </button>
    </div>
  );
};

export default App;
