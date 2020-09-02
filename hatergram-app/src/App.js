import React, { useState, useEffect } from 'react';
import './App.css';
import { useQuery} from '@apollo/client'
import Login from "./components/LogIn/Login"
import SignUp from "./components/SignUp/SignUp"
import { Switch, Route } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Posts from './components/Posts/Posts';
import {USER} from "./graphql/queries"
import UserInfo from './components/UserInfo/UserInfo';



function App() {
  const {loading, error, data}= useQuery(USER)
  let user= null

  if(loading){return <div>Loading...</div>}
  if(error){return <div>{error}</div>}
  if(data.user === null){
    user=null
    console.log(user)
    return (
    <div className="App">
      <NavBar user={user}/>
      <Switch>
        <Route exact path="/signup" component={SignUp}/> 
        <Route exact path="/login" component={Login}/>
        <Route exact path="/users/:id" render={(props)=>{
          return <UserInfo {...props} user={user}/>
        }}/>
      </Switch>
    </div>
  )}
  if(data.user != null){
    user = data.user
    console.log(user)
    return (
  
        <div className="App">
          <NavBar user={user}/>
          <Switch>
            <Route exact path="/posts"  component={Posts} />
            <Route exact path="/signup" component={SignUp}/> 
            <Route exact path="/login" component={Login}/>
            <Route exact path="/users/:id" render={(props)=>{
              return <UserInfo {...props} user={user}/>
            }}/>
          </Switch>
        </div>
    );
  }
}

export default App;
