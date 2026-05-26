import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Percent, 
  DollarSign, 
  ShieldAlert, 
  Save, 
  CheckCircle,
  Bell
} from 'lucide-react';

function Settings() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  // Form states
  const [interestRate, setInterestRate] = useState(3.45);
  const [commissionFee, setCommissionFee] = useState(150);
  const [adminName, setAdminName] = useState('Charbel Quenum');
  const [adminEmail, setAdminEmail] = useState('admin@empruntis.com');
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      
      {success && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '1rem', 
          backgroundColor: 'var(--color-success-light)', 
          color: 'var(--color-success)', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid hsla(var(--hue-success), 70%, 45%, 0.2)',
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          <CheckCircle size={18} />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      <form className="section-card" onSubmit={handleSave} style={{ gap: '1.75rem' }}>
        
        {/* Section: Simulator settings */}
        <div>
          <h3 className="settings-section-title" style={{ marginTop: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SettingsIcon size={18} /> Configuration du Simulateur de Prêt
            </span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem 0' }}>
            Ajustez les valeurs par défaut présentées sur le site vitrine d'Empruntis.
          </p>

          <div className="settings-row">
            <div className="form-group">
              <label htmlFor="rate">Taux d'intérêt annuel par défaut (%)</label>
              <div className="input-wrapper">
                <Percent className="input-icon" size={16} />
                <input
                  type="number"
                  id="rate"
                  step="0.01"
                  min="0.1"
                  max="15"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fee">Frais de dossier par défaut (€)</label>
              <div className="input-wrapper">
                <DollarSign className="input-icon" size={16} />
                <input
                  type="number"
                  id="fee"
                  step="5"
                  min="0"
                  max="1000"
                  value={commissionFee}
                  onChange={(e) => setCommissionFee(parseInt(e.target.value))}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Profile info */}
        <div>
          <h3 className="settings-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} /> Profil Administrateur
            </span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.25rem 0' }}>
            Mettez à jour vos informations d'identité et de contact pour les signatures.
          </p>

          <div className="settings-row">
            <div className="form-group">
              <label htmlFor="name">Nom Complet</label>
              <div className="input-wrapper">
                <User className="input-icon" size={16} />
                <input
                  type="text"
                  id="name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Administratif</label>
              <div className="input-wrapper">
                <User className="input-icon" size={16} />
                <input
                  type="email"
                  id="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: System & alerts */}
        <div>
          <h3 className="settings-section-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} /> Notifications & Système
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem' }}>
              <input
                type="checkbox"
                checked={receiveNotifications}
                onChange={(e) => setReceiveNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Recevoir une alerte email lors de chaque nouvelle demande de prêt vitrine</span>
            </label>
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              padding: '1rem', 
              backgroundColor: 'hsla(0, 75%, 60%, 0.06)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsla(0, 75%, 60%, 0.15)',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              alignItems: 'flex-start',
              marginTop: '0.5rem'
            }}>
              <ShieldAlert size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>Accès sécurisé obligatoire</span>
                <span style={{ color: 'var(--text-muted)' }}>Ce compte bénéficie des accès en écriture sur les tables financières Supabase. Toute action d'approbation est enregistrée et auditée dans les journaux d'accès.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn-submit" style={{ padding: '0.75rem 2rem' }}>
            <Save size={16} />
            <span>Sauvegarder</span>
          </button>
        </div>

      </form>
    </div>
  );
}

export default Settings;
