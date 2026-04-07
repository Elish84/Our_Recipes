import React, { useState, useEffect } from 'react';
import { subscribeToInstallAnalytics } from '../services/firebase';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="stat-card" style={{ 
    background: 'white', 
    padding: '20px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: `1px solid ${color}20`,
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{ 
      position: 'absolute', 
      top: '-10px', 
      right: '-10px', 
      fontSize: '4rem', 
      opacity: 0.05, 
      color: color 
    }}>{icon}</div>
    <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</span>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111' }}>{value}</div>
    {subtitle && <span style={{ fontSize: '0.75rem', color: color, fontWeight: 500 }}>{subtitle}</span>}
  </div>
);

const PlatformBar = ({ platform, count, total, color }) => {
  const percentage = total > 0 ? (count / total * 100).toFixed(0) : 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{platform}</span>
        <span style={{ color: '#666' }}>{count} ({percentage}%)</span>
      </div>
      <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, transition: 'width 1s ease-out' }} />
      </div>
    </div>
  );
};

export default function AnalyticsDashboard({ t }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToInstallAnalytics((docs) => {
      setData(docs);
      setLoading(false);
    }, (err) => {
      console.error("Analytics sub failed:", err);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>{t.loading}</div>;

  const stats = {
    prompts: data.filter(d => d.eventType === 'install_prompt_shown').length,
    clicks: data.filter(d => d.eventType === 'install_clicked').length,
    accepted: data.filter(d => d.eventType === 'install_accepted').length,
    dismissed: data.filter(d => d.eventType === 'install_dismissed').length,
  };

  const platforms = {
    android: data.filter(d => d.platform === 'android' && d.eventType === 'install_prompt_shown').length,
    ios: data.filter(d => d.platform === 'ios' && d.eventType === 'install_prompt_shown').length,
    desktop: data.filter(d => d.platform === 'desktop' && d.eventType === 'install_prompt_shown').length,
  };

  const conversionRate = stats.prompts > 0 ? ((stats.accepted / stats.prompts) * 100).toFixed(1) : 0;
  const clickRate = stats.prompts > 0 ? ((stats.clicks / stats.prompts) * 100).toFixed(1) : 0;

  return (
    <div className="analytics-dashboard" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 className="section-title" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>📊</span> {t.sysAnalyticsTitle}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard 
          title={t.totalInstalls} 
          value={stats.accepted} 
          subtitle={`${conversionRate}% ${t.conversionRate}`}
          icon="📱" 
          color="#10B981" 
        />
        <StatCard 
          title={t.installPrompts} 
          value={stats.prompts} 
          subtitle={`${clickRate}% לחיצות`}
          icon="🔔" 
          color="#3B82F6" 
        />
        <StatCard 
          title={t.installDismissed} 
          value={stats.dismissed} 
          icon="✖️" 
          color="#EF4444" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {/* Funnel Section */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '28px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', color: '#111' }}>{t.funnel}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="funnel-step" style={{ background: '#EFF6FF', padding: '16px', borderRadius: '16px', border: '1px solid #DBEAFE' }}>
              <div style={{ fontSize: '0.8rem', color: '#3B82F6', fontWeight: 700 }}>STEP 1</div>
              <div style={{ fontWeight: 600 }}>{t.installPrompts}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stats.prompts}</div>
            </div>
            <div style={{ textAlign: 'center', opacity: 0.3 }}>▼</div>
            <div className="funnel-step" style={{ background: '#F5F3FF', padding: '16px', borderRadius: '16px', border: '1px solid #EDE9FE' }}>
              <div style={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700 }}>STEP 2</div>
              <div style={{ fontWeight: 600 }}>{t.installClicked}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stats.clicks}</div>
            </div>
            <div style={{ textAlign: 'center', opacity: 0.3 }}>▼</div>
            <div className="funnel-step" style={{ background: '#ECFDF5', padding: '16px', borderRadius: '16px', border: '1px solid #D1FAE5' }}>
              <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>STEP 3</div>
              <div style={{ fontWeight: 600 }}>{t.installAccepted}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{stats.accepted}</div>
            </div>
          </div>
        </div>

        {/* Platform Section */}
        <div style={{ background: 'white', padding: '30px', borderRadius: '28px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '24px', color: '#111' }}>פלטפורמות (חשיפה)</h3>
          <PlatformBar platform="Android" count={platforms.android} total={stats.prompts} color="#34D399" />
          <PlatformBar platform="iOS" count={platforms.ios} total={stats.prompts} color="#60A5FA" />
          <PlatformBar platform="Desktop" count={platforms.desktop} total={stats.prompts} color="#94A3B8" />
        </div>
      </div>
      
      <div style={{ marginTop: '40px', fontSize: '0.8rem', color: '#999', textAlign: 'center' }}>
        נתוני האנליטיקס מתעדכנים בזמן אמת מ-Firestore.
      </div>
    </div>
  );
}
