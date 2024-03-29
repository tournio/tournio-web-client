import {Container} from "react-bootstrap";

import SiteHeader from './SiteHeader';
import Navigation from './Navigation';
import Footer from './Footer';
import MaintenanceAnnouncement from "../../common/MaintenanceAnnouncement/MaintenanceAnnouncement";
import {DirectorContextProvider} from "../../../store/DirectorContext";

import classes from './DirectorLayout.module.scss';
import {LoginContextProvider} from "../../../store/LoginContext";

const DirectorLayout = ({children}) => {
  return (
    <LoginContextProvider>
      <DirectorContextProvider>
        <div className={classes.DirectorLayout}>
          <SiteHeader/>

          <header>
            <Container fluid={'lg'}>
              <Navigation/>
            </Container>
          </header>

          <main>
            <Container fluid={'lg'}>
              <MaintenanceAnnouncement/>
              {children}
            </Container>
          </main>

          <footer>
            <Container fluid={'lg'}>
              <Footer/>
            </Container>
          </footer>
        </div>
      </DirectorContextProvider>
    </LoginContextProvider>
  )
}

export default DirectorLayout;
