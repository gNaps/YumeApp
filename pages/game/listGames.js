import Layout from '../../components/layout'
import Head from 'next/head'
import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { useRouter } from "next/router"
import utilStyles from '../../styles/utils.module.css'
import { Alert, Button } from 'react-bootstrap';
import cookie from 'js-cookie';
import Link from 'next/link'


//Lista dei giochi trovato tramire la ricerca
export function ListGamesToAdd () {
  const r = useRouter();
  const { search } = r.query;
  console.log(search);

   const fetcher = url => axios.post(`https://gabrielenapoli.com/yume2/api/game`, {
    Name: search
  },{
  headers: {
    authorization: 'Bearer ' + cookie.get('jwt'),
  }}).then(res => res.data);

  const { data, error } = useSWR('/api/listGameAdd', fetcher); 
  console.log("data", data);  

  if(data == undefined) 
    return (
      <div class="lds-ripple"><div></div><div></div></div>
      )
  else 
    return(
      <div>
        <h1>Results for {search}</h1>
        <p>{data.length} items find.</p>
      {data.map((x) => (



        // <li className={utilStyles.listItem} key={x.id}>
        // <a>{x.name}</a>
        // <br />
        // <small className={utilStyles.lightText}>
        //   qui c'era la data
        //   {JSON.stringify(x)}
        // </small>
        // <AddGame id={x.id}></AddGame>
        // </li>
        
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
              <AddGame id={x.id}></AddGame>
           </div>
         </div>
       </li>
        
        
        ))}
      </div>
    );
};

//Pulsante per aggiungere un gioco alla propria lista
export function AddGame(id) {
  const [show, setShow] = React.useState(false);
  const [addTerm, setAddTerm] = React.useState("");
  const router = useRouter()
  const handleClick = event => {
    console.log(id);
    const game = {
      "Videogameid": id.id,
      "Finish": false,
      "Platinum": false,
      "Wishlist": false,
      "OrderToPlay": 0
    }

    axios.post(`${process.env.API_URL}/usersvideogame`, game,{
    headers: {
      authorization: 'Bearer ' + cookie.get('jwt'),
    }}).then(res => {
      console.log("risposta di aggiunta", res);
      setShow(true);    
      mutate('/api/listUserGame');
    });
  };

  if(!show)
  return (
    <div>
      {/* <button onClick={handleClick} id={id}>Aggiungi alla lista</button> */}
      <Button variant="primary" type="submit" id={id} className={utilStyles.btn_primary} onClick={handleClick}>
            Aggiungi
      </Button>
    </div>
  )
  else
  return (
    <div>
      <Alert show={show} variant="success">Il gioco è stato aggiunto!</Alert>
    </div>
  )
  
}

export default function Lista() {
  return (
      <Layout>
      <Head>
        {/* <title>{postData.title}</title> */}
      </Head>
      <ListGamesToAdd></ListGamesToAdd>
    </Layout>
  )
}