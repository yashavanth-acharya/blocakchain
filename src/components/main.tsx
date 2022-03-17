import { Navbar,Welcome,Footer,Service,Transcations } from './';

function Main() {

  return (
    <div className="min-h-screen">
     <div className="gradient-bg-welcome">
       <Navbar/>
       <Welcome />
     </div>
     <Service/>
     <Transcations/>
     <Footer/>
    </div>
  )
}



export default Main
