import Layout from '../../components/layout'
import Head from 'next/head'
import useSWR from 'swr'
import axios from 'axios'
import { useRouter } from "next/router";

export function Game () {
  const r = useRouter();
  const { id } = r.query;

  console.log(id);
  console.log(`https://localhost:5001/api/game/` + id);
  let xx = `https://localhost:5001/api/game/` + id.toString();
  console.log(xx, "xx")

  const fetcher = url => axios.get(`https://localhost:5001/api/game/${id.toString()}`, {
  headers: {
    authorization: 'Bearer ' + localStorage.getItem("JwtToken"),
  }}).then(res => res.data);

  const { data, error } = useSWR('/api/game', fetcher);
  console.log("data", data);

  if(data == undefined) 
    return (
      <div>loading...</div>
      )
  else 
    return(
        <div>
        <h1>{data.name}</h1>
        <p>{data.summary}</p>
        </div>
    );
};


export default function Post({ postData }) {
    return (
        <Layout>
        <Head>
          {/* <title>{postData.title}</title> */}
        </Head>
        <Game></Game>
      </Layout>
    )
  }