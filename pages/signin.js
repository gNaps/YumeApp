import React, {useState} from 'react';
import Router from 'next/router';
import axios from 'axios';
import { Form, Col, Button, Alert } from 'react-bootstrap';
import Head from 'next/head'
import styles from '../components/layout.module.css'
import Link from 'next/link'

export default function Login() {
  const [signInError, setSignInError] = useState(false);
  const [signInErrorMessage, setSignInErrorMessage] = useState('');
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("inizio fetch");
    console.log("username", username);
    console.log("password", password);
    console.log("email", email);
    //call api
     await axios.post('https://localhost:5001/api/users', {
        Username: username,
        Password: password,
        Email: email
    })
    .then((response) => {
        console.log(response);
        setSignInError(false);
        setSignInErrorMessage("");
        setSignInSuccess(true);
      }, (error) => {
        console.log(error);
        setSignInError(true);
        setSignInErrorMessage("error")
        setSignInSuccess(false);
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
            integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
            crossorigin="anonymous"
            />
            </Head>
            <Form onSubmit={handleSubmit} className={styles.sign_in_container_form}>
                <h3>Enter credentials and register an account.</h3>
                    <Form.Group controlId="formGridUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control 
                            placeholder="this will be your username" 
                            name="username"
                            type="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formGridEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                        type="email" 
                        placeholder="use your personal email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </Form.Group>

                    <Form.Group controlId="formGridPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="use a strength password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </Form.Group>
                <Button variant="primary" type="submit" className={styles.btn_primary}>
                    Sign in
                </Button>
                <Link href="/login">
                    <a>Have an account yet? Please login</a>
                </Link>
            </Form>
            <Alert show={signInError} variant="danger">{signInErrorMessage}</Alert>
            <Alert show={signInSuccess} variant="success">Il tuo utente è stato creato!</Alert>
        </div>
    </div>
  );
};