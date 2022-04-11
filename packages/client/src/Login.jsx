import React, { useState } from "react";
import API from "./api";

const Login = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async(e) => {
        e.preventDefault();

        const body = {
            username: username,
            password: password,
        };
        const user = await API.post("/users/login", body)
        if (user.data.error) {
            console.log(user.data.message);
        }
        console.log(user)
    }

    return(
        <div class="wrapper">
        <div class="container">
            <form method="post" action="/users/login" onSubmit={handleSubmit}>
                <lable for="username">Username:</lable>
                <input type="text" id="username" name="username" onChange={e => setUsername(e.target.value)}/>
                <lable for="password">Password:</lable>
                <input type="text" id="password" name="password" onChange={e => setPassword(e.target.value)}/>
                <input type="submit" value="Login" />
            </form>
            <form method="post" action="/users/logout">
                <button type ="submit">LOGOUT</button>
            </form>
        </div>
    </div>
    )
}
export default Login;