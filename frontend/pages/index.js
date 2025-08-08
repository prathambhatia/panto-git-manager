import Link from 'next/link';
export default function Home(){
  return (
    <div style={{padding:24}}>
      <h1>SDE Assignment - Git Manager</h1>
      <p>Login with Git provider to continue.</p>
      <div style={{display:'flex',gap:12}}>
        <a href='http://localhost:4000/auth/github'><button>Login with GitHub</button></a>
        <a href='http://localhost:4000/auth/gitlab'><button>Login with GitLab</button></a>
      </div>
      <p style={{marginTop:20}}>
        After login you'll be redirected to <code>/auth/success</code> which stores token.
      </p>
    </div>
  );
}
