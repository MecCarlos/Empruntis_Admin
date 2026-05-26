import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Check, 
  X as CloseIcon, 
  AlertCircle,
  FileText,
  Calendar,
  DollarSign,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  User,
  Database
} from 'lucide-react';

// Configuration de l'API - CENTRALISÉE
const API_BASE_URL = 'https://empruntisserver.vercel.app';

function Applications() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch applications directly from database
  const fetchApplications = async () => {
    try {
      setError(false);
      const response = await fetch(`${API_BASE_URL}/api/loan-applications`);
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
      console.error('Database connection error:', err);
      setError(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('admin_authenticated')) {
      navigate('/login');
      return;
    }
    fetchApplications();
  }, [navigate]);

  // Handle status updates in Supabase via PUT API
  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/loan-applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          // Update client state immediately
          setData(prev => prev.map(item => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item));
          if (selectedApp && selectedApp.id === id) {
            setSelectedApp(prev => ({ ...prev, status }));
          }
        } else {
          alert('Erreur serveur lors de la mise à jour.');
        }
      } else {
        alert('Impossible de joindre le serveur API.');
      }
    } catch (err) {
      console.error('Update status offline error:', err);
      alert('Erreur réseau. Veuillez vérifier que le serveur backend tourne.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter lists
  const filteredData = data.filter((app) => {
    const fullName = `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase();
    const email = (app.email || '').toLowerCase();
    const phone = (app.phone || '').toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || 
                          email.includes(search.toLowerCase()) || 
                          phone.includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesType = typeFilter === 'all' || app.loan_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

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

  // Unique Loan Types for filter dropdown
  const loanTypes = Array.from(new Set(data.map(item => item.loan_type).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
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
              Impossible de charger les données depuis l'API Supabase. Veuillez vérifier que le serveur backend est démarré.
            </span>
          </div>
        </div>
      )}

      {/* Filtering Control Bar */}
      <div className="filter-bar section-card" style={{ padding: '1.25rem', gap: '1rem', flexDirection: 'row' }}>
        <div className="filter-group">
          {/* Search bar */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Rechercher nom, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={error}
            />
          </div>

          {/* Status filter */}
          <select 
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={error}
          >
            <option value="all">Tous les Statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
          </select>

          {/* Loan type filter */}
          <select 
            className="select-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={error}
          >
            <option value="all">Tous les Types de Prêt</option>
            {loanTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {error ? '0' : filteredData.length} dossier{filteredData.length > 1 ? 's' : ''} trouvé{filteredData.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Main Table view */}
      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton skeleton-text" style={{ height: '3.5rem', marginBottom: '0.5rem', width: '100%' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Database size={44} style={{ color: 'var(--color-danger)' }} />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Aucune donnée disponible</span>
            <span style={{ fontSize: '0.9rem', maxWidth: '400px' }}>
              La base de données n'est pas accessible actuellement. Vérifiez vos configurations Supabase et relancez le serveur.
            </span>
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <AlertCircle size={40} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Aucune demande ne correspond aux critères</span>
            <span style={{ fontSize: '0.9rem' }}>Essayez de modifier vos filtres ou d'élargir votre recherche.</span>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Coordonnées</th>
                  <th>Prêt</th>
                  <th>Montant & Durée</th>
                  <th>Statut</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((app) => (
                  <tr key={app.id} onClick={() => setSelectedApp(app)}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700 }}>{app.first_name} {app.last_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          Soumis le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem' }}>
                        <span>{app.email}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{app.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 600, 
                        backgroundColor: 'var(--bg-app)', 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {app.loan_type || 'Non spécifié'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(app.amount)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.duration} mois</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div className="btn-action-group" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-icon" 
                          onClick={() => setSelectedApp(app)}
                          title="Voir les détails"
                        >
                          <Eye size={15} />
                        </button>

                        {app.status === 'pending' && (
                          <>
                            <button 
                              className="btn-icon approve" 
                              onClick={() => handleUpdateStatus(app.id, 'approved')}
                              title="Approuver le dossier"
                              disabled={actionLoading}
                            >
                              <Check size={15} />
                            </button>
                            <button 
                              className="btn-icon reject" 
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              title="Rejeter le dossier"
                              disabled={actionLoading}
                            >
                              <CloseIcon size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal Drawer */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Détails de la demande #{selectedApp.id}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedApp(null)}>
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Profile Card Header in Modal */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
                <div className="admin-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                  {selectedApp.first_name?.[0]}{selectedApp.last_name?.[0]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedApp.first_name} {selectedApp.last_name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedApp.profession || 'Sans profession renseignée'}</span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>

              {/* Data point grids */}
              <div className="details-grid">
                
                {/* Financial aspects */}
                <div className="detail-item">
                  <span className="detail-label"><DollarSign size={12} style={{ marginRight: '0.2rem' }} />Montant Demandé</span>
                  <span className="detail-value" style={{ color: 'var(--color-primary)', fontSize: '1.1rem', fontWeight: 800 }}>
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(selectedApp.amount)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label"><Calendar size={12} style={{ marginRight: '0.2rem' }} />Durée du remboursement</span>
                  <span className="detail-value">{selectedApp.duration} mois ({Math.round(selectedApp.duration / 12 * 10) / 10} ans)</span>
                </div>

                <div className="detail-divider" />

                {/* Personal & Job details */}
                <div className="detail-item">
                  <span className="detail-label"><Briefcase size={12} style={{ marginRight: '0.2rem' }} />Revenu Mensuel déclaratif</span>
                  <span className="detail-value">{selectedApp.income ? `${selectedApp.income} € / mois` : 'Non renseigné'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label"><FileText size={12} style={{ marginRight: '0.2rem' }} />Objet de l'emprunt</span>
                  <span className="detail-value">{selectedApp.purpose || 'Non spécifié'}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label"><Mail size={12} style={{ marginRight: '0.2rem' }} />Adresse Email</span>
                  <span className="detail-value">{selectedApp.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label"><Phone size={12} style={{ marginRight: '0.2rem' }} />Téléphone</span>
                  <span className="detail-value">{selectedApp.phone}</span>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label"><MapPin size={12} style={{ marginRight: '0.2rem' }} />Adresse postale</span>
                  <span className="detail-value">{selectedApp.address || 'Non spécifiée'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedApp(null)}>Fermer</button>
              
              {selectedApp.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    <CloseIcon size={16} style={{ marginRight: '0.2rem' }} /> Rejeter
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                    disabled={actionLoading}
                  >
                    <Check size={16} style={{ marginRight: '0.2rem' }} /> Approuver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Applications;