import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Profile(){
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }
    axios.get('http://localhost:4000/api/profile', { headers: { Authorization: 'Bearer ' + token }})
      .then(r => setProfile(r.data))
      .catch(err => console.error(err));
  }, []);
  const logout = async () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  if (!profile) return <div style={{padding:24}}>Loading...</div>;
  return (
    <div style={{padding:24}}>
      <h2>Profile</h2>
      <img src={profile.avatarUrl} width="80" style={{borderRadius:40}} />
      <div>Name: {profile.name}</div>
      <div>Email: {profile.email}</div>
      <div>Provider: {profile.provider}</div>
      <div>Total repos: {profile.totalRepos}</div>
      <div>Auto review enabled: {profile.autoReviewEnabled}</div>
      <div style={{marginTop:12}}>
        <button onClick={logout}>Logout</button>
      </div>
      <div style={{marginTop:12}}>
        <Link href="/repos">Back to repos</Link>
      </div>
    </div>
  );
}
