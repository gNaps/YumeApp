import Layout from '../../components/layout'
import { getAllPostIds, getPostData } from '../../lib/posts'
import Head from 'next/head'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'


export async function getStaticPaths() {
  const fetcher = url => axios.get('https://localhost:5001/api/usersvideogame/', {
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiTmFwc3J5dSIsImV4cCI6MTYwNDk1ODE1OSwiaXNzIjoiVGVzdC5jb20iLCJhdWQiOiJUZXN0LmNvbSJ9.RLXpF_E7hUanxOLMZajdkP3MNccWQ7jwCXszwPsEVWE',
    }}).then(res => res.data);
  
    const { list, error } = useSWR('/api/data', fetcher);

    const paths = list.map(game => {
        params: {
          id: game.usersVideogame.id
        }
    })

    console.log(paths);
    
    return {
      paths,
      fallback: false
    }
}

export async function getStaticProps({ params }) {
    const postData = await getPostData(params.id)
    return {
        props: {
        postData
        }
    }
}

export default function Post({ postData }) {
    return (
        <Layout>
        <Head>
          <title>{postData.title}</title>
        </Head>
        <article>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={postData.date} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        </article>
      </Layout>
    )
  }