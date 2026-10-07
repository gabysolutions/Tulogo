import {  Factory } from "lucide-react";

interface Props {
  onCreate?: () => void;
}

export default function OrdersHeader({

}: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">

      <div className="flex items-start gap-3">

        <div className="
          flex
          size-11
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          text-primary
        ">
          <Factory className="size-5" />
        </div>


        <div>

          <h1 className="
           text-3xl font-bold tracking-tight text-slate-800
          ">
            Pedidos
          </h1>


          <p className="
            text-sm
            text-muted-foreground
          ">
            Control y seguimiento de órdenes de pedidos
          </p>


        </div>


      </div>



    



    </header>
  );
}