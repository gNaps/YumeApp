import Layout from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import styles from '../styles/addGames.module.css'
import cookie from 'js-cookie';
import Link from 'next/link'

export default function Lista() {
  const [addTerm, setAddTerm] = React.useState("")
  const [listGames, setListGames] = React.useState(null)

  const handleChange = event => {
    console.log(event)
    setAddTerm(event.target.value)
  }

  const searchGame = async event => {
    console.log(event.keyCode)
    if(event.keyCode == 13) {
      console.log('query ', addTerm)
      setAddTerm(addTerm)
      if (addTerm.length >= 3) {
        const game = {
          Name: addTerm
        }
        const games_res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/game`, {
          method: 'POST',
          body: JSON.stringify(game),
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + cookie.get('jwt'),
          }
        })

        const games = await games_res.json()
        setListGames(games)
      } else {
        
      }
    }
  }

  return (
    <Layout post>
        <input 
        type="text"
        placeholder="type a game to add"
        value={addTerm}
        onChange={handleChange}
        onKeyUp={searchGame} 
        className={utilStyles.list_games_search} />
        <button type="button" className={utilStyles.list_games_search_button} onClick={() => searchGame()}>
          <i class="fa fa-search" />
        </button>
        {
          !listGames &&
            <div>
              <p>Search new game to add at your list</p>
            </div>
        }
        {
          listGames && listGames.length == 0 &&
          <div>
            <p>nessun gioco trovato</p>
          </div>
        }
        {
          listGames && listGames.length > 0 &&
          <div className={styles.container_list}>
            <h3>Results for {addTerm}</h3>
            <p>{listGames.length} items found.</p>
            {listGames.map((x) => (        
              <li className={`${utilStyles.listItem} ${utilStyles.list_games_item}`} key={x.id}>
                <div className={utilStyles.list_games_item_header}>
                    {x.cover && <img src={'https:' + x.cover.url.replace('t_thumb', 't_cover_big')}></img>}
                    <div className={utilStyles.list_games_item_body}>
                      <Link href={`/game/${x.id}`}>
                      <a>{x.name}</a>
                      </Link>
                      <div>
                        {x.genres && x.genres.map((g) => (
                          <span className={utilStyles.genres_label}>{g.name}</span>
                        ))}
                      </div>
                      {x.summary && x.summary.length <= 500 && <small className={utilStyles.lightText}>{x.summary.substring(0, 500)}</small>}
                      {x.summary && x.summary.length > 500 && <small className={utilStyles.lightText}>{x.summary.substring(0, 500)}...</small>}
                  </div>
                </div>
              </li>
            ))}
          </div>
        }
    </Layout>
  )
}