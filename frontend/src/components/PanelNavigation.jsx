
import {useNavigate} from "react-router-dom";
import "./PanelNavigation.css";

function PanelNavigation({activePanel}){
    const navigate=useNavigate();
    const user=JSON.parse(localStorage.getItem("user")||"null");
    const role=user?.role;

    const panels=[
        ...(role==="admin"?[{label:"Admin Panel",path:"/admin",key:"admin"}]:[]),
        {label:"User Panel",path:"/dashboard",key:"user"},
        ...(role==="admin"||role==="provider"?[{label:"Provider Panel",path:"/provider",key:"provider"}]:[])
    ];

    return(
        <nav className="panel-navigation">
            {panels.map(panel=>(
                <button
                    key={panel.key}
                    className={activePanel===panel.key?"panel-active":""}
                    onClick={()=>navigate(panel.path)}
                >
                    {panel.label}
                </button>
            ))}
        </nav>
    );
}

export default PanelNavigation;
