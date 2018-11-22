#Silo.js
Silo.js is a javascript template library 

##Template Engine
The template engine is the heart of the library.

````
import Silo from 'silojs';

let html = `
<div class="profile">
    <img src="/images/profile/${user.id}.png" alt="${user.firstName} + ' ' + {{user.firstName}}">
    <p>
        <h3>{{}}
    <p>
</div>
`
const html = silo.render();


````

