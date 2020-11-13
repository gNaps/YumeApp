import React, {useState} from 'react';
import Router from 'next/router';
import axios from 'axios';
import cookie from 'js-cookie';
import { Form, Col, Button, Alert } from 'react-bootstrap';
import Head from 'next/head'
import styles from '../components/layout.module.css'
import Link from 'next/link'

export default function Login() {
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("inizio fetch");
    console.log("username", username);
    console.log("password", password);
    //call api
    await axios.post('https://localhost:5001/api/login', {
        Username: username,
        Password: password
        }
    )
    .then((response) => {
        console.log(response.data.image);
        setLoginError("")
        cookie.set("jwt", response.data.jwt);
        cookie.set("username", username);
        cookie.set("user", response.data.id);
        //cookie.set("imageProfile", "data:image/png;base64," + response.data.image);
        localStorage.setItem("imageProfile", "data:image/png;base64," + response.data.image);
        Router.push('/');
      }, (error) => {
        console.log(error);
        setLoginError("Utente non trovato.")
      });
  }
  return (
    <div id="ciao" className={styles.sign_in_container}>
        <div id="ciao2" className={styles.container}>
            <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta
            name="description"
            content="An application for videogamers"
            />
            <title>Yume</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
            integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
            crossorigin="anonymous"
            />
        </Head>
            <Form onSubmit={handleSubmit} className={styles.sign_in_container_form}>
                <h3>Welcome to Yume, please login</h3>
                <Form.Group controlId="formGridUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                        placeholder="Username" 
                        name="username"
                        type="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="formGridPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className={styles.btn_primary}>
                    Login
                </Button>
                <Link href="/signin">
                    <a>Don't have account? Sign in!</a>
                </Link>
            </Form>
        </div>
    </div>
  );
};