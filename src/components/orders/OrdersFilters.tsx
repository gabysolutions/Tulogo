import { Search, X } from "lucide-react";
import { STAGES, type Priority } from "../../types/order";


interface OrdersFiltersProps {

  search:string;

  setSearch:(value:string)=>void;


  priority:Priority | "all";

  setPriority:(value:Priority | "all")=>void;


  stage:number | "all";

  setStage:(value:number | "all")=>void;


        results:number;

        }



        export default function OrdersFilters({

        search,

        setSearch,

        priority,

        setPriority,

        stage,

        setStage,

        

        }:OrdersFiltersProps){



        const clearFilters = ()=>{

        setSearch("");

        setPriority("all");

        setStage("all");

        };



        return (

        <div className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        space-y-4
        ">


        {/* FILA PRINCIPAL */}

        <div className="
        flex
        flex-col
        gap-3
        lg:flex-row
        ">


        {/* BUSCADOR */}

        <div className="
        relative
        flex-1
        ">


        <Search

        size={18}

        className="
        absolute
        left-3
        top-1/2
        -translate-y-1/2
        text-slate-400
        "

        />


        <input

        value={search}

        onChange={(e)=>
        setSearch(e.target.value)
        }

        placeholder="
        Buscar por cliente
        "

        className="
        w-full
        rounded-xl
        border
        border-slate-200
        py-2.5
        pl-10
        pr-3
        text-sm
        outline-none
        focus:border-blue-500
        "

        />


        </div>




        {/* PRIORIDAD */}

        <select

        value={priority}

        onChange={(e)=>
        setPriority(
        e.target.value as Priority | "all"
        )
        }

        className="
        rounded-xl
        border
        border-slate-200
        px-4
        py-2.5
        text-sm
        "

        >

        <option value="all">
        Todas las prioridades
        </option>

        <option value="alta">
        Alta
        </option>

        <option value="media">
        Media
        </option>

        <option value="baja">
        Baja
        </option>


        </select>





        </div>






        {/* ETAPAS */}

        <div className="
        flex
        flex-wrap
        gap-2
        ">


        <button

        onClick={()=>
        setStage("all")
        }

        className={`
        rounded-full
        px-4
        py-1.5
        text-sm
        transition

        ${
        stage==="all"

        ?

        "bg-slate-900 text-white"

        :

        "border border-slate-200 text-slate-600 hover:bg-slate-50"

        }

        `}

        >

        Todos

        </button>



        {
        STAGES.map((item)=>(

        <button

        key={item.id}

        onClick={()=>
        setStage(item.id)
        }

        className={`

        rounded-full
        px-4
        py-1.5
        text-sm
        transition


        ${
        stage===item.id

        ?

        "bg-slate-900 text-white"

        :

        "border border-slate-200 text-slate-600 hover:bg-slate-50"

        }

        `}

        >

        {item.label}

        </button>


        ))

        }


        </div>






        {/* FOOTER */}

        <div className="
        flex
        items-center
        justify-between
        
        pt-3
        ">






        <button

        onClick={clearFilters}

        className="ml-280
        -mt-23
        flex
         
        items-center
        gap-2
        text-sm
        text-slate-500
        hover:text-slate-900
     
        "

        >

        <X size={16}/>

        Limpiar filtros

        </button>



        </div>




        </div>

        );

        }