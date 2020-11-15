import Layout from '../../components/layout'
import Head from 'next/head'
import useSWR, { mutate} from 'swr'
import axios from 'axios'
import https from 'https'
import { useRouter } from "next/router";
import utilStyles from '../../styles/utils.module.css'
import Link from 'next/link'
import cookie from 'js-cookie';

export function Game () {
  const r = useRouter();
  const { id } = r.query;

  console.log(id);

  console.log("hello")

  if(!id) {
    return (
      <>
      </>
    )
  } 

  const fetcher = url => axios.get(`https://gabrielenapoli.com/yume2/api/game/${id.toString()}`, {
  headers: {
    authorization: 'Bearer ' +  cookie.get('jwt'),
  }}).then(res => res.data);

  const { data, error } = useSWR(`/api/game/${id.toString()}`, fetcher);
  console.log("data useSWR", data); 
  

  function getRandomArbitrary(min, max) {
    //Il valore non è minore di (e può essere uguale a) min, nè maggiore (e nè uguale) a max. 
    return parseInt(Math.random() * (max - min) + min);
  }

  if(data == undefined || data.id != id) 
    return (
      <div class="lds-ripple"><div></div><div></div></div>
      )
  else 
    return(
        <div>
          <h1>{data.name}</h1>
          <div style={{margin: '20px 0'}}>
            {data.genres.map((g) => (
              <span className={utilStyles.genres_label}>{g.name}</span>
            ))}
          </div>
          <div id={'screen_' + data.id} 
          style={{backgroundImage: 'url(' + data.screenshots[getRandomArbitrary(0, data.screenshots.length)].url.replace('thumb', '1080p') + ')', 
                  height: '344px',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat'}}></div>
          <p>{data.summary}</p>
          <h3>Develop by</h3>
          {data.involved_companies.map((c) => (
            <p>{c.company.name}</p>
          ))}
          <h3>Story line</h3>
          {data.storyline && <p>{data.storyline}</p>}
          {!data.storyline && <p>Storyline of this game is not available.</p>}
          <h3>Similar games</h3>
          <div className={utilStyles.container_similar}>
            {data.similar_games.map(similar => (
              <Link href={`/game/${similar.id}`}>
              <div
                key={similar.id}
                className={utilStyles.card_similar}
                style={{
                  backgroundImage: `linear-gradient(rgb(121 121 121 / 45%), rgb(0 0 0 / 45%)),
                  url(https:${similar.cover.url.replace('thumb', '1080p')})`
                }}
              >
                <h4 style={{color: '#FFF', padding: '20px'}}>{similar.name}</h4>
              </div>
              </Link>
            ))}
          </div>
        </div>
    );
};

export default function Post() {
    return (
        <Layout post>
        <Head>
          {/* <title>{postData.title}</title> */}
        </Head>
        <Game></Game>
      </Layout>
    )
  }