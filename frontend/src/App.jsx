import React, { useState } from 'react';
import Auth from './components/Auth.jsx';
import TestRunner from './pages/TestRunner.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App(){
  const [auth, setAuth] = useState(null);
  const [adminView, setAdminView] = useState(false);

  if (!auth) return <Auth onAuthenticated={(a)=>setAuth(a)} />;

  return (
    <div className="app-shell p-6">
      <header className="card flex justify-between items-center">
        <div>
          <h1 style={{fontSize:20, fontWeight:700}}>Speaking Test Platform</h1>
          <div style={{fontSize:12, color:'#9aa4b2'}}>AI-driven speaking evaluation</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>setAdminView(v=>!v)} style={{padding:'8px 12px'}}>{adminView ? 'User View' : 'Admin'}</button>
          <button onClick={async ()=>{ await import('firebase/auth').then(m=>m.signOut()); window.location.reload(); }} style={{padding:'8px 12px', background:'#ef4444', color:'#fff'}}>Logout</button>
        </div>
      </header>

      <main className="mt-6 grid md:grid-cols-2 gap-6">
        {!adminView ? <TestRunner auth={auth} /> : <AdminDashboard auth={auth} />}
      </main>
    </div>
  );
}