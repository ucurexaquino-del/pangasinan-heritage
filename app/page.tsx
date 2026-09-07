'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Waves,
  Sun,
  Mountain,
  Compass,
  Heart,
  X,
  Menu,
  Leaf,
  ChevronRight,
  Download,
  Check,
  Signal,
  Landmark
} from 'lucide-react';


type Place = {
  id:string;
  title:string;
  town:string;
  category:string;
  image:string;
  intro:string;
  story:string;
  tips:string[];
  source:string;
  label:string;
};


const BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH || "";


const places:Place[]=[

{
id:'islands',
title:'Hundred Islands',
town:'Alaminos City',
category:'Island escapes',
image:`${BASE_PATH}/images/hundred.jpg`,
intro:'A little island. A whole new perspective.',
story:'Discover the island-dotted waters of the Hundred Islands National Park in Alaminos.',
tips:[
'Arrange your visit through the local tourism office.',
'Bring drinking water and sun protection.',
'Respect marine life.'
],
source:'#',
label:'Sea & discovery'
},


{
id:'lighthouse',
title:'Cape Bolinao Lighthouse',
town:'Bolinao',
category:'Heritage trails',
image:`${BASE_PATH}/images/light.jpg`,
intro:'Follow the coast. Find a story.',
story:'A historic coastal landmark of Pangasinan.',
tips:[
'Bring sun protection.',
'Check access before visiting.',
'Respect the area.'
],
source:'#',
label:'History & horizons'
},


{
id:'springs',
title:'Balungao Hot Springs',
town:'Balungao',
category:'Nature retreats',
image:`${BASE_PATH}/images/spring.jpg`,
intro:'Slow days, warm waters, greener views.',
story:'Hot and cold springs located near Mount Balungao.',
tips:[
'Bring swimwear.',
'Check opening hours.',
'Keep the area clean.'
],
source:'#',
label:'Nature & renewal'
}

];


const categories=[
'All destinations',
'Island escapes',
'Heritage trails',
'Nature retreats'
];



export default function Home(){


const [category,setCategory]=useState(categories[0]);

const [saved,setSaved]=useState<string[]>([]);

const [low,setLow]=useState(false);

const [active,setActive]=useState<Place|null>(null);

const [menu,setMenu]=useState(false);

const [notice,setNotice]=useState('');

const dialog=useRef<HTMLDialogElement>(null);



useEffect(()=>{

const data=
localStorage.getItem('pangasinan-trip');

if(data){

setSaved(JSON.parse(data));

}

},[]);



useEffect(()=>{

localStorage.setItem(
'pangasinan-trip',
JSON.stringify(saved)
);

},[saved]);



useEffect(()=>{

if(active){

dialog.current?.showModal();

}

else{

dialog.current?.close();

}

},[active]);




function toggle(place:Place){

setSaved(prev=>

prev.includes(place.id)

?

prev.filter(x=>x!==place.id)

:

[...prev,place.id]

);


setNotice(
saved.includes(place.id)

?

`${place.title} removed`

:

`${place.title} saved`

);

}




function close(){

setActive(null);

}




function download(){


const text=

places
.filter(p=>saved.includes(p.id))
.map(p=>

`${p.title}

${p.story}

${p.tips.join('\n')}`

)
.join('\n\n');


const blob=new Blob(
[text],
{
type:'text/plain'
}
);


const url=
URL.createObjectURL(blob);


const a=document.createElement('a');

a.href=url;

a.download="pangasinan-trip.txt";

a.click();

}



function photo(place:Place){

return(

<img

src={place.image}

alt={place.title}

loading="lazy"

onError={(e)=>{

console.error(
"Image missing:",
place.image
);

e.currentTarget.src=
`${BASE_PATH}/images/fallback.jpg`;

}}

/>

)

}



return (

<>


<header>


<a className="brand">

<Waves/>

<span>

Pangasinan

<small>
WANDER. CONNECT. DISCOVER.
</small>

</span>

</a>


<nav className={menu?'open':''}>


<a href="#destinations">
Discover
</a>


<button
onClick={()=>{
setMenu(false)
}}
>

My Trip {saved.length}

</button>


</nav>


<button
className="menu-button"
onClick={()=>setMenu(!menu)}
>

{menu?<X/>:<Menu/>}

</button>


</header>




<main>


<section className="hero">


<div>

<div className="eyebrow">

YOUR NEXT STORY STARTS HERE

</div>


<h1>

A place to wander.

<br/>

<em>
A feeling to keep.
</em>

</h1>


<p>

Island mornings.
Coastal stories.
A warm welcome.

</p>


</div>


<div className="hero-image">

{photo(places[0])}


</div>


</section>




<section id="destinations">


<div className="filters">


{

categories.map(c=>(


<button

key={c}

onClick={()=>setCategory(c)}

>

{c}

</button>


))

}


</div>





<div className="cards">


{

places

.filter(

p=>

category===categories[0]

||

p.category===category

)

.map(place=>(



<article key={place.id}>


<div className="card-image">

{photo(place)}

</div>



<span>

<MapPin size={14}/>

{place.town}

</span>



<h2>

{place.title}

</h2>


<p>

{place.intro}

</p>



<button

onClick={()=>toggle(place)}

>


<Heart

fill={
saved.includes(place.id)
?
"currentColor"
:
"none"
}

/>


{

saved.includes(place.id)

?

"Saved"

:

"Save"

}


</button>



</article>


))


}


</div>


</section>



</main>





<dialog ref={dialog}>


<button
onClick={close}
>

<X/>

</button>


{

active &&

<div>

{photo(active)}

<h2>

{active.title}

</h2>


<p>

{active.story}

</p>


</div>

}


</dialog>



{

notice &&

<div className="toast">

{notice}

</div>

}


</>

);


}
