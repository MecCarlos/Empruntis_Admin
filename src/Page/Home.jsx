import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Euro, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ArrowUpRight, 
  AlertTriangle,
  Database
} from 'lucide-react';

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!localStorage.getItem('admin_authenticated')) {
      navigate('/login');
      return;
    }

    // Fetch data from local API
    const fetchData = async () => {
      try {
        setError(false);
        const response = await fetch('http://localhost:5000/api/loan-applications');
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            setData(json.data);
          } else {
            setError(true);
            setData([]);
          }
        } else {
          setError(true);
          setData([]);
        }
      } catch (err) {
        console.error('API Offline - DB error:', err);
        setError(true);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Compute metrics
  const totalRequests = data.length;
  const totalAmount = data.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const pendingRequests = data.filter(item => item.status === 'pending').length;
  const approvedRequests = data.filter(item => item.status === 'approved').length;
  const rejectedRequests = data.filter(item => item.status === 'rejected').length;
  
  const approvalRate = totalRequests > 0 
    ? Math.round((approvedRequests / (totalRequests - pendingRequests || 1)) * 100) 
    : 0;

  // Format currency
  const formatEuros = (value) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  };

  // Format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending"><span className="status-dot"></span>En attente</span>;
      case 'approved':
        return <span className="status-badge approved"><span className="status-dot"></span>Approuvé</span>;
      case 'rejected':
        return <span className="status-badge rejected"><span className="status-dot"></span>Rejeté</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="skeleton skeleton-text" style={{ width: '250px', height: '1.8rem' }} />
          <div className="skeleton skeleton-text" style={{ width: '150px', height: '1rem' }} />
        </div>
        <div className="dashboard-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
              <div className="skeleton skeleton-text" style={{ width: '60%' }} />
              <div className="skeleton skeleton-value" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* DB Connection Error Banner */}
      {error && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '1.25rem', 
          backgroundColor: 'hsla(0, 75%, 60%, 0.08)', 
          color: 'var(--color-danger)', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid hsla(0, 75%, 60%, 0.2)',
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          <Database size={20} style={{ flexShrink: 0 }} />
          <div>
            <span style={{ display: 'block', fontWeight: 700 }}>Problème de connexion avec la base de données</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Impossible de récupérer les statistiques du tableau de bord. Veuillez vérifier l'état du serveur backend.
            </span>
          </div>
        </div>
      )}

      {/* Greetings banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.8px' }}>
            Bonjour admin ! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Voici les indicateurs clés de vos demandes de prêt aujourd'hui.
          </p>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="dashboard-grid">
        <div className="stat-card primary">
          <div className="stat-card-header">
            <span className="stat-title">Demandes Totales</span>
            <div className="stat-icon-wrapper">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{totalRequests}</div>
          <div className="stat-footer">
            <span className="trend-badge up">
              <ArrowUpRight size={14} /> +12%
            </span>
            <span className="trend-text">vs mois dernier</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <span className="stat-title">Volume Financier</span>
            <div className="stat-icon-wrapper">
              <Euro size={20} />
            </div>
          </div>
          <div className="stat-value">{formatEuros(totalAmount)}</div>
          <div className="stat-footer">
            <span className="trend-badge up">
              <ArrowUpRight size={14} /> +8.4%
            </span>
            <span className="trend-text">Montant cumulé</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-header">
            <span className="stat-title">Dossiers en attente</span>
            <div className="stat-icon-wrapper">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{pendingRequests}</div>
          <div className="stat-footer">
            <span className="trend-text">À réviser prioritairement</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <span className="stat-title">Taux d'approbation</span>
            <div className="stat-icon-wrapper">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{approvalRate}%</div>
          <div className="stat-footer">
            <span className="trend-text">Sur dossiers statués</span>
          </div>
        </div>
      </div>

      {/* Main dashboard sections */}
      <div className="dashboard-section">
        {/* Recent Applications table */}
        <div className="section-card">
          <div className="section-card-title">
            <span>Dernières Demandes de Prêt</span>
            <button 
              onClick={() => navigate('/requests')}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--color-primary)', 
                fontWeight: 700, 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              disabled={error}
            >
              <span>Voir tout</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="table-container">
            {error ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Database size={32} style={{ color: 'var(--color-danger)' }} />
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Aucune donnée à afficher</span>
                <span style={{ fontSize: '0.8rem' }}>Vérifiez la connexion avec votre base de données.</span>
              </div>
            ) : data.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Aucune demande récente.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type de Prêt</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 5).map((app) => (
                    <tr key={app.id} onClick={() => navigate('/requests')}>
                      <td style={{ fontWeight: 600 }}>{app.first_name} {app.last_name}</td>
                      <td>{app.loan_type || 'Non spécifié'}</td>
                      <td style={{ fontWeight: 700 }}>{formatEuros(app.amount)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(app.created_at)}</td>
                      <td>{getStatusBadge(app.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick status breakdown graphic */}
        <div className="section-card">
          <div className="section-card-title">Répartition des Statuts</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '1rem 0', gap: '1.5rem' }}>
            
            {/* Visual breakdown ring */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" strokeWidth="4"></circle>
                {/* SVG calculations for clean visualization of percentages */}
                {totalRequests > 0 && !error && (
                  <>
                    {/* Approved ring */}
                    <circle 
                      cx="21" 
                      cy="21" 
                      r="15.915" 
                      fill="transparent" 
                      stroke="var(--color-success)" 
                      strokeWidth="4" 
                      strokeDasharray={`${(approvedRequests/totalRequests)*100} ${100 - (approvedRequests/totalRequests)*100}`} 
                      strokeDashoffset="25"
                    ></circle>
                    {/* Pending ring */}
                    <circle 
                      cx="21" 
                      cy="21" 
                      r="15.915" 
                      fill="transparent" 
                      stroke="var(--color-warning)" 
                      strokeWidth="4" 
                      strokeDasharray={`${(pendingRequests/totalRequests)*100} ${100 - (pendingRequests/totalRequests)*100}`} 
                      strokeDashoffset={25 - ((approvedRequests/totalRequests)*100)}
                    ></circle>
                  </>
                )}
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{error ? 0 : totalRequests}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Dossiers</span>
              </div>
            </div>

            {/* Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
                  Approuvés
                </span>
                <span style={{ fontWeight: 700 }}>{error ? 0 : approvedRequests} ({totalRequests > 0 && !error ? Math.round((approvedRequests/totalRequests)*100) : 0}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></span>
                  En attente
                </span>
                <span style={{ fontWeight: 700 }}>{error ? 0 : pendingRequests} ({totalRequests > 0 && !error ? Math.round((pendingRequests/totalRequests)*100) : 0}%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }}></span>
                  Rejetés
                </span>
                <span style={{ fontWeight: 700 }}>{error ? 0 : rejectedRequests} ({totalRequests > 0 && !error ? Math.round((rejectedRequests/totalRequests)*100) : 0}%)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;