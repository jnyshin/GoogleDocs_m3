import React, { useState } from "react";
import API from "./api";

const Signup = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("")

    const handleSubmit = async(e) => {
        e.preventDefault();
        const body = {
            username: username,
            password: password,
            email: email
        };
        const newUser = await API.post("/users/signup", body)
        if (newUser.data.error) {
            console.log(newUser.data.message);
        }
        console.log(newUser)
    }

    return(
        <div class="wrapper">
            <div class="container">
                <form method="post" action="/users/signup" onSubmit={handleSubmit}>
                    <lable for="username">Username:</lable>
                    <input type="text" id="username" name="username" onChange={e => setUsername(e.target.value)} />
                    <lable for="password">Password:</lable>
                    <input type="text" id="password" name="password" onChange={e => setPassword(e.target.value)}/>
                    <lable for="email">Email</lable>
                    <input type="text" id="email" name="email" onChange={e => setEmail(e.target.value)}/>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    )
}
export default Signup;