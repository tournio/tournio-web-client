import {useRouter} from "next/router";
import {Row, Col} from "react-bootstrap";

import {useTheTournament} from "../../utils";
import InformationLayout from "../../components/Layout/InformationLayout/InformationLayout";
import TournamentLogo from "../../components/Registration/TournamentLogo/TournamentLogo";
import Contacts from "../../components/Registration/Contacts/Contacts";

import classes from "../../components/Registration/TournamentDetails/TournamentDetails.module.scss";
import Heading from "../../components/Registration/TournamentDetails/Heading";
import RegisterButtons from "../../components/Registration/TournamentDetails/RegisterButtons";
import PayButton from "../../components/Registration/TournamentDetails/PayButton";
import Shifts from "../../components/Registration/TournamentDetails/Shifts";
import YouWillNeed from "../../components/Registration/TournamentDetails/YouWillNeed";
import StateBanners from "../../components/Registration/TournamentDetails/StateBanners";
import LoadingMessage from "../../components/ui/LoadingMessage/LoadingMessage";
import ErrorAlert from "../../components/common/ErrorAlert";
import TraditionalPriceBreakdown from "../../components/Registration/TournamentDetails/TraditionalPriceBreakdown";
// import EventPriceBreakdown from "../../components/Registration/TournamentDetails/EventPriceBreakdown";

const Page = () => {
  const router = useRouter();
  const { identifier } = router.query;

  const {tournament, loading, error} = useTheTournament(identifier);

  if (error) {
    return (
      <div>
        <ErrorAlert message={error}/>
      </div>
    );
  }

  if (loading || !tournament) {
    return (
      <div>
        <LoadingMessage message={'Loading the tournament'}/>
      </div>
    )
  }

  const registeringWithoutPayments = !!tournament.config.registration_without_payments;

  return (
    <div className={classes.TournamentDetails}>
      <Row>
        <Col xs={12}>
          <StateBanners tournament={tournament}/>
        </Col>
      </Row>
      <Row>
        <Col xs={{order: 2}} md={{span: 4, order: 1}}>
          <div className={'d-none d-md-flex justify-content-center'}>
            <TournamentLogo url={tournament.imageUrl}/>
          </div>
          <Contacts tournament={tournament}/>
        </Col>
        <Col xs={{order: 1}} md={{span: 8, order: 2}}>
          <div className={'d-flex justify-content-start align-items-start'}>
            <TournamentLogo url={tournament.imageUrl}
                            additionalClasses={'col-4 pe-2 d-md-none'}/>
            <Heading tournament={tournament}/>
          </div>

          <div className={'d-flex'}>
            {!registeringWithoutPayments && (
              <div className={'flex-fill w-100 me-3'}>
                <div className={classes.Details}>
                  <TraditionalPriceBreakdown tournament={tournament}/>
                  {/*<EventPriceBreakdown tournament={tournament}/>*/}
                </div>
              </div>
            )}
            <div className={'d-none d-xl-block flex-shrink-1'}>
              <YouWillNeed/>
            </div>
          </div>

          {!registeringWithoutPayments && <PayButton disabled={!tournament.config.accept_payments} />}
          <RegisterButtons tournament={tournament}/>

          <div className={'d-xl-none mt-3'}>
            <YouWillNeed tournament={tournament}/>
          </div>
          <div className={'mt-4'}>
            <Shifts tournament={tournament}/>
          </div>
        </Col>
      </Row>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <InformationLayout>
      {page}
    </InformationLayout>
  );
}

export default Page;
