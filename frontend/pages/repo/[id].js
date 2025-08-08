import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function RepoPage(){
  const router = useRouter();
  const { id } = router.query;
  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    axios.get('http://localhost:4000/api/repo/' + id + '/stats', { headers: { Authorization: 'Bearer ' + token }})
      .then(r => setStats(r.data.stats))
      .catch(err => console.error(err));
  }, [id]);
  if (!stats) return <div style={{padding:24}}>Loading...</div>;
  return (
    <div style={{padding:24}}>
      <Link href="/repos">Back</Link>
      <h2>Repo stats</h2>
      <div>Stars: {stats.stars}</div>
      <div>Default branch: {stats.defaultBranch}</div>
      <div>Auto Review: {String(stats.autoReview)}</div>
      <div>Total lines (approx): {stats.totalLines === null ? 'Unavailable' : stats.totalLines}</div>
    </div>
  );
}
