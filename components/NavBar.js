import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/NavBar.module.css';

export default function NavBar() {
    const [open, setOpen] = useState(false);

    /**
     * If in mobile view open and close the menu
     */
    const handlePopupClick = () => {
        setOpen(!open);
    };

    return (
        <div className={styles.nav}>
            <Link href="/">
                <a>
                <img src="/logo_yume_w.png"  style={{width: '100px'}}/>
                </a>
            </Link>
            <div className={styles.right_nav_button}>
                <Link href="/addGames">
                    <a>
                        <button className={styles.btn_add_game}>Add a Game</button>
                    </a>
                </Link>
                <a href="mailto:alex@entreprenerd.xyz" target="_blank" rel="noopener noreferrer">
                    <button className={styles.btn_logout}>Logout</button>
                </a>
            </div>
            <div className={styles.right_nav_hamburger} onClick={() => handlePopupClick()}>
                <img src="/menu-ham.svg" style={{width: '45px'}}/>
            </div>
            <div className={`${styles.menu_popup} ${open ? styles.open : ''}`}>
                <Link href="/addGames">
                    <a>
                        <p>Add a Game</p>
                    </a>
                </Link>
                <a href="mailto:alex@entreprenerd.xyz" target="_blank" rel="noopener noreferrer">
                    <p>Logout</p>
                </a>
            </div>
        </div>
    );
}