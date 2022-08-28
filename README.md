live: https://jessejputnam.github.io/better-battle-buddy/

# better-battle-buddy
- A PokémonGo helper app that allows users to input opponent Pokemon names and ascertain effective offensive types as well as suggested Pokémon to use against opponent
- Focus on promises, asynchronous JS, and API calls

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  
## Overview

### The challenge

Users should be able to:

- Input any pokemon
- Search pokemon database
- recieve weakness and resistance information
- recieve 

## My process

### Built with
- Flexbox
- Mobile-first workflow
- API (PokeAPI: https://pokeapi.co/)


### What I learned
This project was my first real use of asychrony in JavaScript. I wanted to practice making API calls that would require hierarchy in use.

I used the built-in fetch API to work with the Promises. The largest difficulty I had was with making sure actions only occurred in the correct order, only once the information was recieved. To work around the difficulty, I decided to have the user interact with buttons. This allowed me to control the user's flow and give my API call time to get the information before using synchronous functions to work with the data. This ended up delivering user control of the functionality unlike I had intended: it gave the user control of when information was gathered and how much -- e.g. if they only wanted the type but not the weaknesses, or if they only wanted the weaknesses and didn't need suggested Pokemon to use.

### Continued development

I had to hack together certain solutions for the asynchrony that are pretty ugly to me. I believe this will be easier for me to comprehend with the async/await pattern. 

That being said, my confusion around Promises and properly ordering them in execution shows that I need a deeper look at these concepts before sampling the sytactic sugar in async/await.
