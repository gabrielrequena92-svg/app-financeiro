import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ paddingTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>App Financeiro Home</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.25rem' }}>
          Gestão financeira clara e compartilhada.
        </p>
      </header>

      <div style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        <div style={{
          backgroundColor: 'hsl(var(--card))',
          padding: '2rem',
          borderRadius: 'var(--radius)',
          border: '1px solid hsl(var(--border))'
        }}>
          <h3>Contextos</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Gerencie suas finanças pessoais e compartilhadas.</p>
        </div>

        <div style={{
          backgroundColor: 'hsl(var(--card))',
          padding: '2rem',
          borderRadius: 'var(--radius)',
          border: '1px solid hsl(var(--border))'
        }}>
          <h3>Movimentações</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>Controle total de entradas e saídas.</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link href="/auth/login" className="btn">
          Entrar / Cadastrar
        </Link>
      </div>
    </main>
  );
}
