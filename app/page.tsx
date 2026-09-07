'use client';

import { useState } from "react";

const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH || "";

const places = [
  {
    id:"islands",
    title:"Hundred Islands",
    town:"Alaminos City",
    image:`${BASE_PATH}/images/hundred.jpg`
  },
  {
    id:"lighthouse",
    title:"Cape Bolinao Lighthouse",
    town:"Bolinao",
    image:`${BASE_PATH}/images/light.jpg`
  },
  {
    id:"springs",
    title:"Balungao Hot Springs",
    town:"Balungao",
    image:`${BASE_PATH}/images/spring.jpg`
  }
];

export default function Home(){

const [saved,setSaved]=useState<string[]>([]);

return (
<main>
<h1>Pangasinan</h1>

<section>
{places.map(place=>(
<article key={place.id}>

<img
src={place.image}
alt={place.title}
/>

<h2>{place.title}</h2>
<p>{place.town}</p>

<button
onClick={()=>
setSaved(v =>
v.includes(place.id)
?v.filter(x=>x!==place.id)
:[...v,place.id]
)
}
>
{saved.includes(place.id)?"Saved":"Save"}
</button>

</article>
))}
</section>
</main>
)

}
