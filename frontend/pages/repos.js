import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Repos(){
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/'; return; }
    axios.get('http://localhost:4000/api/repos', { headers: { Authorization: 'Bearer ' + token }})
      .then(r => { setRepos(r.data.repos || []); setLoading(false); })
      .catch(err => { console.error("REPOS FETCH ERROR:", err); setLoading(false); });
  }, []);
  const toggle = async (id) => {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:4000/api/repo/' + id + '/toggle', {}, { headers: { Authorization: 'Bearer ' + token }});
    setRepos(repos.map(r => r.id === id ? {...r, autoReview: !r.autoReview} : r));
  };
  if (loading) return <div style={{padding:24}}>Loading...</div>;
  return (
    <div style={{padding:24}}>
      <h2>Your Repositories</h2>
      <Link href="/profile">Profile</Link>
      <div style={{marginTop:12}}>
        {repos.map(r => (
          <div key={r.id} style={{border:'1px solid #ddd', padding:12, marginBottom:8, display:'flex',justifyContent:'space-between'}}>
            <div>
              <a href={r.url} target="_blank" rel="noreferrer"><strong>{r.fullName}</strong></a>
              <div>Stars: {r.stars} • Default branch: {r.defaultBranch}</div>
            </div>
            <div style={{display:'flex',gap:8, alignItems:'center'}}>
              <button onClick={() => toggle(r.id)}>{r.autoReview ? 'Disable Auto Review' : 'Enable Auto Review'}</button>
              <Link href={'/repo/' + r.id}><button>Stats</button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
