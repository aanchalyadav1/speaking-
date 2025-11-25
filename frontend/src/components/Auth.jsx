import React, { useState } from 'react';
import firebaseApp from '../utils/firebase.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export default function Auth({ onAuthenticated }){
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  async function googleLogin(){
    const res = await signInWithPopup(auth, provider);
    const token = await res.user.getIdToken();
    onAuthenticated({ user: res.user, token });
  }
  async function emailLogin(){
    const res = await signInWithEmailAndPassword(auth, email, pw);
    const token = await res.user.getIdToken();
    onAuthenticated({ user: res.user, token });
  }
  async function signUp(){
    const res = await createUserWithEmailAndPassword(auth, email, pw);
    const token = await res.user.getIdToken();
    onAuthenticated({ user: res.user, token });
  }

  return (
    <div className="auth card" style={{maxWidth:520, margin:'80px auto', textAlign:'center'}}>
      <h2 style={{fontSize:20, marginBottom:10}}>Sign in to Speaking Test</h2>
      <button onClick={googleLogin} style={{padding:'10px 14px', borderRadius:8, background:'linear-gradient(90deg,#7c3aed,#06b6d4)', border:'none', color:'#fff'}}>Sign in with Google</button>
      <div style={{marginTop:14}}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:10, width:'80%', margin:'6px 0'}} />
        <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={{padding:10, width:'80%', margin:'6px 0'}} />
        <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:8}}>
          <button onClick={emailLogin} style={{padding:'8px 12px', borderRadius:8}}>Login</button>
          <button onClick={signUp} style={{padding:'8px 12px', borderRadius:8}}>Sign up</button>
        </div>
      </div>
    </div>
  );
}