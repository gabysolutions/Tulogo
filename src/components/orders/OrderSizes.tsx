interface Props{
 order:any;
}


export default function OrderSizes({order}:Props){

const sizes=["XS","S","M","L","XL"];


return(

<div className="grid grid-cols-5 gap-3">

{
sizes.map(size=>(
<div
key={size}
className="
rounded-xl
border
border-gray-200
bg-white
p-2
text-center
"
>

<p className="text-xs text-slate-400">
{size}
</p>


<p className="font-bold">
{
order.details.filter(
(d:any)=>d.size===size
).length
}
</p>


</div>
))
}

</div>

)

}