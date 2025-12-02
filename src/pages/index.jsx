import Image from "next/image";

import {useThemeContext} from "../store/ThemeContext";
import logoImage from "../images/tournio-logo.png";
import logoImageDark from "../images/tournio-logo-inverted-gray.png";

import FrontLayout from '../components/Layout/FrontLayout/FrontLayout';
import {useClientReady} from "../utils";

const Page = () => {
  const {theme} = useThemeContext();

  const ready = useClientReady();
  if (!ready) {
    return null;
  }

  return (
    <div>
      <div className="row offset-lg-3 col-lg-6">
        <div className="pb-2 pb-md-0">
          <div className="mb-3 position-relative">
            {theme.active === 'light' &&
              <Image src={logoImage}
                     alt={"Tourn.io logo"}
                     width={800}
                     height={169}
                     sizes={'100vw'}
                     style={{
                       width: '100%',
                       height: 'auto',
                     }}
              />
            }
            {theme.active === 'dark' &&
              <Image src={logoImageDark}
                     alt={"Tourn.io logo"}
                     width={800}
                     height={166}
                     sizes={'100vw'}
                     style={{
                       width: '100%',
                       height: 'auto',
                     }}
              />
            }
          </div>
        </div>
      </div>
      <div className="row offset-lg-3 col-lg-6">
        <h1>Thanks for ten great years!</h1>
        <p>
          Tourn.io was a registration system for IGBO bowling tournaments that aimed to be easy to use for both bowlers and committee members alike, with easy setup, testing, registration, administration, and reporting; plus, in later years, a reliable payments integration via Stripe.
        </p>
        <p>
          From the start, Tourn.io was intended as a bridge from a previous system (or no system at all, in the case of some tournaments) to a new one provided by IGBO for all its member tournaments to use. That system now exists. So, even though it&apos;s hard to say goodbye, Tourn.io has fulfilled its purpose and will remain closed indefinitely.
        </p>
        <hr />
        <p>
          Building and maintaining this application was a labor of love, but it was also a way for me to keep my technical skills sharp, both after I took on a leadership role at work, and after I stopped working due to a life-changing illness and permanent disability.
        </p>
        <p>
          I want to issue a heartfelt <strong>thank you</strong> to all the tournament directors I got to work with over the past decade, and even those I didn&apos;t get to work with. It&apos;s been a fantastic learning experience for me, and I hope the feeling is mutual. I want to especially call out the directors of the
          <a className={"mx-1"} href={"https://www.bigdclassic.com/"}>
            Big D Classic
          </a>
          tournament, who graciously let me try out the first version on them.
        </p>
        <p>
          Here&apos;s to IGBO growing and continuing to provide a safe space for queer bowlers everywhere!
        </p>
        <p>
          In fellowship,
          <br />
          <a href={"mailto:scott@stebleton.net"}>
            Scott Stebleton
          </a>
        </p>
      </div>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <FrontLayout showHomeLink={true}>
      {page}
    </FrontLayout>
  );
}

export default Page;
