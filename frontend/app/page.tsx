"use client";
import dynamic from 'next/dynamic'
import styles from './page.module.css';

const GameClient = dynamic(() => import('./GameClient'), { 
  ssr: false,

  loading: () => (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <p>Carregando o jogo...</p>
      </main>
    </div>
  )
})
 
export default function Page() {
  return <GameClient />
}