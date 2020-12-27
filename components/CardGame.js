import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/CardGame.module.css';

export default function CardGame({ game }) {
    console.log('game passato ', game)
    return (
       <Link href={`/game/${game.gameIgdb.id}`}>
            <a className={styles.a_item}>  
                <div className={styles.card_game} 
                    style={{ background: 'linear-gradient(-180deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.8) 60%, #000000 100%), url(https:' 
                    + game.gameIgdb.cover.url.replace('t_thumb', 't_1080p') + ')', backgroundPosition: 'center', backgroundSize: 'cover'}}>
                    <span>
                        {
                            game.usersVideogame.platinum &&
                            <i class="fas fa-trophy" />
                        }
                        {
                            !game.usersVideogame.platinum &&
                            game.usersVideogame.finish &&
                            <i class="fas fa-award" />
                        }
                        {
                            game.usersVideogame.orderToPlay > 0 &&
                            <i class="fas fa-gamepad" />
                        }
                        {
                            game.usersVideogame.wishlist &&
                            <i class="fas fa-shopping-cart" />
                        }
                        <p>{game.gameIgdb.name}</p>
                    </span>
                </div>
            </a>
        </Link>
    )
}